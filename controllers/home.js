require('dotenv').config();
const academic_model = require("../models/academic_model");
const admin_model = require('../models/admin_model');
const admission_model = require("../models/admission_model");
const course_model = require("../models/course_model");
const nodemailer = require('nodemailer');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs/promises');
const qrcode = require('qrcode');
const stream_model = require('../models/stream_model');
const sem_model = require('../models/sem_model');
const notice_model = require('../models/notice_model');

const homeCobntroller = async (req, res) => {

    const allNotice = await notice_model.find();

    res.render('../Views/home', { allNotice })
}

const admissionForm = async (req, res) => {

    const allCourse = await course_model.find();
    const allAcademicYear = await academic_model.find();
    const streams = await stream_model.find();
    const allSems = await sem_model.find();

    res.render('../Views/admission_form', { allSems, allCourse, allAcademicYear, streams })
}

const admissionFormPost = async (req, res) => {

    const admissionData = req.body;

    const mobilPattern = /^[6-9]\d{9}$/;
    const adhaarPattern = /^[2-9]\d{11}$/

    const existEmail = await admission_model.findOne({ Email: admissionData.Email });
    const existMobile = await admission_model.findOne({ Mobile: admissionData.Mobile });

    if (existEmail) {

        req.flash('error', 'Email already exist');
        return res.redirect('/juk/admision-form')
    }

    if (existMobile) {

        req.flash('error', 'Mobile already exist');
        return res.redirect('/juk/admision-form')
    }

    if (!mobilPattern.test(admissionData.Mobile)) {

        req.flash('error', 'Invalid Mobile Number');
        return res.redirect('/juk/admision-form')
    }




    if (req.files['marksheet']) {
        admissionData.marksheet = req.files['marksheet'][0].filename;
    };

    if (req.files['migrationCertificate']) {

        admissionData.migrationCertificate = req.files['migrationCertificate'][0].filename;
    };

    if (req.files['profileImage']) {
        admissionData.profileImage = req.files['profileImage'][0].filename;
    };

    if (req.files['raggingAffidavit']) {
        admissionData.raggingAffidavit = req.files['raggingAffidavit'][0].filename;
    };

    if (req.files['paymentScreenshot']) {
        admissionData.paymentScreenshot = req.files['paymentScreenshot'][0].filename;
    };


    const generateRollNoKamil = async () => {

        const today = new Date();
        const currentYear = today.getFullYear();
        const totalKamil = await admission_model.find({ course: 'Kamil' }).countDocuments();
        const allKamilcandidate = String(totalKamil + 1).padStart(4, '0');

        return `KAMIL${currentYear}${allKamilcandidate}`;

    };

    const generateRollNoTitle = async () => {

        const today = new Date();
        const currentYear = today.getFullYear();
        const titleStudent = await admission_model.find({ course: 'Title' });

        const incremenetCandidate = String(titleStudent + 1).padStart(4, '0');
        return `TITLE${currentYear}${incremenetCandidate}`;
    }


    if (admissionData.course === 'Kamil') {

        admissionData.roll_no = await generateRollNoKamil();
    }

    else {

        admissionData.roll_no = await generateRollNoTitle();
    }

    const new_admission_model = admission_model(admissionData);
    await new_admission_model.save();



    const admins = await admin_model.find();

    const adminEmail = await admins.map((a) => a.Email.split(','))

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.User,
            pass: process.env.Pass
        }
    });

    const mailOptions = {
        from: process.env.User,
        to: adminEmail,
        subject: 'Student Admision',
        text: `Name : ${admissionData.Name} \nMobile : ${admissionData.Mobile} \n
        Check Details : http://localhost:3000/JUK/admin-dashboard`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


    req.flash('success', 'form submitted succesfully');
    return res.redirect(`/download-addmission-receipt/${new_admission_model._id}`)

}

const admissionReceipt = async (req, res) => {

    const studentSourse = await admission_model.findById(req.params.id)

    res.render('../Views/download_admission_receipt', { studentSourse })

}

const downloadReceipt = async (req, res) => {

    try {

        const student_sourse = await admission_model.findById(req.params.id);

        const inputPdfPath = path.join(__dirname, '../admission_receipt_form/JUK (1).pdf');
        const existingPdfBytes = await fs.readFile(inputPdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        form.getTextField('Name').setText(student_sourse.Name || '');
        form.getTextField('DOB').setText(student_sourse.DOB || '');
        form.getTextField('Gender').setText(student_sourse.Gender || '');
        form.getTextField('Religion').setText(student_sourse.Religion || '');
        form.getTextField('Category').setText(student_sourse.Category || '');
        form.getTextField('adhar_no').setText(student_sourse.adhar_no || '');
        form.getTextField('Mobile').setText(student_sourse.Mobile || '');
        form.getTextField('Email').setText(student_sourse.Email || '');
        form.getTextField('permanentAddress').setText(student_sourse.permanentAddress || '');
        form.getTextField('course').setText(student_sourse.course || '');
        form.getTextField('stream').setText(student_sourse.stream || '');
        form.getTextField('academicYear').setText(student_sourse.academicYear || '');
        form.getTextField('studyMode').setText(student_sourse.studyMode || '');
        form.getTextField('lastQualification').setText(student_sourse.lastQualification || '');
        form.getTextField('percentage').setText(student_sourse.percentage || '');

        const firstPage = pdfDoc.getPage(0);

        const imagePath = path.join(__dirname, '../uploads', student_sourse.profileImage);
        const imageBytes = await fs.readFile(imagePath);
        const fileExtension = path.extname(student_sourse.profileImage).toLowerCase();
        let image;

        if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
            image = await pdfDoc.embedJpg(imageBytes);
        } else if (fileExtension === '.png') {
            image = await pdfDoc.embedPng(imageBytes);
        }

        firstPage.drawImage(image, {
            x: 470,
            y: 550,
            width: 80,
            height: 80,
        });


        const generateQRcode = (text) => {

            return qrcode.toBuffer(text, { type: 'png' })

        };

        const contentQR = `Name : ${student_sourse.Name} \nDOB : ${student_sourse.DOB}`;

        const qrCode = await generateQRcode(contentQR);

        const embetedQR = await pdfDoc.embedPng(qrCode);

        firstPage.drawImage(embetedQR, { x: 45, y: 15, width: 80, height: 80 });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="admission_receipt.pdf"');
        res.end(pdfBytes);
    }

    catch (err) {

        console.log('this is admission receipt generating error', err)
    }


}

module.exports = { downloadReceipt, admissionReceipt, admissionFormPost, homeCobntroller, admissionForm };