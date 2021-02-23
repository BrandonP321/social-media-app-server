const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: 'Creator require'
    },
    img: {
        type: String,
        trim: true,
        required: 'Image required'
    },
    caption: {
        type: String,
        trim: true,
        required: false
    },
    likedBy: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Post = mongoose.model("Post", schema)

module.exports = Post;