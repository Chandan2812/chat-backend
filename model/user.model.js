const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isverified: {
        type: Boolean,
        default: false
    }
})


const UserModel = mongoose.model('user', userSchema);

module.exports = {
    UserModel
}

