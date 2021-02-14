const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const schema = new Schema({
    email: {
        type: String,
        required: "Email required"
    },
    password: {
        type: String,
        required: "Password Required"
    },
    username: {
        type: String,
        ref: "User",
        required: 'Username required'
    },
    name: {
        type: String,
        trim: true,
        required: 'Real name required'
    },
    profilePicture: {
        type: String,
        trim: true,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    following: {
        type: Array,
        default: []
    },
    followers: {
        type: Array,
        default: []
    }
})

// hash password before storing it
schema.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(this.password, salt);

        return next();
    } catch (err) {
        return next(err);
    }
});

// add method to schema to compare given password to encrypted password
schema.methods.validatePassword = async function validatePassword(data) {
    return bcrypt.compare(data, this.password);
  };

const User = mongoose.model("User", schema)

module.exports = User;