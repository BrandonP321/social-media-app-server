const router = require('express').Router();
const authenticateToken = require('./authenticateToken')

// route to get user info from jwt
router.get('/auth/token', authenticateToken, (req, res) => {
    console.log('token valid')
    // if token wasn't denied in middle ware function, send user info to client
    res.json(req.user).end();
})

module.exports = router