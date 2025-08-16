require('dotenv').config();
const cookies = require('cookie-parser');
const express = require('express');
const app = express();
const JWT = require('jsonwebtoken')

app.use(cookies());

const adminAuth = (req, res, next) => {

    const token = req.cookies.adminToken;

    if (!token) {
        req.flash('error', 'You have to login');
        return res.redirect('/JUK/admin-login')
    };

    const verified = JWT.verify(token, process.env.Admin_Token_Password);
    req.adminId = verified._id;
    next()
};

module.exports = adminAuth;
