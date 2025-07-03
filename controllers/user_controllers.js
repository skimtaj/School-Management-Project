const admin_credential = require("../models/admin_credential");
const survey_form = require("../models/survey_form");

const nodemailer = require('nodemailer');


const serverForm = (req, res) => {

    res.render('../Views/survey_form')
}

const serverFormPost = async (req, res) => {

    const surverData = req.body;

    const matchEmail = await survey_form.findOne({ email: surverData.email });

    if (matchEmail) {
        req.flash('error', 'You have already submitted this survey. Thank You!');
        return res.redirect('/ai-survey-form')
    }

    else {

        const new_survey_form = survey_form(surverData);
        await new_survey_form.save();

        const admins = await admin_credential.find();
        const adminEmail = await admins.map((a) => a.Email.split(','))

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        const mailOptions = {
            from: process.env.User,
            to: adminEmail,
            subject: 'Surver Notification',
            text: ` A new user Submitted survey \nName : ${new_survey_form.name} \nEmail : ${new_survey_form.email}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        console.log(new_survey_form)

        req.flash('success', 'Thank you for completing the survey')
        return res.redirect('/ai-survey-form')
    }


}

module.exports = { serverForm, serverFormPost }; 