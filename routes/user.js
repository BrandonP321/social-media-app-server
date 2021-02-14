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
        if (data) return res.status(409).send('Email taken')

        // else check for any user with same username
        db.User.findOne({ username: req.body.username }, (err, data) => {
            console.log(data)
            // if user found, username is taken; send status 422
            if (data) return res.status(422).send("Username taken")

            // else create new document in database for user
            db.User.create(req.body, (err, data) => {
                res.json(data).end();
            })
        })
    })
})

router.post('/user/login', (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).send("Server error while logging in")
    }
})

module.exports = router