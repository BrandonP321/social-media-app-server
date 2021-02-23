const router = require('express').Router();
const mongoose = require('mongoose');
const authenticateToken = require('./authenticateToken')
const db = require('../models');

router.post('/post/create', authenticateToken, (req, res) => {
    // get creator's id from req
    const { id } = req.user


    // create obj with data to be added to db
    const userObj = {
        ...req.body,
        creator: id
    }
    console.log(userObj)

    // add post to db
    db.Post.create(userObj, (err, data) => {
        // if an err occurred, send status 500
        if (err) return res.status(500).send("An error has occurred").end();

        res.json(data)
    })
})

// get all recent posts to be displayed on home page
router.get('/posts/following', authenticateToken, (req, res) => {
    console.log('token valid2')
    console.log(req.user)
    // get list of users current user is following
    db.User.findOne({ _id: req.user.id }, (err, data) => {
        if (err) return res.status(500).send("Error has occurred").end();

        const { following } = data
        console.log(following)
        // push user's id to following array to display their posts as well
        following.push(req.user.id)
        // get all posts by a user the current user is following
        db.Post.find({ creator: {$in: following } }).
        sort({createdAt: 'desc'}).
        populate('creator', ['username', 'profilePicture']).
        exec((err, data) => {
            if (err) return res.status(500).send("An error has occurred").end();

            res.json(data)
        })
    })
})

module.exports = router