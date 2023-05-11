const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const passport = require('passport');
const Card = require('../models/Card');
const router = express.Router();

//@type: GET
//@path: /api/user
//@access: PRIVATE
//@description: User details fetching endpoint
router.get('/', passport.authenticate("jwt", {session: false}), (req, res) => {
    User.findOne({email: req.user.email}).then(user => {
        if(!user){
            res.status(400).json({
                errorMessage: "User not found"
            })
        } else {
            Profile.findOne({user: user._id}, "-_id -user -__v").populate('cards', "-_id -__v").then(profile => {
                res.status(200).json({
                    ...profile._doc,
                    email: user.email
                });
            }).catch(err => {
                throw err;
            })
        }
    }).catch(err => {
        res.status(500).json({
            errorMessage: "Internal server error"
        })
    })
});

//@type: POST
//@path: /api/user/update
//@access: PRIVATE
//@description: User update details endpoint
router.post('/update/', passport.authenticate("jwt", {session: false}), (req, res) => {
    User.findOne({email: req.user.email}).then(user => {
        if(!user){
            res.status(400).json({
                errorMessage: "User not found"
            })
        } else {
            Profile.findOne({user: user}).then(profile => {
                profile.name = req.body.name || '';
                profile.gender = req.body.gender || '';
                profile.address1 = req.body.address1 || '';
                profile.address2 = req.body.address2 || '';

                // Updating updated profile in DB
                profile.save().then((updatedProfile) => {
                    res.status(200).json({
                        ...updatedProfile._doc,
                        email: user.email
                    });
                }).catch(err => {
                    throw err;
                })
            }).catch(err => {
                throw err;
            })
        }
    }).catch(err => {
        res.status(500).json({
            errorMessage: "Internal server error"
        })
    })
});


//@type: POST
//@path: /api/user/add/card
//@access: PRIVATE
//@description: User update card details endpoint
router.post('/add/card', passport.authenticate("jwt", {session: false}), (req, res) => {
    User.findOne({email: req.user.email}).then(user => {
        if(!user){
            res.status(400).json({
                errorMessage: "User not found"
            })
        } else {
            const newCard = Card({
                fullName: req.body.fullName || '',
                number: req.body.number || '',
                expiry: req.body.expiry || ''
            });

            newCard.save().then(card => {
                Profile.findOne({user: user}).then(profile => {
                    profile.cards.push(card);

                    // Updating updated profile in DB
                    profile.save().then(() => {
                        res.status(200).json({
                            message: "User passport details updated successfully"
                        });
                    }).catch(err => {
                        throw err;
                    })
                }).catch(err => {
                    throw err;
                })
            }).catch(err => {
                throw err;
            })
        }
    }).catch(err => {
        res.status(500).json({
            errorMessage: "Internal server error"
        })
    })
});

//@type: POST
//@path: /api/user/
//@access: PRIVATE
//@description: delete User endpoint
router.delete('/', passport.authenticate("jwt", {session: false}), (req, res) => {
    User.findOne({email: req.user.email}).then(user => {
        if(!user){
            res.status(400).json({
                errorMessage: "User not found"
            })
        } else {
            Profile.findOneAndDelete({user: user}).then(success => {
                User.findByIdAndDelete(user._id).then(isSuccess => {
                    res.json({
                        message: "User deleted successfully"
                    })
                }).catch(err => {
                    throw err;
                });                
            }).catch(err => {
                throw err;
            });
        }
    }).catch(err => {
        res.status(500).json({
            errorMessage: "Internal server error"
        })
    })
});

module.exports = router;