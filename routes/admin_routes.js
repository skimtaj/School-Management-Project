const express = require('express');
const route = express.Router();
const auth = require('../auth/admin_auth')

const { surveyResponse, deleteSurvey, logout, adminDashboard, adminLoginPost, adminLogin, adminSignupPost } = require('../controllers/admin_controllers')

route.get('/ai-survey-form/admin-login', adminLogin);

route.post('/ai-survey-form/admin-login', adminLoginPost);


route.post('/ai-survey-form/admin-signup', adminSignupPost);

route.get('/ai-survey-form/admin-dashboard', auth, adminDashboard);



route.get('/delete-survey/:id', deleteSurvey);

route.post('/survey-response/:id', surveyResponse)







route.get('/logout', logout)


module.exports = route