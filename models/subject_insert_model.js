const mongoose = require('mongoose');

const subSchema = mongoose.Schema({

    sub_name: {

        type: String
    },

    sub_code: {

        type: String
    },

    course_Name: {

        type: String
    },

    department: {

        type: String
    },

    semester: {

        type: String
    }

});

const subject_insert_model = mongoose.model('subject_insert_model', subSchema);

module.exports = subject_insert_model;


