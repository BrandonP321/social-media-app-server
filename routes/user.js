const router = require('express').Router();
const mongoose = require('mongoose');
const db = require('../models');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authenticateToken');

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
            bio: data.bio,
            email: data.email
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
    db.Post.find({ creator: id }).
    sort({ createdAt: 'desc' }).
    exec((err, data) => {
        // send status 500 if there was an error
        if (err) return res.status(500).send("An error has occurred").end();

        res.json(data);
    })
})

router.post('/user/create', (req, res) => {
    console.log('creating')
    // check for any users with the same email
    db.User.findOne({ email: req.body.email }, (err, data) => {
        console.log(data)
        // if user found, email is taken; send status 409
        if (data) return res.status(409).send('Email taken').end();
        console.log('email not taken')
        // else check for any user with same username
        db.User.findOne({ username: req.body.username }, (err, data) => {
            console.log(data)
            // if user found, username is taken; send status 422
            if (data) return res.status(422).send("Username taken").end();
            console.log('username not taken')
            // else create new document in database for user
            db.User.create(req.body, (err, data) => {
                // create jwt
                const token = generateAccessToken({ id: data._id, username: data.username })
                console.log('user created')
                res.header('auth-token', token).json(data).end();
            })
        })
    })
})

router.post('/user/login', (req, res) => {
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

router.put('/user/update', authenticateToken, (req, res) => {
    console.log(req.body)
    console.log(req.user)
    // update user in db
    db.User.updateOne({ _id: req.user.id }, req.body, (err, data) => {
        if (err) {
            console.log('err')
            if (err.keyValue.email) {
                // if email is not unique, return status 409
                return res.status(409).send("Email taken").end();
            }

            if (err.keyValue.username) {
                // if username is not unique, return status 422
                return res.status(422).send("Username taken").end()
            }

            // if no unique errors were thrown, return status 500
            return res.status(500).send("Error has occurred").end();
        }
        // if update was successful, create new access token with new email/username
        const token = generateAccessToken({ id: req.body.id, username: req.body.username })

        // send new username to client with new token in header
        res.header('auth-token', token).json({ username: req.body.username }).end();
    })
})

router.put('/user/:id/follow', authenticateToken, (req, res) => {
    console.log('follow user')
    console.log(req.user)
    const userToFollowId = req.params.id
    const currentUserId = req.user.id
    // add the user to follow to the array of followed users for current user
    db.User.updateOne(
        { _id: currentUserId }, 
        { $push: { following: userToFollowId } }, 
        (err, data) => {
            if (err) {
                console.log(err)
                return res.status(500).send("Error while updating following array").end()
            }

            // now update array of follower for user being followed
            db.User.updateOne(
                { _id: mongoose.Types.ObjectId(userToFollowId) },
                { $push: { followers: currentUserId }},
                (err, data) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).send("Error while updating array of followers").end();
                    }

                    // if successful, send good status to client
                    res.status(200).end();
                })
        })
})

router.put('/user/:id/unfollow', authenticateToken, (req, res) => {
    console.log('unfollow user')
    console.log(req.body)
})

module.exports = router

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
}