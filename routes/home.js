const express = require('express');
const route = express.Router();
const multer = require('multer');
const path = require('path')


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

const upload = multer({ storage: storage });


const { downloadReceipt, admissionReceipt, admissionFormPost, homeCobntroller, admissionForm } = require('../controllers/home')


route.get('/juk', homeCobntroller);

route.get('/juk/admision-form', admissionForm);

const uploadMiddleware = upload.fields([{ name: 'marksheet', maxCount: 1 }, { name: 'migrationCertificate', maxCount: 8 }, { name: 'profileImage', maxCount: 1 }, { name: 'raggingAffidavit', maxCount: 8 }, { name: 'paymentScreenshot', maxCount: 8 }])


route.post('/juk/admision-form', uploadMiddleware, admissionFormPost);

route.get('/download-addmission-receipt/:id', admissionReceipt);

route.get('/download-receipt/:id', downloadReceipt);




module.exports = route;