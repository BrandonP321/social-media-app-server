const router = require('express').Router();
const mongoose = require('mongoose');
const db = require('../models');
const jwt = require('jsonwebtoken')

router.get('/user/all', (req, res) => {
    db.User.find({}, (err, data) => {
        res.json(data)
    })
})

router.get('/user/:username', (req, res) => {
    // because usernames are unique, we can just search for the user in the db by their username
    db.User.findOne({ username: req.params.username }, (err, data) => {
        // if user not found send status 404
        if (!data) return res.status(404).send("User not found").end();
        // if an error showed up, send status 500
        if (err) return res.status(500).send("An error has occured").end();


        // create modified obj to send to client
        const user = {
            id: data._id,
            username: data.username,
            name: data.name,
            followersCount: data.followers.length,
            followingCount: data.following.length,
            profileImg: data.profilePicture,
            bio: data.bio
        }
        
        // if the user visiting the page is different from the profile page's user, add whether or not the user visiting the page is following the profile page user
        if (data.username !== req.body.visitingUser) {
            // iterate over array of user's followers
            for (let follower of data.followers) {
                // if follower's username is same as visiting user's username, update user obj and break out of loop
                if (follower === req.body.visitingUser) {
                    user.isFollowing = true
                }
            }
        }

        res.json(user).end();
    })
})

router.get('/user/:id/posts', (req, res) => {
    let id = mongoose.Types.ObjectId(req.params.id)

    // get all posts by the user from the db
    db.Post.find({ creator: id }, (err, data) => {
        // send status 500 if there was an error
        if (err) return res.status(500).send("An error has occurred").end();

        res.json(data);
    })
})

router.post('/user/create', (req, res) => {
    console.log(req.body)
    // check for any users with the same email
    db.User.findOne({ email: req.body.email }, (err, data) => {
        console.log(data)
        // if user found, email is taken; send status 409
        if (data) return res.status(409).send('Email taken').end();

        // else check for any user with same username
        db.User.findOne({ username: req.body.username }, (err, data) => {
            console.log(data)
            // if user found, username is taken; send status 422
            if (data) return res.status(422).send("Username taken").end();

            // else create new document in database for user
            db.User.create(req.body, (err, data) => {
                res.json(data).end();
            })
        })
    })
})

router.post('/user/login', (req, res) => {
    console.log(req.body)
    db.User.findOne({ email: req.body.email }, async (err, user) => {
        console.log(user)
        // if no user found, send status 401 for incorrect email or password
        if (!user) return res.status(401).send("Incorrect email or password").end();

        // validate password matches stored encrypted password
        const isValidPassword = await user.validatePassword(req.body.password)
        // if passwords don't match, send status 401 for incorrect email or password
        if (!isValidPassword) return res.status(401).send("Incorrect email or password").end();

        // if passwords match, create jwt and send to client
        const userObj = { id: user._id, username: user.username }
        const accessToken = generateAccessToken(userObj)
        res.header('auth-token', accessToken).json(userObj).end();
    })
})

module.exports = router

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
}