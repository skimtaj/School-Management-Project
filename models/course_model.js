const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({

 
    course_name: {

        type: String
    },

    course_price: {

        type: Number
    }
});

const course_model = mongoose.model('course_model', courseSchema);
module.exports = course_model;