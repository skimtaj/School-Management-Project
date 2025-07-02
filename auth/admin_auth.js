require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const JWT = require('jsonwebtoken');


app.use(cookieParser());


const adminAuth = (req, res, next) => {

    const token = req.cookies.adminToken;

    if (!token) {

        req.flash('error', 'You have to login');
        return res.redirect('/ai-survey-form/admin-login')
    };

    const verified = JWT.verify(token, process.env.Admin_Token_Password);
    req.adminId = verified._id;
    next();
};

module.exports = adminAuth;