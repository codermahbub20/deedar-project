const express = require('express');
const router = express.Router();
const Users = require('../models/UserSchema'); // Adjust the path if needed

// Save or modify user email, status in DB
router.put('/users/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const userData = req.body;
    const isExist = await Users.findOne({ email });

    if (isExist) {
      if (userData?.status === 'Requested') {
        const result = await Users.updateOne(
          { email },
          { $set: userData }
        );
        return res.send(result);
      } else {
        return res.send(isExist);
      }
    }

    // If user does not exist, create new user with timestamp
    const result = await Users.updateOne(
      { email },
      { $set: { ...userData, timestamp: Date.now() } },
      { upsert: true }
    );
    res.send(result);
  } catch (error) {
    console.error('Error saving or modifying user:', error);
    res.status(500).send({ error: "Failed to save or modify user" });
  }
});

// Update user role
router.put('/users/update/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const userData = req.body;
    const result = await Users.updateOne(
      { email },
      { $set: { ...userData, timestamp: Date.now() } },
      { upsert: true }
    );
    res.send(result);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).send({ error: "Failed to update user role" });
  }
});

// Logout
router.get('/logout', (req, res) => {
  try {
    res
      .clearCookie('token', {
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({ success: true });
    console.log('Logout successful');
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).send({ error: "Logout failed" });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await Users.find();
    res.send(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).send({ error: "Failed to get users" });
  }
});

// Get user by email
router.get('/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await Users.findOne({ email });
    res.send(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).send({ error: "Failed to get user" });
  }
});

// Delete user by email
router.delete('/users/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const result = await Users.deleteOne({ email });
    if (result.deletedCount > 0) {
      res.send({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).send({ error: "User not found" });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ error: "Failed to delete user" });
  }
});

module.exports = router;
