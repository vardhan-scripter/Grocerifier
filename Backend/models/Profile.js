const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    name: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    username: {
        type: String,
        required: true
    },
    gender: {
        type: String
    },
    address1: {
        type: String
    },
    address2: {
        type: String
    },
    cards: [{
        type: Schema.Types.ObjectId,
        ref: 'cards'
    }]
});

module.exports = Profile = mongoose.model('profiles', ProfileSchema);