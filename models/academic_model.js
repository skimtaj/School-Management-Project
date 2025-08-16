const mongoose = require('mongoose');
const academicSchema = mongoose.Schema({

    academic_year: {

        type: String
    }
});

const academic_model = mongoose.model('academic_model', academicSchema);

module.exports = academic_model;

