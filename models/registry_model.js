const mongoose = require('mongoose');
const registrySchema = mongoose.Schema({

    groomName: {

        type: String
    },

    groomFather: {

        type: String
    },


    groomVillage: {

        type: String
    },

    groomPost: {

        type: String
    },


    groomPS: {

        type: String
    },

    groomDist: {

        type: String
    },

    groomPin: {

        type: String
    },


    groomDOB: {

        type: String
    },





    brideName: {

        type: String
    },

    brideFather: {

        type: String
    },


    brideVillage: {

        type: String
    },

    bridePost: {

        type: String
    },


    bridePS: {

        type: String
    },

    brideDist: {

        type: String
    },

    bridePin: {

        type: String
    },


    brideDOB: {

        type: String
    },


    marriageDate: {

        type: String
    },

    regDate: {

        type: String
    },

    mohor: {

        type: String
    },

    Joint_Photo: {

        type: String
    },

    place: {

        type: String
    },

    vol_no: {

        type: String
    },

    page_no: {
        type: String
    },

    Payment_Status: {

        type: String,
        default: 'Pending'
    },

    certificate_amount: {

        type: Number,
        default: 200
    }


});

const registry_model = mongoose.model('registry_model', registrySchema);

module.exports = registry_model; 