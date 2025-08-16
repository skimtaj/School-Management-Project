const express = require('express');
const route = express.Router();
const auth = require('../auth/admin_auth')

const { resetPasswordPost, resetPassword, forgetPasswordPost, forgetPassword, verificationPost, verification, logout, noticePostPost, noticePost, downloadStudentExcel, downloadResult, deleteResult, addSemesterPost, addSemester, addStreamPost, addStream, insertMarksPost, studentResult, insertMarks, addSubjectPost, addSubject, deleteStudent, studentVerification, viewStudent, academicYear, addAcademicPost, addAcademic, editCoursePost, editCourse, addCoursePost, course, addCourse, admindashbaord, adminSignupPost, adminLogin, adminLoginPost } = require('../controllers/admin_cobntrollers')


route.get('/JUK/admin-login', adminLogin);
route.post('/JUK/admin-login', adminLoginPost)

route.post('/JUK/admin-signup', adminSignupPost);

route.get('/JUK/admin-dashboard', auth, admindashbaord);

route.get('/JUK/course', auth, course)

route.get('/JUK/add-course', auth, addCourse);
route.post('/JUK/add-course', auth, addCoursePost);

route.get('/JUK/edit-course/:id', auth, editCourse);
route.post('/JUK/edit-course/:id', auth, editCoursePost)

route.get('/JUK/add-academic', auth, addAcademic)
route.post('/JUK/add-academic', auth, addAcademicPost);

route.get('/JUK/academic-year', auth, academicYear)

route.get('/JUK/view-student/:id', auth, viewStudent);

route.get('/student-verification/:id', studentVerification);

route.get('/delete-student/:id', deleteStudent);

route.get('/JUK/add-subject', auth, addSubject);

route.post('/JUK/add-subject', auth, addSubjectPost);

route.get('/JUK/insert-marks-form', auth, insertMarks);
route.post('/JUK/insert-marks-form', auth, insertMarksPost);

route.get('/student-result/:id', studentResult);

route.get('/JUK/stream/add-new', auth, addStream);

route.post('/JUK/stream/add-new', auth, addStreamPost);

route.get('/JUK/semester/add-new', auth, addSemester);
route.post('/JUK/semester/add-new', auth, addSemesterPost);

route.get('/delete-result/:id', deleteResult);

route.get('/download-result/:id', downloadResult);

route.get('/download-student-excel', downloadStudentExcel);

route.get('/JUK/notice/add-new', auth, noticePost)
route.post('/JUK/notice/add-new', auth, noticePostPost);

route.get('/verification/:id', verification)
route.post('/verification/:id', verificationPost);

route.get('/JUK/forget-password', forgetPassword);
route.post('/JUK/forget-password', forgetPasswordPost);

route.get('/reset-password/:id', resetPassword)
route.post('/reset-password/:id', resetPasswordPost)





route.get('/logout', logout)





module.exports = route; 