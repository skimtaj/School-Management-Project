const Scholarship_model = require("../models/Scholarship_model");
const { PDFDocument } = require('pdf-lib');

const fs = require('fs/promises');
const qrcode = require("qrcode");


const home = (req, res) => {

    res.render('../Views/home')
}

const applyScholarship = (req, res) => {

    res.render('../Views/apply_form')

}

const applyScholarshipPost = async (req, res) => {

    const scholarshipData = req.body;

    if (req.files['passbookFirstPage']) {
        scholarshipData.passbookFirstPage = req.files['passbookFirstPage'][0].filename;
    }

    if (req.files['profileImage']) {
        scholarshipData.profileImage = req.files['profileImage'][0].filename;
    }

    if (req.files['resultUpload']) {
        scholarshipData.resultUpload = req.files['resultUpload'][0].filename;
    }

    if (req.files['incomeCertificate']) {
        scholarshipData.incomeCertificate = req.files['incomeCertificate'][0].filename;
    }

    if (req.files['admissionReceipt']) {
        scholarshipData.admissionReceipt = req.files['admissionReceipt'][0].filename;
    }

    if (req.files['attendanceCertificate']) {
        scholarshipData.attendanceCertificate = req.files['attendanceCertificate'][0].filename;
    }


    const existEmail = await Scholarship_model.findOne({ Email: scholarshipData.email });
    const existMobile = await Scholarship_model.findOne({ Mobile: scholarshipData.mobile });


    const today = new Date();
    const currectYear = today.getFullYear();

    const appliedDate = new Date(scholarshipData.doa);
    const appliedYear = appliedDate.getFullYear();

    const applicantAge = currectYear - appliedYear;


    /* if (applicantAge < 11) {
        req.flash('error', 'Applicat age must be above 11');
        return res.redirect('/pragatischolarship/apply-scholarship')
    } */

    if (existEmail) {
        req.flash('error', 'Email already exist');
        return res.redirect('/pragatischolarship/apply-scholarship')
    }

    if (existMobile) {
        req.flash('error', 'Mobile number already exist');
        return res.redirect('/pragatischolarship/apply-scholarship')
    }

    if (scholarshipData.familyIncome > 100000) {
        req.flash('error', 'Annual family income below ₹1,00,000');
        return res.redirect('/pragatischolarship/apply-scholarship')
    }

    if (scholarshipData.obtainedMarks < 70) {

        req.flash('error', 'Ontained marks must be above 70%');
        return res.redirect('/pragatischolarship/apply-scholarship')
    }

    if (scholarshipData.pom < 75) {

        req.flash('error', 'Attendance marks must be above 75%');
        return res.redirect('/pragatischolarship/apply-scholarship')
    }

    const generateApplicationNo = async () => {

        const today = new Date();
        const currectYear = today.getFullYear();
        const count = await Scholarship_model.countDocuments()
        const serialNo = String(count + 1).padStart(4, '0')

        return `PS-${currectYear}-${serialNo}`
    }

    scholarshipData.ApplicationId = await generateApplicationNo();

    const new_scholarship_model = Scholarship_model(scholarshipData);
    await new_scholarship_model.save();

    console.log(new_scholarship_model.ApplicationId)


    req.flash('success', 'Thank you! Your scholarship application has been submitted successfully.');
    return res.redirect(`/pragatischolarship/download-application/${new_scholarship_model._id}`);

}

const downloadAppliction = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id)

    res.render('../Views/download_application', { sourse })

}

const trackApplicationPost = async (req, res) => {

    const { applicationId, dob, mobile } = req.body;

    const matchApplicationId = await Scholarship_model.findOne({ ApplicationId: applicationId });

    if (matchApplicationId) {

        const matchDOB = await Scholarship_model.findOne({ dob: dob });

        if (matchDOB) {

            const matchMobile = await Scholarship_model.findOne({ mobile: mobile });

            if (matchMobile) {

                return res.redirect(`/pragatischolarship/application-status/${matchMobile._id}`)

            }

            else {

                req.flash('error', 'Mobile is not matching');
                return res.redirect('/pragatischolarship/track-application')
            }

        }

        else {

            req.flash('error', 'DOB is not matching');
            return res.redirect('/pragatischolarship/track-application')
        }
    }

    else {

        req.flash('error', 'Application id is not matching');
        return res.redirect('/pragatischolarship/track-application')

    }

}

const trackApplication = async (req, res) => {

    res.render('../Views/track_application',)

}

const applicationStatus = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id)

    res.render('../Views/scholarship_status', { sourse })

}

const downloadButton = async (req, res) => {


    try {
        const sourse = await Scholarship_model.findById(req.params.id);

        async function CreatePdf(input, sourse) {
            const existingPdfBytes = await fs.readFile(input);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const form = pdfDoc.getForm();

            form.getTextField('ApplicationId').setText(sourse.ApplicationId || '');
            form.getTextField('studentName').setText(sourse.studentName || '');
            form.getTextField('dob').setText(sourse.dob || '');
            form.getTextField('gender').setText(sourse.gender || '');
            form.getTextField('email').setText(sourse.email || '');
            form.getTextField('mobile').setText(sourse.mobile || '');
            form.getTextField('fatherName').setText(sourse.fatherName || '');
            form.getTextField('familyIncome').setText(sourse.familyIncome || '');
            form.getTextField('fullAddress').setText(sourse.fullAddress || '');
            form.getTextField('currentClass').setText(sourse.currentClass || '');
            form.getTextField('currentBoard').setText(sourse.currentBoard || '');
            form.getTextField('previousInstitute').setText(sourse.previousInstitute || '');
            form.getTextField('previousClass').setText(sourse.previousClass || '');
            form.getTextField('boardName').setText(sourse.boardName || '');
            form.getTextField('passingYear').setText(sourse.passingYear || '');
            form.getTextField('pom').setText(sourse.pom || '');
            form.getTextField('doa').setText(sourse.doa || '');
            form.getTextField('accountHolderName').setText(sourse.accountHolderName || '');
            form.getTextField('accountNumber').setText(sourse.accountNumber || '');
            form.getTextField('bankName').setText(sourse.bankName || '');
            form.getTextField('branchName').setText(sourse.branchName || '');
            form.getTextField('ifscCode').setText(sourse.ifscCode || '');
            form.getTextField('accountType').setText(sourse.accountType || '');

            const firstPage = pdfDoc.getPage(0);

            const generateQRCode = (text) => {

                return qrcode.toBuffer(text, { type: 'png' })
            }

            const qrText = `/pragatischolarship/track-application`;
            const generateQRCodeWithValue = await generateQRCode(qrText);
            const embetedQR = await pdfDoc.embedPng(generateQRCodeWithValue);
            firstPage.drawImage(embetedQR, { x: 50, y: 50, width: 80, height: 80 })
            return await pdfDoc.save();
        }

        const pdfBytes = await CreatePdf('./application_format/Application_Form (1).pdf', sourse);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Application Form.pdf"');
        res.end(pdfBytes);

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).send('Error generating certificate');
    }
}

const awardLetter = async (req, res) => {

    try {

        const sourse = await Scholarship_model.findById(req.params.id);

        async function CreatePdf(input, sourse) {
            const existingPdfBytes = await fs.readFile(input);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const form = pdfDoc.getForm();

            form.getTextField('studentName').setText(sourse.studentName || '');

            return await pdfDoc.save();
        }

        const pdfBytes = await CreatePdf('./application_format/Award Letter (1).pdf', sourse);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="award_letter.pdf"');
        res.end(pdfBytes);

    }

    catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).send('Error generating certificate');
    }

}

module.exports = { awardLetter, downloadButton, applicationStatus, trackApplication, trackApplicationPost, downloadAppliction, applyScholarshipPost, home, applyScholarship };
