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

router.get('/post/:id', authenticateToken, (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id)

    db.Post.findOne({ _id: id }).
        populate('creator', ['profilePicture', 'username']).
        exec((err, data) => {
        if (!data) {
            // if no post found, return status 404
            return res.status(404).send("Post not found").end();
        } else if (err) {
            console.log(err)
            return res.status(500).send("Error while getting").end();
        }

        res.json({ post: data, user: req.user }).end();
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
        // push user's id to following array to display their posts as well
        following.push(req.user.id)
        console.log(following)
        // get all posts by a user the current user is following
        db.Post.find({ creator: { $in: following } }).
            sort({ createdAt: 'desc' }).
            populate('creator', ['username', 'profilePicture']).
            exec((err, data) => {
                if (err) return res.status(500).send("An error has occurred").end();

                res.json({ posts: data, user: req.user })
            })
    })
})

// route to like a post
router.put('/post/:id/like', authenticateToken, (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id)
    // push id of new user to array of users who have liked the post
    db.Post.updateOne(
        { _id: id },
        { $push: { likedBy: req.user.id } },
        (err, data) => {
            if (err) {
                console.log(err)
                return res.status(500).send("An error occurred while updating").end();
            }

            res.json(data)
        })
})

// route to unlike a post
router.put('/post/:id/unlike', authenticateToken, (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id)
    console.log('unliking')
    // remove user id from array of users who have liked the post
    db.Post.updateOne(
        { _id: id },
        { $pullAll: { likedBy: [req.user.id] } },
        (err, data) => {
            if (err) {
                console.log(err)
                return res.status(500).send("Error occurred while unliking").end()
            }

            res.json(data).end();
        }
    )
})

router.delete('/post/:id/delete', authenticateToken, (req, res) => {
    console.log('deleting')
    const postId = mongoose.Types.ObjectId(req.params.id)
    // delete post from db
    db.Post.deleteOne({ _id: postId }, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(500).send("Error while deleting post").end();
        }

        res.status(200).end();
    })
})

module.exports = router