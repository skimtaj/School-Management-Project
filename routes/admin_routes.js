const express = require('express');
const route = express.Router();
const auth = require('../auth/admin_auth')

const { surveyResponse, deleteSurvey, downloadTrustFile, downloadEducationFile, downloadCorrectFile, downloadJobFile, downloadsafetyFile, logout, adminDashboard, adminLoginPost, adminLogin, adminSignupPost } = require('../controllers/admin_controllers')

route.get('/ai-survey-form/admin-login', adminLogin);

route.post('/ai-survey-form/admin-login', adminLoginPost);


route.post('/ai-survey-form/admin-signup', adminSignupPost);

route.get('/ai-survey-form/admin-dashboard', auth, adminDashboard);

route.get('/download-safety-file/:id', downloadsafetyFile);

route.get('/download-job-file/:id', downloadJobFile)

route.get('/download-corrcet-file/:id', downloadCorrectFile)

route.get('/download-education-file/:id', downloadEducationFile)

route.get('/download-trust-file/:id', downloadTrustFile);

route.get('/delete-survey/:id', deleteSurvey);

route.post('/survey-response/:id', surveyResponse)







route.get('/logout', logout)


module.exports = route