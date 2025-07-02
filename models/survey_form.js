const mongoose = require('mongoose');
const surveySchema = mongoose.Schema({

    name: {

        type: String
    },

    email: {

        type: String
    },

    profession: {

        type: String
    },



    ai_safety: {

        type: String
    },

    ai_safety_reason: {

        type: String
    },

    ai_safety_reason_file: {

        type: String
    },



    ai_jobs: {

        type: String
    },

    ai_jobs_reason: {

        type: String
    },

    ai_jobs_reason_file: {

        type: String
    },


    ai_correct: {

        type: String
    },

    ai_correct_reason: {

        type: String
    },

    ai_correct_reason_file: {

        type: String
    },


    ai_education: {

        type: String
    },

    ai_education_reason: {

        type: String
    },

    ai_education_reason_file: {

        type: String
    },



    ai_trust: {

        type: String
    },

    ai_trust_reason: {

        type: String
    },

    ai_trust_reason_file: {

        type: String
    },

    Feedback: {

        type: String
    },

    Response_Status: {

        type: String,
        default: 'Pending'
    }


})


const survey_form = mongoose.model('survey_form', surveySchema);

module.exports = survey_form;