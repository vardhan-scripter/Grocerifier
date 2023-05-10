const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretOrKey = require('../setup/dbconfig').secret;

//@type: POST
//@path: /api/auth/register
//@access: PUBLIC
//@description: User registration endpoint
router.post('/register', (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if(user){
            res.status(400).json({
                errorMessage: 'Email is already existed'
            })
        }else{
            const newUser = User({
                email: req.body.email,
                username: req.body.username,
                password: req.body.password
            });

            //encrypt password before storing
            bcryptjs.genSalt(10, (err, salt) => {
                if (err) throw err;
                bcryptjs.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then(success => {
                        const newProfile = Profile({
                            user: newUser,
                            username: req.body.username,
                            cards: []
                        });
                        newProfile.save().then(isSuccess => {
                            res.status(200).json({success: true, message: "User registered successfully"});
                        }).catch(err => {
                            res.status(500).json({errorMessage: "Internal server error"});
                        })
                    }).catch(err => {
                        res.status(500).json({errorMessage: "Internal server error"});
                    })
                })
            })
        }
    })
})


//@type: POST
//@path: /api/auth/login
//@access: PUBLIC
//@description: User login endpoint
router.post('/login', (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if(!user){
            res.status(401).json({
                errorMessage: 'Credentials mismatch'
            })
        }else if(user.locked){
            res.status(401).json({
                errorMessage: 'This account is locked, please update your password and unlock it'
            }) 
        }else{
            const payload = {
                id: user.id,
                email: user.email,
                username: user.username
            }
            
            bcryptjs.compare(req.body.password, user.password).then(isSuccess => {
                if(isSuccess){
                    jwt.sign(
                        payload,
                        secretOrKey,
                        { expiresIn: 3600},
                        (err, token) => {
                            if (err) throw err;
                            res.status(200).json({
                                username: user.username,
                                token: token,
                                expiresIn: 3600,
                            })
                        }
                    )
                } else {
                    return res.status(401).json({ errorMessage: 'Credentials mismatch' })
                }
            }).catch(err => {
                res.status(500).json({errorMessage: "Internal server error"});
            })
        }
    }).catch(err => {
        res.status(500).json({errorMessage: "Internal server error"});
    })
})


//@type: POST
//@path: /api/auth/forgotpassword
//@access: PUBLIC
//@description: User forgot password endpoint
router.post('/forgotpassword', (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if(!user){
            res.status(404).json({
                errorMessage: 'email not found'
            })
        }else{
            const otp = Math.floor(1000 + Math.random() * 9000);
            user.locked = true;
            user.otp = otp;
            user.save().then((isSuccess) => {
                if (!isSuccess) throw err;
                // TODO: Need to implement otp logic and send otp, now sending it in direct response
                res.status(200).json({
                    otp: otp,
                    message: "Please find otp"
                })
            })
        }
    }).catch(err => {
        res.status(500).json({errorMessage: "Internal server error"});
    })
})

//@type: POST
//@path: /api/auth/updatepassword
//@access: PUBLIC
//@description: User update password endpoint
router.post('/updatepassword', (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if(!user){
            res.status(404).json({
                errorMessage: 'email not found'
            })
        }else{
            if(user.otp !== +req.body.otp){
                res.status(401).json({
                    errorMessage: 'Plese provide correct OTP!'
                })
            }else{
                // Encrypt password before saving
                bcryptjs.genSalt(10, (err, salt) =>{
                    if (err) throw err;
                    bcryptjs.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        user.locked = false;
                        user.otp = null;
                        user.password = hash;

                        user.save().then((isSuccess) => {
                            if (!isSuccess) throw err;
                            res.status(200).json({
                                message: "Password updated successfully, please login again and check!"
                            })
                        }).catch(err => {
                            res.status(500).json({errorMessage: "Internal server error"});
                        })
                    })
                })
            }
        }
    }).catch(err => {
        res.status(500).json({errorMessage: "Internal server error"});
    })
})

module.exports = router;