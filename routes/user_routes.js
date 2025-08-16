const express = require('express');
const route = express.Router();

const { downloadMarksheetStudent, userLoginPost, studentMarksheet, userLogin } = require('../controllers/user_controllers');

route.get('/JUK/student-login', userLogin);
route.post('/JUK/student-login', userLoginPost);

route.get('/JUK/student-result/:id', studentMarksheet);

route.get('/download-marksheet/:id', downloadMarksheetStudent)




module.exports = route;