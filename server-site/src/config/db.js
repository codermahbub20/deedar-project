const mongoose = require('mongoose');
require('dotenv').config();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://deedarlouth:aVEZD9gUThNpmOoL@cluster0.bturv.mongodb.net/deedarExpress?retryWrites=true&w=majority&appName=Cluster0`, {

    });
    console.log('Connected to MongoDB using Mongoose');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectToMongoDB;
