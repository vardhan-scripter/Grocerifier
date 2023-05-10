const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const cors = require('cors')
const auth = require('./routes/auth');
const user = require('./routes/user');
const grocery = require('./routes/grocery');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

const db = require('./setup/dbconfig').dbconnection;

mongoose.connect(db).then(() => {
    console.log("Database connected successfully!!!");
}).catch(() => {
    console.log("Something went wrong while connecting to database???");
});

// Passport middleware
app.use(passport.initialize());

// Config for JWT strategy
require('./strategies/jsonwtStrategy')(passport);

// Adding routes
app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/grocery', grocery);

const PORT = process.env.port || 5000;
app.listen(PORT, () => {
    console.log(`Application started on port number ${PORT}`);
})