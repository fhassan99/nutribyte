const mongoose = require('mongoose');

const CalorieEntrySchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:        { type: Date, required: true },
  time:        { type: String, required: true }, // e.g. "14:30:00"
  description: { type: String, required: true },
  calories:    { type: Number, required: true, default: 0 },
  protein:     { type: Number, required: true, default: 0 },
  carbs:       { type: Number, required: true, default: 0 },
  fat:         { type: Number, required: true, default: 0 },
  sugars:      { type: Number, required: true, default: 0 },
}, {
  timestamps: true
});

module.exports = mongoose.model('CalorieEntry', CalorieEntrySchema);




