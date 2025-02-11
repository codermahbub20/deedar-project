const express = require('express');
const router = express.Router();
const SpecialMenu = require('../models/SpecialMenu'); // Adjust the path as needed

// POST /api/special-menu
router.post('/api/special-menu', async (req, res) => {
    try {
        // Directly use the request body data
        console.log(req.body);
        console.log(req.body.dishes);
        const newSpecialMenu = new SpecialMenu(req.body);

        // Save to the database
        await newSpecialMenu.save();

        // Return the saved menu data
        res.status(201).json({ message: 'Special menu added successfully!', data: newSpecialMenu });
    } catch (error) {
        console.error('Error saving special menu:', error);
        res.status(500).json({ message: 'Failed to add menu. Please try again.' });
    }
});
// GET /api/special-menu/sets
router.get('/api/special-menu/sets', async (req, res) => {
    try {
        // Get distinct set names from the SpecialMenu collection
        const sets = await SpecialMenu.distinct('set');
        res.status(200).json({ sets });
    } catch (error) {
        console.error('Error fetching set names:', error);
        res.status(500).json({ message: 'Failed to fetch set names. Please try again.' });
    }
});

// PUT /api/special-menu/:category
// PUT /api/special-menu/:category
router.put('/api/special-menu/:category', async (req, res) => {
    try {
        const categoryName = req.params.category;
        const { set } = req.body;

        // Check if the category exists
        const existingCategory = await SpecialMenu.findOne({ category: categoryName ,set:set});

        if (existingCategory) {
            // If the set does not match the existing set, return a 400 error
            if (existingCategory.set !== set) {
                // Create a new special menu entry if the set is different
                const newSpecialMenu = new SpecialMenu(req.body);
                await newSpecialMenu.save();
                return res.status(201).json({ message: 'New special menu added with a different set!', data: newSpecialMenu });
            }

            // Continue updating the existing category if the set matches
            existingCategory.Price = req.body.Price;

            // Loop through subcategories to update or add new subcategories
            req.body.subcategories.forEach((newSubcategory) => {
                const existingSubcategoryIndex = existingCategory.subcategories.findIndex(
                    (sub) => sub.name === newSubcategory.name
                );

                if (existingSubcategoryIndex !== -1) {
                    // Update existing subcategory
                    existingCategory.subcategories[existingSubcategoryIndex].price = newSubcategory.price;

                    // Add new dishes to the existing subcategory
                    newSubcategory.dishes.forEach((newDish) => {
                        const existingDishIndex = existingCategory.subcategories[existingSubcategoryIndex].dishes.findIndex(
                            (dish) => dish.name === newDish.name
                        );

                        if (existingDishIndex === -1) {
                            // Add new dish if it doesn't exist in the subcategory
                            existingCategory.subcategories[existingSubcategoryIndex].dishes.push(newDish);
                        }
                    });
                } else {
                    // If subcategory doesn't exist, add it
                    existingCategory.subcategories.push(newSubcategory);
                }
            });

            // Save the updated category
            await existingCategory.save();

            res.status(200).json({ message: 'Special menu updated successfully!', data: existingCategory });
        } else {
            // If the category doesn't exist, create a new special menu entry
            const newSpecialMenu = new SpecialMenu(req.body);
            await newSpecialMenu.save();
            res.status(201).json({ message: 'Special menu added successfully!', data: newSpecialMenu });
        }
    } catch (error) {
        console.error('Error updating special menu:', error);
        res.status(500).json({ message: 'Failed to update menu. Please try again.' });
    }
});





// GET /api/special-menu
router.get('/api/special-menu', async (req, res) => {
    try {
        const menus = await SpecialMenu.find(); // Fetches all menu categories with items
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch menu', error });
    }
});
// DELETE /api/special-menu/:category
router.delete('/api/special-menu/:id', async (req, res) => {
    try {
        const {id}= req.params
        const result = await SpecialMenu.findOneAndDelete({ _id: id });
        if (result) {
            res.status(200).json({ message: 'Category deleted successfully' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete category', error });
    }
});

router.delete('/api/special-menu/:category/subcategory/:subcategory', async (req, res) => {
    try {
        const { category, subcategory } = req.params;
        const menu = await SpecialMenu.findOne({ category });

        if (!menu) {
            return res.status(404).json({ message: 'Category not found' });
        }

        menu.subcategories = menu.subcategories.filter(
            sub => sub.name.toLowerCase() !== subcategory.toLowerCase()
        );

        menu.markModified('subcategories');
        await menu.save();

        res.status(200).json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ message: 'Failed to delete subcategory', error });
    }
});
router.delete('/api/special-menu/:category/subcategory/:subcategory/dish/:dish', async (req, res) => {
    try {
        const { category, subcategory, dish } = req.params;
        const menu = await SpecialMenu.findOne({ category });

        if (!menu) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const subcategoryItem = menu.subcategories.find(
            sub => sub.name.toLowerCase() === subcategory.toLowerCase()
        );

        if (!subcategoryItem) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        subcategoryItem.dishes = subcategoryItem.dishes.filter(
            d => d.name.toLowerCase() !== dish.toLowerCase()
        );

        menu.markModified('subcategories');
        await menu.save();

        res.status(200).json({ message: 'Dish deleted successfully' });
    } catch (error) {
        console.error('Error deleting dish:', error);
        res.status(500).json({ message: 'Failed to delete dish', error: error.message });
    }
});



module.exports = router;
