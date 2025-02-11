const mongoose = require('mongoose');

// Schema for included items (Set Menu items)
const DeliveryLocationSchema = new mongoose.Schema({
    locationName: { // Changed from `name` to `locationName`
        type: String,
        required: true, // Ensure this field is mandatory
    },
    price: {
        type: Number,
        required: true,
    },
});

const Location = mongoose.model('Location', DeliveryLocationSchema);
module.exports = Location;