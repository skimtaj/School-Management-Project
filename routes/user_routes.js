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

const uploadMiddleware = upload.fields([{ name: 'ai_safety_reason_file', maxCount: 1 }, { name: 'ai_jobs_reason_file', maxCount: 8 }, { name: 'ai_correct_reason_file', maxCount: 1 }, { name: 'ai_education_reason_file', maxCount: 1 }, { name: 'ai_trust_reason_file', maxCount: 1 }])

route.post('/ai-survey-form', uploadMiddleware, serverFormPost);


module.exports = route;