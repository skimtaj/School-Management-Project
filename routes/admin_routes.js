const express = require('express');
const multer = require('multer')
const route = express.Router();
const path = require('path')
const auth = require('../auth/admin_auth')
const { editCertificatePost, editCertificate, resetPasswordPost, resetPassword, forgetPasswordPost, forgetPassword, editProfilePost, editProfile, downloadAllRegistryexcel, deleteCertificate, viewCertificate, downloadCertificate, downloadJointPhoto, newCertificatePost, newCertificate, adminDashboard, adminLoginPost, adminLogin, adminSignup } = require('../controllers/admin_controllers')


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


route.get('/mmr-office/admin-login', adminLogin)

route.post('/mmr-office/admin-signup', upload.single('Profile_Image'), adminSignup)

route.post('/mmr-office/admin-login', adminLoginPost);

route.get('/mmr-office-admin-dashboard', auth, adminDashboard)

route.get('/mmr-office/new-certificate', auth, newCertificate)
route.post('/mmr-office/new-certificate', upload.single('Joint_Photo'), auth, newCertificatePost);

route.get('/download-joint-photot/:id', downloadJointPhoto);

route.get('/download-certificate/:id', downloadCertificate);

route.get('/view-certificate/:id', viewCertificate);

route.get('/delete-certificate/:id', deleteCertificate);

route.get('/dowload-allRegistry', downloadAllRegistryexcel)

route.get('/mmr-office/edit-profile', auth, editProfile);
route.post('/mmr-office/edit-profile', auth, editProfilePost);

route.get('/mmr-office/edit-certificate/:id', editCertificate)
route.post('/mmr-office/edit-certificate/:id', upload.single('Joint_Photo'), editCertificatePost)


route.get('/mmr-office/forget-password', forgetPassword)
route.post('/mmr-office/forget-password', forgetPasswordPost)

route.get('/mmr-office/reset-password/:id', resetPassword)
route.post('/mmr-office/reset-password/:id', resetPasswordPost)




module.exports = route