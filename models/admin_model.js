
require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const JWT = require('jsonwebtoken');

const adminSchema = mongoose.Schema({


    Name: {

        type: String
    },

    Mobile: {

        type: String
    },

    Email: {

        type: String
    },

    Password: {

        type: String
    },

    Tokens: [{

        token: {

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

adminSchema.methods.generateadminToken = async function () {

    try {

        const token = JWT.sign({ _id: this._id.toString() }, process.env.Admin_Token_Password, { expiresIn: '365d' })
        this.Tokens = this.Tokens.concat({ token: token });
        await this.save();
        return token;
    }

    catch (err) {
        console.log('This is admn Token generationg error', err)
    }
}

const admin_model = mongoose.model('admin_model', adminSchema);
module.exports = admin_model; 