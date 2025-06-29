const mongoose = require('mongoose');
const scholarshipSchema = mongoose.Schema({

    studentName: {

        type: String
    },

    dob: {

        type: String
    },

    gender: {

        type: String
    },

    email: {

        type: String
    },

    mobile: {

        type: String
    },

    fatherName: {

        type: String
    },

    familyIncome: {

        type: String
    },

    state: {

        type: String
    },

    fullAddress: {

        type: String
    },

    currentClass: {

        type: String
    },

    currentBoard: {

        type: String
    },

    previousInstitute: {

        type: String
    },

    previousClass: {

        type: String
    },

    boardName: {

        type: String
    },

    passingYear: {

        type: String
    },

    pom: {

        type: String
    },

    obtainedMarks: {

        type: String
    },

    doa: {

        type: String
    },

    accountHolderName: {

        type: String
    },

    accountNumber: {

        type: String
    },

    bankName: {

        type: String
    },

    branchName: {

        type: String
    },

    ifscCode: {

        type: String
    },

    accountType: {

        type: String
    },

    passbookFirstPage: {

        type: String
    },

    resultUpload: {

        type: String
    },

    incomeCertificate: {

        type: String
    },

    admissionReceipt: {

        type: String
    },

    attendanceCertificate: {

        type: String
    },

    verification: {

        type: String,
        default: "Pending"
    },

    paymnt_status: {

        type: String,
        default: "Pending"
    },

    scholarship_status: {

        type: String,
        default: 'Pending'
    },

    ApplicationId: {

        type: String
    },

    reject_reason: {

        type: String
    }


});

const Scholarship_model = mongoose.model('Scholarship_model', scholarshipSchema);

module.exports = Scholarship_model;