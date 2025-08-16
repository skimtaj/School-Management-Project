const mongoose = require('mongoose');
const noticeSchema = mongoose.Schema({

    title: {

        type: String
    },

    description: {

        type: String
    },

    link: {

        type: String
    }
});

const notice_model = mongoose.model('notice_model', noticeSchema);

module.exports = notice_model;