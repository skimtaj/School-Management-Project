require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const JWT = require('jsonwebtoken');


const adminSchema = mongoose.Schema({

    Name: {

        type: String
    },

    Email: {

        type: String
    },

    Password: {

        type: String
    },

    confirmPassword: {

        type: String
    },

    Token: [{

        tokens: {
            type: String
        }
    }]
});


adminSchema.pre('save', async function (next) {
    if (this.isModified('Password')) {
        this.Password = await bcryptjs.hash(this.Password, 10);
    }
    next();
});

adminSchema.methods.generateAdminToken = async function () {

    try {
        const tokens = JWT.sign({ _id: this._id.toString() }, process.env.Admin_Token_Password, { expiresIn: '365d' });
        this.Token = this.Token.concat({ tokens: tokens });
        await this.save();
        return tokens;
    }

    catch (err) {

        console.log('This is Admin Token generate error', err)

    }
}


const admin_credential_model = mongoose.model('admin_credential_model', adminSchema);

module.exports = admin_credential_model;