const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    // get token (if any) from request
    const token = req.header('auth-token')

    // if no token sent, send state 401
    if (!token) return res.status(401).send("Access Denied").end();

    // verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // send status 403 if token not valid
        if (err) return res.status(403).send("Invalid token").end();

        // set user prop on request to new user object
        req.user = user;
        // move on from middleware
        next();
    })
}