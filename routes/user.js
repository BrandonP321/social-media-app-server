const router = require('express').Router();
const mongoose = require('mongoose');
const db = require('../models');

router.get('/user/all', (req, res) => {
    db.User.find({}, (err, data) => {
        res.json(data)
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

        // if passwords match, send user id and jwt to client
        res.json(user._id).end();
    })
})

module.exports = router