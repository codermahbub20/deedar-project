const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    subquantity: {
        type: Number,
        // required: true,
    },
    dishes: [dishSchema],
});

const specialMenuSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Mid Week Special Platter', 'Chef Choice'],
    },
    Price: {
        type: Number,
        required: true,
    },
    set: {
        type: String, // The set can be "Set 1", "Set 2"
        // required: true,
    },
    subcategories: [subcategorySchema], // Array of subcategory objects
});

module.exports = mongoose.model('SpecialMenu', specialMenuSchema);
