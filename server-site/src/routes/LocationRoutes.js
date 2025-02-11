const express = require('express');
const Location = require('../models/LocationShema');
const router = express.Router();


router.post('/api/delivery-location', async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Log the incoming data

        const { locationName, price } = req.body;

        if (!locationName || !price) {
            return res.status(400).json({ message: 'Location name and price are required.' });
        }

        const deliveryLocation = new Location({ locationName, price });
        await deliveryLocation.save();

        res.status(201).json({
            message: 'Delivery location added successfully!',
            data: deliveryLocation
        });
    } catch (error) {
        console.error('Error adding delivery location:', error);
        res.status(500).json({ message: 'Failed to add delivery location. Please try again.' });
    }
});


router.get('/api/delivery-location', async (req, res) => {
    try {
        // Retrieve all locations from the database
        const locations = await Location.find();

        // Respond with the retrieved locations
        res.status(200).json({
            message: 'Locations retrieved successfully!',
            data: locations,
        });
    } catch (error) {
        console.error('Error retrieving locations:', error);

        // Send an error response
        res.status(500).json({
            message: 'Failed to retrieve locations. Please try again.',
        });
    }
});


// Update location
router.put('/api/delivery-location/:id', async (req, res) => {
    try {
        const { price } = req.body;
        const updatedLocation = await Location.findByIdAndUpdate(
            req.params.id,
            { price },
            { new: true }
        );

        if (!updatedLocation) {
            return res.status(404).json({ message: 'Location not found.' });
        }

        res.status(200).json({ message: 'Location updated successfully.', data: updatedLocation });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Failed to update location.' });
    }
});

// Delete location
router.delete('/api/delivery-location/:id', async (req, res) => {
    try {
        const deletedLocation = await Location.findByIdAndDelete(req.params.id);

        if (!deletedLocation) {
            return res.status(404).json({ message: 'Location not found.' });
        }

        res.status(200).json({ message: 'Location deleted successfully.' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ message: 'Failed to delete location.' });
    }
});




module.exports = router;