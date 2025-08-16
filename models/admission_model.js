const mongoose = require('mongoose');
const admissionSchema = mongoose.Schema({

    Name: {

        type: String
    },

    DOB: {

        type: String
    },

    Gender: {

        type: String
    },

    Religion: {

        type: String
    },

    Category: {

        type: String
    },

    adhar_no: {

        type: String
    },

    Mobile: {

        type: String
    },

    Email: {

        type: String
    },

    permanentAddress: {

        type: String
    },

    course: {

        type: String
    },

    stream: {

        type: String
    },

    sem: {

        type: String
    },

    academicYear: {

        type: String
    },

    studyMode: {

        type: String
    },

    lastQualification: {

        type: String
    },

    percentage: {

        type: String
    },

    marksheet: {

        type: String
    },

    migrationCertificate: {

        type: String
    },

    profileImage: {

        type: String
    },

    raggingAffidavit: {

        type: String
    },

    paymentMethod: {

        type: String
    },

    amount: {

        type: String
    },

    paymentScreenshot: {

        type: String
    },

    roll_no: {

        type: String
    },

    Status: {

        type: String,
        default: "Pending"
    },

    result:

        [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'result_model'
            }
        ]


});

const admission_model = mongoose.model('admission_model', admissionSchema);

module.exports = admission_model;