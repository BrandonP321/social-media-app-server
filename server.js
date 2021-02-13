const express = require('express')
const app = express();
const mongoose = require('mongoose')
require('dotenv').config();

const cors = require('cors')

const PORT = process.env.PORT || 8000

app.use(cors({
    exposedHeaders: 'auth-token'
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

// routes
app.use('/api', require('./routes/post'))
app.use('/api', require('./routes/user'))

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/social-media-app', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })

app.listen(PORT, () => {
    console.log('server listening on port ' + PORT)
})