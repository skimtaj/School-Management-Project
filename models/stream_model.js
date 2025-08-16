const mongoose = require('mongoose');

const streamSchema = mongoose.Schema({

    Stream_Name: {

        type: String
    }
}); 


const stream_model = mongoose.model('stream_model', streamSchema);

module.exports = stream_model;

