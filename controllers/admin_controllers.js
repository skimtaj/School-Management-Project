
const path = require('path')
const admin_credential = require("../models/admin_credential");
const bcryptjs = require('bcryptjs');
const cookieParser = require('cookie-parser')
const express = require('express');
const survey_form = require("../models/survey_form");
const app = express();

app.use(cookieParser());


const adminLogin = (req, res) => {

    res.render('../Views/admin_credential')
}

const adminSignupPost = async (req, res) => {

    const adminData = req.body;

    if (adminData.Password !== adminData.confirmPassword) {

        req.flash('error', 'Password is not matching');
        return res.redirect('/ai-survey-form/admin-login')
    };

    const matchEmail = await admin_credential.findOne({ Email: adminData.Email });

    if (matchEmail) {
        req.flash('error', 'Email already exist');
        return res.redirect('/ai-survey-form/admin-login')
    }

    const new_admin_model = admin_credential(adminData);
    await new_admin_model.save();

    console.log(new_admin_model)

    req.flash('success', 'Signup Successfully');
    return res.redirect('/ai-survey-form/admin-login')

}

const adminLoginPost = async (req, res) => {

    const { Email, Password } = req.body;

    const matchEmail = await admin_credential.findOne({ Email: Email });

    if (matchEmail) {

        const matchPassword = await bcryptjs.compare(Password, matchEmail.Password);

        if (matchPassword) {

            const token = await matchEmail.adminTokenGenerate();

            res.cookie('adminToken', token), {
                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            }

            return res.redirect('/ai-survey-form/admin-dashboard')
        }

        else {

            req.flash('error', 'Invalid Email or Password');
            return res.redirect('/ai-survey-form/admin-login')
        }

    }

    else {

        req.flash('error', 'Invalid login Credential ');
        return res.redirect('/ai-survey-form/admin-login')
    }


}

const adminDashboard = async (req, res) => {

    const adminSourse = await admin_credential.findById(req.adminId);

    const allSurveyData = await survey_form.find();

    const totalcandidate = allSurveyData.length;

    res.render('../Views/admin_dashboard', { allSurveyData, adminSourse, totalcandidate })
}

const logout = (req, res) => {

    res.clearCookie('adminToken');
    req.flash('success', 'You are logout successfully');
    return res.redirect('/ai-survey-form/admin-login')

}

const downloadsafetyFile = async (req, res) => {

    const sourse = await survey_form.findById(req.params.id)


    if (!sourse.ai_safety_reason_file) {
        req.flash('error', 'No file found for this survey form')
        return res.redirect('/ai-survey-form/admin-dashboard')
    }

    const filepath = path.join(__dirname, '../uploads', sourse.ai_safety_reason_file);
    res.download(filepath);
}

const downloadJobFile = async(req, res) => {

    const sourse = await survey_form.findById(req.params.id);

    if (!sourse.ai_jobs_reason_file) {

        req.flash('error', 'No file found for this survey form');
        return res.redirect('/ai-survey-form/admin-dashboard')
    }
    const filepath = path.join(__dirname, '../uploads', sourse.ai_jobs_reason_file);
    res.download(filepath);

}

const downloadCorrectFile = async (req, res) => {


    const sourse = await survey_form.findById(req.params.id);

    if (!sourse.ai_correct_reason_file) {

        req.flash('error', 'No file found for this survey form');
        return res.redirect('/ai-survey-form/admin-dashboard')
    }
    const filepath = path.join(__dirname, '../uploads', sourse.ai_correct_reason_file);
    res.download(filepath);


}

const downloadEducationFile = async (req, res) => {

    const sourse = await  survey_form.findById(req.params.id);

    if (!sourse.ai_education_reason_file) {

        req.flash('error', 'No file found for this survey form');
        return res.redirect('/ai-survey-form/admin-dashboard')
    }
    const filepath = path.join(__dirname, '../uploads', sourse.ai_education_reason_file);
    res.download(filepath);

}

const downloadTrustFile = async (req, res) => {


    const sourse = await survey_form.findById(req.params.id);

    if (!sourse.ai_trust_reason_file) {

        req.flash('error', 'No file found for this survey form');
        return res.redirect('/ai-survey-form/admin-dashboard')
    }
    const filepath = path.join(__dirname, '../uploads', sourse.ai_trust_reason_file);
    res.download(filepath);


}

const deleteSurvey = async (req, res) => {

    await survey_form.findByIdAndDelete(req.params.id);
    req.flash('success', 'Survey deleted successfully');
    return res.redirect('/ai-survey-form/admin-dashboard')

}

const surveyResponse = async (req, res) => {

    const { response } = req.body

    const sourse = await survey_form.findById(req.params.id);
    sourse.Feedback = response;

    sourse.Response_Status = 'Responed'
    await sourse.save();


    req.flash('success', 'Response submitted successfuly');
    return res.redirect('/ai-survey-form/admin-dashboard')


}



module.exports = { surveyResponse, deleteSurvey, downloadTrustFile, downloadEducationFile, downloadCorrectFile, downloadJobFile, downloadsafetyFile, logout, adminDashboard, adminLoginPost, adminLogin, adminSignupPost };