const mongoose = require('mongoose');

const semSchema = mongoose.Schema({

    Semester_Name: {

        type: String
    }
});

const sem_model = mongoose.model('sem_model', semSchema);

module.exports = sem_model;