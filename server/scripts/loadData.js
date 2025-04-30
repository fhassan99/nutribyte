// server/scripts/loadData.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const Food = require('../models/Food');

// Generic function to process JSON files that are either newline-delimited
// objects or arrays of objects. It calls `onObject(obj)` for each parsed object.
async function processJson(filename, onObject) {
  const filePath = path.join(__dirname, filename);
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (let line of rl) {
    line = line.trim();
    if (!line) continue;
    // Skip array brackets or commas
    if (line === '[' || line === ']' || line === ',') continue;
    // Remove trailing comma
    if (line.endsWith(',')) line = line.slice(0, -1);
    try {
      const obj = JSON.parse(line);
      await onObject(obj);
    } catch (err) {
      console.error(`Skipping invalid JSON line in ${filename}: ${err.message}`);
    }
  }
}

async function run() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutribyte';
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ MongoDB connected to', MONGO_URI);

  await Food.deleteMany({});
  console.log('🗑️  Cleared Food collection');

  // Map to build full docs
  const docMap = new Map();

  // 1) branded_foods.json
  console.log('📥 Loading branded_foods.json...');
  await processJson('branded_foods.json', obj => {
    docMap.set(obj.fdcId, {
      fdcId: obj.fdcId,
      description: obj.description || '',
      brandOwner: obj.brandOwner || '',
      ingredients: obj.ingredients || '',
      nutrients: [],
      attributes: []
    });
  });

  // 2) food_descriptions.json
  console.log('📥 Loading food_descriptions.json...');
  await processJson('food_descriptions.json', obj => {
    const doc = docMap.get(obj.fdcId);
    if (doc && !doc.description) doc.description = obj.description;
  });

  // 3) food_attributes.json
  console.log('📥 Loading food_attributes.json...');
  await processJson('food_attributes.json', obj => {
    const doc = docMap.get(obj.fdcId);
    if (doc) {
      doc.attributes.push({
        attributeId: obj.attributeId,
        name: obj.name,
        value: obj.value
      });
    }
  });

  // 4) food_nutrients.json
  console.log('📥 Loading food_nutrients.json...');
  await processJson('food_nutrients.json', obj => {
    const doc = docMap.get(obj.fdcId);
    if (doc) {
      doc.nutrients.push({
        nutrientId: obj.nutrientId,
        nutrientName: obj.nutrientName,
        nutrientUnit: obj.nutrientUnit,
        amount: obj.amount
      });
    }
  });

  // Prepare docs array
  const docs = Array.from(docMap.values());
  console.log(`🔨 Prepared ${docs.length} documents for insert`);

  // Bulk insert in batches
  const BATCH_SIZE = 5000;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await Food.insertMany(batch, { ordered: false });
    console.log(`   → Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(docs.length / BATCH_SIZE)}`);
  }

  console.log('✅ All foods saved in bulk!');
  await mongoose.disconnect();
  console.log('🔌 MongoDB connection closed');
}

run().catch(err => {
  console.error('❌ Error loading data:', err);
  process.exit(1);
});






