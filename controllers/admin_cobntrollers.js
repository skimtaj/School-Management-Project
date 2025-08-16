
const bcryptjs = require('bcryptjs')
require('dotenv').config();
const express = require('express');
const app = express();

const admin_model = require("../models/admin_model");
const course_model = require('../models/course_model');
const academic_model = require('../models/academic_model');
const admission_model = require('../models/admission_model');
const subject_insert_model = require('../models/subject_insert_model');
const result_model = require('../models/result_model');
const stream_model = require('../models/stream_model');
const sem_model = require('../models/sem_model');

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs/promises');
const path = require('path');
const exceljs = require('exceljs');
const notice_model = require('../models/notice_model');
const nodemailer = require('nodemailer');
const session = require('express-session');

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));



const adminLogin = (req, res) => {

    res.render('../Views/admin_credential')
}

const adminLoginPost = async (req, res) => {

    const { Email, Password } = req.body;

    const matchEmail = await admin_model.findOne({ Email: Email });

    if (matchEmail) {

        const matchPassword = await bcryptjs.compare(Password, matchEmail.Password);

        if (matchPassword) {

            const code = Math.floor(100000 + Math.random() * 900000);
            req.session.verificationcode = code

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.User,
                    pass: process.env.Pass
                }
            });

            let mailOptions = {
                from: process.env.User,
                to: matchEmail.Email,
                subject: 'Verification Code',
                text: `Your code ${code}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            return res.redirect(`/Verification/${matchEmail._id}`)
        }

        else {
            req.flash('error', 'Incorrcet email or password');
            return res.redirect('/JUK/admin-login')
        }
    }

    else {
        req.flash('error', 'Invalid login details');
        return res.redirect('/JUK/admin-login')
    }

}

const adminSignupPost = async (req, res) => {

    const adminInfo = req.body;

    const mobilePattern = /^[6-9][0-9]{9}$/;

    if (!mobilePattern.test(adminInfo.Mobile)) {
        req.flash('error', 'Mobile number must be valid');
        return res.redirect('/JUK/admin-login');
    }


    const matchEmail = await admin_model.findOne({ Email: adminInfo.Email });

    if (matchEmail) {
        req.flash('error', 'Email already exist');
        return res.redirect('/JUK/admin-login');
    }


    const matchMobile = await admin_model.findOne({ Mobile: adminInfo.Mobile });

    if (matchMobile) {

        req.flash('error', 'Mobile already exist');
        return res.redirect('/JUK/admin-login');
    }

    const new_admin_model = admin_model(adminInfo);
    await new_admin_model.save();

    console.log(new_admin_model);

    req.flash('success', 'Admin signup successfully');
    return res.redirect('/JUK/admin-login');
}

const admindashbaord = async (req, res) => {


    let pageNo = parseInt(req.query.page) || 1;
    let limit = 5;
    const totalAdmission = await admission_model.countDocuments();

    const students = await admission_model.find().skip((pageNo - 1) * limit).limit(limit);

    const Student = await admission_model.find();
    const totalStudent = Student.length;

    const verified = await admission_model.find({ Status: 'Verified' });
    const totalVerified = verified.length;

    const pending = await admission_model.find({ Status: 'Pending' });

    const totalPending = pending.length;

    const allCourse = await course_model.find();


    res.render('../Views/admin_dashboard', { allCourse, totalPending, totalVerified, totalStudent, collections: students, currentPage: pageNo, previousPage: pageNo > 1, nextPage: pageNo * limit < totalAdmission })
}

const addCourse = (req, res) => {

    res.render('../Views/new_course')

};

const course = async (req, res) => {

    const allCourse = await course_model.find();


    res.render('../Views/courses', {  allCourse });

}

const addCoursePost = async (req, res) => {

    const courseData = req.body;
    const new_course_model = course_model(courseData);
    await new_course_model.save();

    req.flash('success', 'Course added successfully');
    return res.redirect('/JUK/course')
}

const editCourse = async (req, res) => {

    const course_sourse = await course_model.findById(req.params.id)

    res.render('../Views/edit_course', { course_sourse })

}

const editCoursePost = async (req, res) => {

    const courseData = req.body;
    await course_model.findByIdAndUpdate(req.params.id, courseData);

    req.flash('success', 'Course updated successfully');
    return res.redirect('/JUK/course')

}

const addAcademic = (req, res) => {

    res.render('../Views/add_academic')

}

const addAcademicPost = async (req, res) => {

    const academicData = req.body;

    const new_academic_model = academic_model(academicData);
    await new_academic_model.save();

    console.log(new_academic_model);

    req.flash('success', 'Academic Year added successfully');
    return res.redirect('/JUK/admin-dashboard')
}

const academicYear = async (req, res) => {

    const allAcademicYear = await academic_model.find()

    res.render('../Views/academic_year', { allAcademicYear })
}

const viewStudent = async (req, res) => {

    const admissionSourse = await admission_model.findById(req.params.id);

    res.render('../Views/view_student', { admissionSourse })
}

const studentVerification = async (req, res) => {

    const studentSourse = await admission_model.findById(req.params.id);
    studentSourse.Status = 'Verified';
    await studentSourse.save();

    req.flash('success', 'Student verified Successfully');
    return res.redirect('/JUK/admin-dashboard')
}

const deleteStudent = async (req, res) => {

    await admission_model.findByIdAndDelete(req.params.id);
    req.flash('success', 'Student deleted successfully');
    return res.redirect('/JUK/admin-dashboard')
}

const addSubject = async (req, res) => {

    const allCourse = await course_model.find();

    res.render('../Views/insert_subject', { allCourse })

}

const addSubjectPost = async (req, res) => {

    const subData = req.body;
    const new_sub_model = subject_insert_model(subData);
    await new_sub_model.save();

    console.log(new_sub_model);

    req.flash('success', 'New subject Inserted successfully');
    return res.redirect('/JUK/admin-dashboard')

}

const insertMarks = async (req, res) => {

    const allCourse = await course_model.find();
    const allSubject = await subject_insert_model.find();
    const allSem = await sem_model.find();
    const allSream = await stream_model.find();
    const allStudents = await admission_model.find();


    res.render('../Views/insert_mark', { allStudents, allCourse, allSubject, allSream, allSem })

}

const studentResult = async (req, res) => {

    const studentSourse = await admission_model.findById(req.params.id).populate('result');

    res.render('../Views/student_result', { studentSourse })
}

const insertMarksPost = async (req, res) => {

    const marsheetData = req.body;
    const new_result_model = result_model(marsheetData);
    await new_result_model.save();


    const studentSourse = await admission_model.findOne({ roll_no: marsheetData.roll_no });

    studentSourse.result.push(new_result_model._id);
    await studentSourse.save();

    req.flash('success', 'Result inserted successfully');
    return res.redirect('/JUK/admin-dashboard')

}

const addStream = (req, res) => {

    res.render('../Views/insert_stream')

}

const addStreamPost = async (req, res) => {

    const stream = req.body;
    const new_stream_model = stream_model(stream);
    await new_stream_model.save();

    req.flash('success', 'New stream added successfully');
    return res.redirect('/JUK/admin-dashboard')
}

const addSemester = (req, res) => {

    res.render('../Views/insert_sem')
}

const addSemesterPost = async (req, res) => {

    const semData = req.body;
    const new_sem_model = sem_model(semData);
    await new_sem_model.save();

    req.flash('success', 'semester added semester');
    return res.redirect('/JUK/admin-dashboard')

}

const deleteResult = async (req, res) => {

    await result_model.findByIdAndDelete(req.params.id);
    req.flash('succes', 'Result deleted successfully');
    return res.redirect('/JUK/admin-dashboard')

}

const downloadResult = async (req, res) => {
    const studentSourse = await admission_model
        .findById(req.params.id)
        .populate('result');

    const inputPdfPath = path.join(__dirname, '../Result_format/Result.pdf');
    const existingPdfBytes = await fs.readFile(inputPdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const firstPage = pdfDoc.getPage(0);
    const { height } = firstPage.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    firstPage.drawText(`Name: ${studentSourse.Name}`, { x: 50, y: height - 240, size: 14, font });
    firstPage.drawText(`Roll No: ${studentSourse.roll_no}`, { x: 50, y: height - 260, size: 14, font });

    let yPos = height - 300;
    firstPage.drawText(`Subject`, { x: 50, y: yPos, size: 14, font });
    firstPage.drawText(`Marks`, { x: 300, y: yPos, size: 14, font });
    yPos -= 20;



    studentSourse.result.forEach((r) => {
        r.marksheet.forEach((m) => {
            firstPage.drawText(m.subject, { x: 50, y: yPos, size: 12, font });
            firstPage.drawText(m.mark.toString(), { x: 300, y: yPos, size: 12, font });
            yPos -= 20;
        });
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${studentSourse.Name}_result.pdf"`);
    res.send(Buffer.from(pdfBytes));
};

const downloadStudentExcel = async (req, res) => {

    try {

        const allStudent = await admission_model.find()
        const workbook = new exceljs.Workbook();
        const sheet = workbook.addWorksheet()

        sheet.addRow(['Roll No', 'Name', 'Mobile', 'Email', 'Course', 'Stream', 'Semester', 'Academic Year']);

        allStudent.forEach((s) => {

            sheet.addRow([s.roll_no, s.Name, s.Mobile, s.Email, s.course, s.stream, s.sem, s.academicYear])
        })

        res.setHeader("Content-Disposition", "attachment; filename=teachers.xlsx");
        await workbook.xlsx.write(res);
        res.end();

    }

    catch (err) {

        console.log('Student Exccel download error', err)
    }
}


const noticePost = (req, res) => {

    res.render('../Views/notice_form')

}

const noticePostPost = async (req, res) => {

    const noticeData = req.body;
    const new_notice_model = notice_model(noticeData);
    await new_notice_model.save();

    console.log(new_notice_model)

    req.flash('success', 'Notce published successfully');
    return res.redirect('/JUK/admin-dashboard')

}

const logout = (req, res) => {

    res.clearCookie('adminToken');
    req.flash('success', 'You are logout successfully');
    return res.redirect('/JUK/admin-login')
}

const verification = (req, res) => {

    res.render('../Views/vereification')
}

const verificationPost = async (req, res) => {

    const adminSourse = await admin_model.findById(req.params.id);

    const { code } = req.body;

    if (String(req.session.verificationcode) === String(code)) {
        delete req.session.verificationcode;

        const token = await adminSourse.generateadminToken();
        res.cookie('adminToken', token), {

            httpOnly: true,
            secure: true,
            maxAge: 365 * 24 * 60 * 60 * 1000,
        }

        return res.redirect('/JUK/admin-dashboard')
    }

    else {

        res.send('Incorrcet code')
    }
}

const forgetPassword = (req, res) => {

    res.render('../Views/forget_password')
}

const forgetPasswordPost = async (req, res) => {

    const { Email } = req.body;

    const adminSourse = await admin_model.findOne({ Email: Email });

    if (adminSourse) {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        const mailOptions = {
            from: process.env.User,
            to: adminSourse.Email,
            subject: 'Reset Password',
            text: `Please reset your password using this link:\nhttp://localhost:3000/reset-password/${adminSourse._id}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        req.flash('success', 'Please check your Email');
        return res.redirect('/JUK/forget-password')

    }

    else {

        req.flash('error', 'Email does not exist');
        return res.redirect('/JUK/forget-password')

    }

}


const resetPassword = (req, res) => {

    res.render('../Views/reset_password')
}

const resetPasswordPost = async (req, res) => {

    const { Email, newPassword } = req.body;
    const adminSourse = await admin_model.findOne({ Email: Email })

    if (adminSourse) {

        adminSourse.Password = newPassword;
        await adminSourse.save();
        req.flash('success', 'Password reset successfully');

        return res.redirect('/JUK/admin-login')

    }


}

module.exports = { resetPasswordPost, resetPassword, forgetPasswordPost, forgetPassword, verificationPost, verification, logout, noticePostPost, noticePost, downloadStudentExcel, downloadResult, deleteResult, addSemesterPost, addSemester, addStreamPost, addStream, insertMarksPost, studentResult, insertMarks, addSubjectPost, addSubject, deleteStudent, studentVerification, viewStudent, academicYear, addAcademicPost, addAcademic, editCoursePost, editCourse, addCoursePost, course, addCourse, admindashbaord, adminLoginPost, adminSignupPost, adminLogin }; 