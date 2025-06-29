require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
app.use(cookieParser());
const nodemailer = require('nodemailer');
const bcryptjs = require('bcryptjs')
const admin_credential_model = require("../models/admin_credential_model");
const Scholarship_model = require('../models/Scholarship_model');


const adminLogin = (req, res) => {
    res.render('../Views/admin_credential')
}

const adminLoginPost = async (req, res) => {

    const { Email, Password } = req.body;
    const matchEmail = await admin_credential_model.findOne({ Email: Email })

    if (matchEmail) {
        const matchPassword = await bcryptjs.compare(Password, matchEmail.Password);

        if (matchPassword) {

            const token = await matchEmail.generateAdminToken();

            res.cookie('adminToken', token), {

                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            }

            return res.redirect('/pragatischolarship/admin-dashboard')
        }

        else {
            req.flash('error', 'Incorrect Email Or Password');
            return res.redirect('/pragatischolarship/admin-login')
        }
    }

    else {
        req.flash('error', 'Invalid Login Details');
        return res.redirect('/pragatischolarship/admin-login')
    }
}

const adminSignup = async (req, res) => {

    const adminSignupData = req.body;
    const new_admin_model = admin_credential_model(adminSignupData);
    await new_admin_model.save();

    if (adminSignupData.Password !== adminSignupData.confirmPassword) {

        req.flash('error', 'Passwords do not match. Please try again.');
        return res.redirect('/pragatischolarship/admin-login')
    }

    req.flash('success', `Signup successful. Welcome, ${new_admin_model.Name}!`);
    return res.redirect('/pragatischolarship/admin-login')

}

const adminDashboard = async (req, res) => {

    const adminSourse = await admin_credential_model.findById(req.adminId)

    const allCandidate = await Scholarship_model.find().sort({ _id: -1 });
    const totalCandidates = allCandidate.length;
    const PaymentCandidates = await allCandidate.filter((c) => c.paymnt_status === 'Success');
    const allPaymentCandidates = PaymentCandidates.length;

    const allApprovedCandidates = await allCandidate.filter((c) => c.scholarship_status === 'Approved');
    const totalApprovedCandidates = allApprovedCandidates.length;

    const allRejectedCandidates = allCandidate.filter((c) => c.scholarship_status === 'Rejected');
    const totalRejectedCandidates = allRejectedCandidates.length;

    res.render('../Views/admin_dashboard', { adminSourse, totalRejectedCandidates, allCandidate, totalCandidates, allPaymentCandidates, totalApprovedCandidates })
}

const downloadbankBook = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    const bookPath = path.join(__dirname, '../uploads', sourse.passbookFirstPage);
    res.download(bookPath);

}

const resultDownlod = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    const resultPath = path.join(__dirname, '../uploads', sourse.resultUpload);
    res.download(resultPath)
}

const downloadIncome = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    const incomePath = path.join(__dirname, '../uploads', sourse.incomeCertificate);
    res.download(incomePath);

}

const downlodAdmissionReceipt = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    const admissionPath = path.join(__dirname, '../uploads', sourse.admissionReceipt);
    res.download(admissionPath);


}

const downloadAttendence = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    const attendencePath = path.join(__dirname, '../uploads', sourse.attendanceCertificate);
    res.download(attendencePath);

}

const deleteCandidate = async (req, res) => {

    await Scholarship_model.findByIdAndDelete(req.params.id);
    req.flash('success', 'Candidate deleted successfully');
    return res.redirect('/pragatischolarship/admin-dashboard')

}

const makeVerification = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    sourse.verification = 'Verified';
    sourse.scholarship_status = 'Approved'
    await sourse.save();


    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.User,
            pass: process.env.Pass
        }
    });

    let mailOptions = {
        from: process.env.User,
        to: sourse.email,
        subject: 'Scholarship Verification',
        text: `Dear ${sourse.studentName}! \nYour Application is verified.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


    req.flash('success', 'candidate verified successfully');
    return res.redirect('/pragatischolarship/admin-dashboard')

}

const makePayment = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    sourse.paymnt_status = 'Success';
    sourse.scholarship_status = 'Approved'
    await sourse.save();


    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.User,
            pass: process.env.Pass
        }
    });

    let mailOptions = {
        from: process.env.User,
        to: sourse.email,
        subject: 'Scholarship Verification',
        text: `Dear ${sourse.studentName}! \nyour scholarship payment has been sent successfully`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


    req.flash('success', 'Payment complete succcessfully');
    return res.redirect('/pragatischolarship/admin-dashboard')

}

const makeApprove = async (req, res) => {

    const sourse = await Scholarship_model.findById(req.params.id);
    sourse.scholarship_status = 'Approved';
    await sourse.save();


    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.User,
            pass: process.env.Pass
        }
    });

    let mailOptions = {
        from: process.env.User,
        to: sourse.email,
        subject: 'Scholarship Verification',
        text: `Dear ${sourse.studentName}! \nyour scholarship application has been approved.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    req.flash('success', 'Candidate approved successfully');
    return res.redirect('/pragatischolarship/admin-dashboard')
}

const makeReject = async (req, res) => {


    const { rejectReason } = req.body;
    const sourse = await Scholarship_model.findById(req.params.id);

    sourse.scholarship_status = 'Rejected';
    sourse.reject_reason = rejectReason;
    await sourse.save();


    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.User,
            pass: process.env.Pass
        }
    });

    let mailOptions = {
        from: process.env.User,
        to: sourse.email,
        subject: 'Scholarship Verification',
        text: `Dear ${sourse.studentName}! \nyour scholarship application has been rejected because of ${rejectReason}.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


    console.log(sourse)

    req.flash('success', 'candidate rejected successfuly');
    return res.redirect('/pragatischolarship/admin-dashboard')

}


const logout = (req, res) => {

    res.clearCookie('adminToken');
    req.flash('success', 'Logout Successfuly');
    return res.redirect('/pragatischolarship/admin-login')
}



module.exports = { logout, makeReject, makeApprove, makePayment, makeVerification, deleteCandidate, downloadAttendence, downlodAdmissionReceipt, downloadIncome, resultDownlod, downloadbankBook, adminDashboard, adminSignup, adminLogin, adminLoginPost }