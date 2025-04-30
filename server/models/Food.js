// server/models/Food.js
const mongoose = require('mongoose');

const NutrientSchema = new mongoose.Schema({
  nutrientId:   { type: Number, required: true },
  nutrientName: { type: String, required: true },
  nutrientUnit: { type: String, required: true },
  amount:       { type: Number, required: true },
});

const AttributeSchema = new mongoose.Schema({
  attributeId: { type: Number, required: true },
  name:        { type: String, required: true },
  value:       { type: String, required: true },
});

const FoodSchema = new mongoose.Schema({
  fdcId:        { type: Number, required: true, unique: true },
  description:  { type: String, required: true },
  brandOwner:   String,
  ingredients:  String,
  nutrients:   [NutrientSchema],
  attributes:   [AttributeSchema],
});

module.exports = mongoose.model('Food', FoodSchema);


