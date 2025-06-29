const express = require('express');
const route = express.Router();
const { logout, makeReject, makeApprove, makePayment, makeVerification, deleteCandidate, downloadAttendence, downlodAdmissionReceipt, downloadIncome, resultDownlod, downloadbankBook, adminDashboard, adminSignup, adminLogin, adminLoginPost } = require('../controllers/admin_controllers')

const auth = require('../auth/admin_auth')

route.get('/pragatischolarship/admin-login', adminLogin);

route.post('/pragatischolarship/admin-login', adminLoginPost)

route.post('/pragatischolarship/admin-sinup', adminSignup);

route.get('/pragatischolarship/admin-dashboard', auth, adminDashboard);

route.get('/download-bank-book/:id', downloadbankBook);

route.get('/download-result/:id', resultDownlod);

route.get('/download-income-certificate/:id', downloadIncome);

route.get('/download-admission-receipt/:id', downlodAdmissionReceipt);

route.get('/download-attendence/:id', downloadAttendence)

route.get('/delete-candidate/:id', deleteCandidate);

route.get('/make-vification/:id', makeVerification);

route.get('/make-payment/:id', makePayment);

route.get('/make-approve/:id', makeApprove);

route.post('/make-reject/:id', makeReject);

route.get('/logout', logout)




module.exports = route;