const express = require('express');
const route = express.Router();
const multer = require('multer');
const path = require('path');

route.use('/Upload', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    limits: { fileSize: 10000000 },
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
})

const upload = multer({ storage: storage })



const { serverForm, serverFormPost } = require('../controllers/user_controllers')


route.get('/ai-survey-form', serverForm)


route.post('/ai-survey-form', serverFormPost);


module.exports = route;