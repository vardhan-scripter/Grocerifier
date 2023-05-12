const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    emailId: {
        type: String,
        required: true
    },
    items: [{
        productId: {
            type: String,
            required: true,
        },
        count: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    }
});

module.exports = Cart = mongoose.model('carts', CartSchema);