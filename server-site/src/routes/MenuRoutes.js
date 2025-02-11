const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuSchema');

router.post('/api/menu/:category/item', async (req, res) => {
  const { category } = req.params;
  const { items } = req.body;
  console.log('From BackEnd', items)
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Items are required' });
  }

  try {
    let menu = await MenuItem.findOne({ category });

    if (menu) {
      menu.items.push(...items);
      await menu.save();
      res.status(200).json({ message: 'Item added to existing category', data: menu });
    } else {
      menu = new MenuItem({ category, items });
      await menu.save();
      res.status(201).json({ message: 'New category created', data: menu });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});


router.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving menu items', error });
  }
});
// Update Menu Item in Backend
// Backend: PUT route to update menu item
router.put('api/menu/item', async (req, res) => {
  const { category, name, updatedName, updatedPrice } = req.body;

  try {
    const menu = await MenuItem.findOne({ category, 'items.name': name });

    if (!menu) {
      return res.status(404).json({ message: 'Menu or item not found.' });
    }

    const item = menu.items.find(item => item.name === name);
    if (item) {
      item.name = updatedName || item.name;
      item.price = updatedPrice || item.price;
      await menu.save(); // Save the updated menu document
      res.status(200).json({ message: 'Menu item updated successfully.' });
    } else {
      res.status(404).json({ message: 'Item not found.' });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item.', error });
  }
});
router.delete('/api/menu/category/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await MenuItem.findOneAndDelete({ _id: id });
    if (result) {
      res.status(200).json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error });
  }
});
// DELETE route to delete menu item
router.delete('/api/menu/:category/item/:name', async (req, res) => {
  const { category, name } = req.params;

  try {
    const menu = await MenuItem.findOne({ category });

    if (!menu) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const itemIndex = menu.items.findIndex(item => item.name === name);
    if (itemIndex !== -1) {
      menu.items.splice(itemIndex, 1); // Remove item from the array
      await menu.save(); // Save the updated menu document
      res.status(200).json({ message: 'Item deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Item not found.' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item.', error });
  }
});

// Update menu item
router.put('/v4/menu/:category/item/:itemName', async (req, res) => {
  const { category, itemName } = req.params;
  const { name, price, varieties, spicyLevels, itemsIncluded } = req.body;

  console.log(req.body, category,);
  // Debugging output
  console.log("itemname", itemName);
  try {
    // Find the category that matches the category name
    const categoryDoc = await MenuItem.findOne({ category });
    console.log(categoryDoc);

    // hey gpt i got category donc and the itemnem also mtch the item name then why item is undefined ?
    if (!categoryDoc) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Find the item within the category's items array
    const item = categoryDoc.items.find((item) => item.name.trim() === itemName.trim());

    console.log(item);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update item details if provided, otherwise keep the existing ones
    item.name = name || item.name;
    item.price = price ? parseFloat(price) : item.price; // Ensure price is a number
    item.varieties = varieties || item.varieties;
    item.spicyLevels = spicyLevels || item.spicyLevels;
    item.itemsIncluded = itemsIncluded || item.itemsIncluded;

    // Save the updated category document
    await categoryDoc.save();

    return res.status(200).json({ message: 'Item updated successfully', item });
  } catch (error) {
    console.error('Error updating item:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});


// PUT route to update menu item  hey gpt now give me the backend updata route





// Update a specific variety's price
router.put('/api/menu/:category/:itemName/variety/:varietyName', async (req, res) => {
  const { category, itemName, varietyName } = req.params;
  const { price } = req.body;

  try {
    // Find the category
    const menu = await MenuItem.findOne({ category });

    if (!menu) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Find the item within the category
    const item = menu.items.find((item) => item.name === itemName);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Find the variety within the item
    const variety = item.varieties.find((v) => v.name === varietyName);

    if (!variety) {
      return res.status(404).json({ message: 'Variety not found' });
    }

    // Update the variety price
    variety.price = price;
    await menu.save();

    res.status(200).json({ message: 'Variety updated successfully', menu });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating variety' });
  }
});





module.exports = router;



