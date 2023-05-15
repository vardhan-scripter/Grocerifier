const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
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
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = Order = mongoose.model('orders', OrderSchema);