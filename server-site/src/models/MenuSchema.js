const mongoose = require('mongoose');

const IncludedItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true }
}, { _id: false });;


const VarietySchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, }
}, { _id: false });

const SpicyLevelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, }
}, { _id: false });



const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  descrpition: { type: String },// hey  can you please send the description from the frontend 
  varieties: [VarietySchema],
  itemsIncluded: [IncludedItemSchema],
  spicyLevels: [SpicyLevelSchema]

});


const MenuSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  items: [ItemSchema]
});

module.exports = mongoose.model('MenuItem', MenuSchema);
