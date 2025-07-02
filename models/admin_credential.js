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

    Tokens: [{

        token: {

            type: String
        }
    }]
});


adminSchema.methods.adminTokenGenerate = async function () {

    try {
        const token = JWT.sign({ _id: this._id.toString() }, process.env.Admin_Token_Password, { expiresIn: '365d' });
        this.Tokens = this.Tokens.concat({ token: token });
        await this.save();
        return token;
    }

    catch (err) {

        console.log('this is admin token  function error', err)

    }
}


adminSchema.pre('save', async function (next) {
    if (this.isModified('Password')) {
        this.Password = await bcryptjs.hash(this.Password, 10);
    }
    next();
});



const admin_credential = mongoose.model('admin_credential', adminSchema);
module.exports = admin_credential;