const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    expiry: {
        type: String,
        required: true
    }
});

module.exports = Card = mongoose.model('cards', CardSchema);