require('dotenv').config();
const nodemailer = require('nodemailer')
const exceljs = require('exceljs')
const qrcode = require('qrcode');
const express = require('express');
const path = require('path')
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const { PDFDocument } = require('pdf-lib');

const fs = require('fs/promises');

const bcryptjs = require('bcryptjs');
const admin_signup = require("../models/admin_signup");
const registry_model = require('../models/registry_model');

const adminLogin = (req, res) => {

    res.render('../Views/admin_credential')

}

const adminSignup = async (req, res) => {

    const adminSignupdata = req.body;

    const matchEmail = await admin_signup.findOne({ Email: adminSignupdata.Email });
    const matchMobile = await admin_signup.findOne({ Mobile: adminSignupdata.Mobile });

    if (matchEmail) {
        req.flash('error', 'Email alrewady exist')
        return res.redirect('/mmr-office/admin-login')
    }

    if (matchMobile) {
        req.flash('error', 'Mobile alrewady exist')
        return res.redirect('/mmr-office/admin-login')
    }

    const validMobilePattern = /^[6-9]\d{9}$/;
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;


    if (!validMobilePattern.test(adminSignupdata.Mobile)) {

        req.flash('error', 'Invalid mobile number');
        return res.redirect('/mmr-office/admin-login')
    }

    if (!strongPasswordPattern.test(adminSignupdata.Password)) {

        req.flash('error', 'Make Strong Password like : Abc123@');
        return res.redirect('/mmr-office/admin-login')

    }

    const new_adminSignup_model = admin_signup(adminSignupdata);
    await new_adminSignup_model.save();
    console.log(new_adminSignup_model);
    req.flash('success', 'Admin signup successfully');
    return res.redirect('/mmr-office/admin-login')
}

const adminLoginPost = async (req, res) => {

    const { Email, Password } = req.body;

    const matchEmail = await admin_signup.findOne({ Email: Email });

    if (matchEmail) {
        const matchPassword = await bcryptjs.compare(Password, matchEmail.Password);
        if (matchPassword) {

            const token = await matchEmail.adminTokenGenerate();

            res.cookie('adminToken', token), {

                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            }

            return res.redirect('/mmr-office-admin-dashboard')

        }
        else {

            req.flash('error', 'Incorrect Email or Password');
            return res.redirect('/mmr-office/admin-login')
        }
    }

    else {

        req.flash('error', 'Invalid login details');
        return res.redirect('/mmr-office/admin-login')
    }
}

const adminDashboard = async (req, res) => {

    const allCertificates = await registry_model.find();
    const adminSourse = await admin_signup.findById(req.adminId).populate('Registry');
    const totalCertificates = adminSourse.Registry.length;


    const currentMonthRegistry = allCertificates.filter((cer) => {

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const registryDate = new Date(cer.regDate);
        const currentRegistrationMonth = registryDate.getMonth();
        const currentRegistrionYear = registryDate.getFullYear();

        return currentMonth === currentRegistrationMonth && currentYear === currentRegistrionYear
    })

    const currentMonthTotalRegistry = currentMonthRegistry.length;

    const currentMonthRevenue = allCertificates.reduce((total, cert) => total + cert.certificate_amount, 0);

    const totalRevenue = allCertificates.reduce((total, cer) => total + cer.certificate_amount, 0)


    const everyMonthRevenue = await registry_model.aggregate([

        {
            $addFields: {

                converteddate: {
                    $toDate: '$regDate'
                },

            }
        },

        {
            $group: {

                _id: {


                    year: {

                        $year: '$converteddate'
                    },

                    month: {
                        $month: '$converteddate'
                    }

                },

                revenue: { $sum: { $ifNull: ["$certificate_amount", 200] } }

            }
        },

        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        }
    ])




    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formalPatteernRevenue = everyMonthRevenue.map((r) => {

        return {

            month: `${months[r._id.month - 1]} ${r._id.year}`,
            revenue: r.revenue
        }

    });


    res.render('../Views/admin_dashboard', { formalPatteernRevenue, totalRevenue, currentMonthRevenue, currentMonthTotalRegistry, adminSourse, allCertificates, totalCertificates })

}

const newCertificate = (req, res) => {

    res.render('../Views/new_certificate_form')
}

const newCertificatePost = async (req, res) => {

    const registryData = req.body;
    registryData.Joint_Photo = req.file.filename;

    const today = new Date();
    const currectYear = today.getFullYear();

    const brideGroomDOB = new Date(registryData.groomDOB);
    const BrodgroomYear = brideGroomDOB.getFullYear();

    const bridgroomYear = currectYear - BrodgroomYear;

    if (bridgroomYear < 22) {

        req.flash('error', 'Bridgroom age must be 22 years');
        return res.redirect('/mmr-office-admin-dashboard')

    }

    const bridDOB = new Date(registryData.brideDOB);
    const brideYear = bridDOB.getFullYear();

    const currentbrideYear = currectYear - brideYear;

    if (currentbrideYear < 18) {

        req.flash('error', 'Bride age must be 18 years');
        return res.redirect('/mmr-office-admin-dashboard')
    }



    const new_registryModel = registry_model(registryData);
    await new_registryModel.save();

    const adminSourse = await admin_signup.findById(req.adminId);
    adminSourse.Registry.push(new_registryModel._id);
    await adminSourse.save();


    req.flash('success', 'New Registry Addede syccessfully');
    return res.redirect('/mmr-office-admin-dashboard')


}

const downloadJointPhoto = async (req, res) => {

    const imageSourse = await registry_model.findById(req.params.id);

    const imagepath = path.join(__dirname, '../uploads', imageSourse.Joint_Photo);

    res.download(imagepath, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }
    });

}

const downloadCertificate = async (req, res) => {
    try {
        const registrySourse = await registry_model.findById(req.params.id);

        // Generate Barcode Buffer
        /* const generateQRCode = (text) => {
             return qrcode.toBuffer(text, { type: 'png', width: 200, height: 200 });
         };*/

        async function CreatePdf(input, registrySourse) {
            const existingPdfBytes = await fs.readFile(input);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const form = pdfDoc.getForm();

            // Fill Form Fields
            form.getTextField('groomName').setText(registrySourse.groomName || '');
            form.getTextField('groomFather').setText(registrySourse.groomFather || '');
            form.getTextField('groomVillage').setText(registrySourse.groomVillage || '');
            form.getTextField('groomPost').setText(registrySourse.groomPost || '');
            form.getTextField('groomPS').setText(registrySourse.groomPS || '');
            form.getTextField('groomDist').setText(registrySourse.groomDist || '');
            form.getTextField('groomPin').setText(registrySourse.groomPin || '');
            form.getTextField('groomDOB').setText(registrySourse.groomDOB || '');
            form.getTextField('brideName').setText(registrySourse.brideName || '');
            form.getTextField('brideFather').setText(registrySourse.brideFather || '');
            form.getTextField('bridePost').setText(registrySourse.bridePost || '');
            form.getTextField('bridePS').setText(registrySourse.bridePS || '');
            form.getTextField('brideDist').setText(registrySourse.brideDist || '');
            form.getTextField('bridePin').setText(registrySourse.bridePin || '');
            form.getTextField('brideDOB').setText(registrySourse.brideDOB || '');
            form.getTextField('marriageDate').setText(registrySourse.marriageDate || '');
            form.getTextField('regDate').setText(registrySourse.regDate || '');
            form.getTextField('mohor').setText(registrySourse.mohor || '');
            form.getTextField('place').setText(registrySourse.place || '');
            form.getTextField('vol_no').setText(registrySourse.vol_no || '');
            form.getTextField('page_no').setText(registrySourse.page_no || '');

            const firstPage = pdfDoc.getPage(0);

            // Add Joint Photo
            const imagePath = path.join(__dirname, '../uploads', registrySourse.Joint_Photo);
            const imageBytes = await fs.readFile(imagePath);
            const fileExtension = path.extname(registrySourse.Joint_Photo).toLowerCase();
            let image;

            if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
                image = await pdfDoc.embedJpg(imageBytes);
            } else if (fileExtension === '.png') {
                image = await pdfDoc.embedPng(imageBytes);
            }

            firstPage.drawImage(image, {
                x: 40,
                y: 700,
                width: 80,
                height: 80,
            });

            // ✅ Generate and Add Barcode


            const generateQRCode = (text) => {

                return qrcode.toBuffer(text, { type: 'png' })
            }


            const qrText = `Groom Name : ${registrySourse.groomName}\nFater Name : ${registrySourse.groomFather}\nVillage :${registrySourse.groomVillage}\nPost : ${registrySourse.groomPost}\nPS : ${registrySourse.groomPS}\nDist : ${registrySourse.groomDist}\nPin : ${registrySourse.groomPin}\nDOB : ${registrySourse.groomDOB}\nBride Name : ${registrySourse.brideName}\nFather Name : ${registrySourse.brideFather}\nVillage : ${registrySourse.brideVillage}\nPost : ${registrySourse.bridePost}\nPS : ${registrySourse.bridePS}\nDist : ${registrySourse.brideDist}\nPin : ${registrySourse.bridePin}\nDOB : ${registrySourse.brideDOB}\nMarriage Date : ${registrySourse.marriageDate}\nRegistry Date : ${registrySourse.regDate}\nMohor : ${registrySourse.mohor}\nPlace : ${registrySourse.place} `;

            const bufferQRcode = await generateQRCode(qrText)

            const embetedImge = await pdfDoc.embedPng(bufferQRcode);

            firstPage.drawImage(embetedImge, { x: 460, y: 700, width: 80, height: 80 })

            return await pdfDoc.save();
        }

        const pdfBytes = await CreatePdf('./certificate_format/Cerrtificate (17) (3).pdf', registrySourse);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Marriage_Certificate.pdf"');
        res.end(pdfBytes);

    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).send('Error generating certificate');
    }
};

const viewCertificate = async (req, res) => {


    const registrySourse = await registry_model.findById(req.params.id)

    res.render('../Views/view_certificate', { registrySourse })

}

const deleteCertificate = async (req, res) => {

    await registry_model.findByIdAndDelete(req.params.id);
    req.flash('success', 'certificate deleted successfull');
    return res.redirect('/mmr-office-admin-dashboard')

}

const downloadAllRegistryexcel = async (req, res) => {

    const allRegistry = await registry_model.find();

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('allRegistry');

    worksheet.addRow(['Sl No', 'groomName', 'groomFather', 'groomVillage', 'groomPost', 'groomPS', 'groomDist', 'groomPin', 'groomDOB', 'brideName', 'brideFather', 'brideVillage', 'bridePost', 'bridePS', 'brideDist', 'bridePin', 'brideDOB', 'marriageDate', 'regDate', 'mohor', 'Place', 'Vol No', 'Page No'])

    allRegistry.forEach((r, index) => {

        worksheet.addRow([index + 1, r.groomName, r.groomFather, r.groomVillage, r.groomPost, r.groomPS, r.groomDist, r.groomPin, r.groomDOB, r.brideName, r.brideFather, r.brideVillage, r.bridePost, r.bridePS, r.brideDist, r.bridePin, r.brideDOB, r.marriageDate, r.regDate, r.mohor, r.Place,
        r.vol_no, r.page_no])
    })

    res.setHeader("Content-Disposition", "attachment; filename=teachers.xlsx");
    await workbook.xlsx.write(res);
    res.end();


}

const editProfile = async (req, res) => {

    const adminSourse = await admin_signup.findById(req.adminId)

    res.render('../Views/edit_admin_profile', { adminSourse })

}

const editProfilePost = async (req, res) => {

    const editAdminProfile = req.body;

    await admin_signup.findByIdAndUpdate(req.adminId, editAdminProfile);
    req.flash('success', 'Admin Profile updated successfully');
    return res.redirect('/mmr-office-admin-dashboard')

}

const forgetPassword = (req, res) => {

    res.render('../Views/forget_Password')
}

const forgetPasswordPost = async (req, res) => {

    const { Email } = req.body;

    const matchEmail = await admin_signup.findOne({ Email: Email });

    if (matchEmail) {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        var mailOptions = {
            from: process.env.User,
            to: matchEmail.Email,
            subject: 'Forget Password Notification',
            text: `Please reset your password using this follow link : http://localhost:3000/mmr-office/reset-password/${matchEmail._id}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });


        req.flash('success', 'Please check your Email');
        return res.redirect('/mmr-office/forget-password')

    }

    else {

        req.flash('error', 'Yo are not admin');
        return res.redirect('/mmr-office/forget-password')
    }

}

const resetPassword = (req, res) => {

    res.render('../Views/reset_password')

}

const resetPasswordPost = async (req, res) => {

    const { Email, Password } = req.body;
    const matchEmail = await admin_signup.findOne({ Email: Email });

    if (matchEmail) {

        matchEmail.Password = Password;
        await matchEmail.save();
    }

    req.flash('success', 'Password updated successfully');
    return res.redirect('/mmr-office/admin-login')

}

const editCertificate = async (req, res) => {

    const registrySourse = await registry_model.findById(req.params.id)

    res.render('../Views/edit_certificate', { registrySourse })

}

const editCertificatePost = async (req, res) => {

    const editCertificate = req.body;

    if (req.file) {

        editCertificate.Joint_Photo = req.file.filename;
    }

    await registry_model.findByIdAndUpdate(req.params.id, editCertificate);

    req.flash('success', 'Certifiacte Updeted successfull');
    return res.redirect('/mmr-office-admin-dashboard')

}

module.exports = { editCertificatePost, editCertificate, resetPasswordPost, resetPassword, forgetPasswordPost, forgetPassword, editProfilePost, editProfile, downloadAllRegistryexcel, deleteCertificate, viewCertificate, downloadCertificate, downloadJointPhoto, newCertificatePost, newCertificate, adminLogin, adminSignup, adminLoginPost, adminDashboard }; 