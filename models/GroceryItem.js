const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroceryItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    availableCount: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    }
});

module.exports = GroceryItem = mongoose.model('groceryitems', GroceryItemSchema);