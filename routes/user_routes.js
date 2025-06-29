const express = require('express');
const route = express.Router();
const multer = require('multer');
const path = require('path')

const { awardLetter, downloadButton, applicationStatus, trackApplication, downloadAppliction, trackApplicationPost, applyScholarshipPost, home, applyScholarship } = require('../controllers/user_controllers')


route.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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


const uploadMiddleware = upload.fields([{ name: 'passbookFirstPage', maxCount: 1 }, { name: 'resultUpload', maxCount: 1 }, { name: 'incomeCertificate', maxCount: 8 }, { name: 'admissionReceipt', maxCount: 1 }, { name: 'attendanceCertificate', maxCount: 8 }])

route.get('/pragatischolarship', home);

route.get('/pragatischolarship/apply-scholarship', uploadMiddleware, applyScholarship)
route.post('/pragatischolarship/apply-scholarship', uploadMiddleware, applyScholarshipPost);

route.get('/pragatischolarship/track-application', trackApplication);
route.post('/pragatischolarship/track-application', trackApplicationPost);

route.get('/pragatischolarship/download-application/:id', downloadAppliction);

route.get('/pragatischolarship/application-status/:id', applicationStatus);

route.get('/donload-button/:id', downloadButton);

route.get('/award-download-letter/:id', awardLetter)

module.exports = route;