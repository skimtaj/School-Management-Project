const mongoose = require('mongoose');
const resultSchema = mongoose.Schema({

    marksheet: [{

        subject: {

            type: String
        },

        mark: {

            type: Number
        }
    }]


});

const result_model = mongoose.model('result_model', resultSchema);

module.exports = result_model; 