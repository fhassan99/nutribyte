// server/scripts/importAndMerge.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const Food = require('../models/Food');

const BATCH_SIZE = 1000;
const DATA_DIR = path.join(__dirname); // JSON files are in the same directory as this script
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nutribyte';

const filePaths = {
  branded: 'branded_foods.json',
  descriptions: 'food_descriptions.json',
  attributes: 'food_attributes.json',
  nutrients: 'food_nutrients.json'
};

async function readJsonLines(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const docs = [];
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '[' || trimmed === ']') continue;
    try {
      const json = JSON.parse(trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed);
      docs.push(json);
    } catch (err) {
      console.warn(`⚠️ Skipping invalid line in ${fileName}:`, err.message);
    }
  }
  return docs;
}

async function run() {
  console.log('✅ Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);

  console.log('🧹 Dropping foods collection...');
  await Food.deleteMany({});

  const branded      = await readJsonLines(filePaths.branded);
  const descriptions = await readJsonLines(filePaths.descriptions);
  const attributes   = await readJsonLines(filePaths.attributes);
  const nutrients    = await readJsonLines(filePaths.nutrients);

  const descMap = new Map(descriptions.map(d => [d.fdcId, d.description]));
  const attrMap = new Map();
  const nutrMap = new Map();

  for (const a of attributes) {
    if (!attrMap.has(a.fdcId)) attrMap.set(a.fdcId, []);
    attrMap.get(a.fdcId).push({ attributeId: a.attributeId, name: a.name, value: a.value });
  }

  for (const n of nutrients) {
    if (!nutrMap.has(n.fdcId)) nutrMap.set(n.fdcId, []);
    nutrMap.get(n.fdcId).push({
      nutrientId: n.nutrientId,
      nutrientName: n.nutrientName,
      nutrientUnit: n.nutrientUnit,
      amount: n.amount
    });
  }

  const finalDocs = branded.map(b => ({
    fdcId: b.fdcId,
    description: descMap.get(b.fdcId) || b.description || '',
    brandOwner: b.brandOwner || '',
    ingredients: b.ingredients || '',
    attributes: attrMap.get(b.fdcId) || [],
    nutrients: nutrMap.get(b.fdcId) || []
  }));

  for (let i = 0; i < finalDocs.length; i += BATCH_SIZE) {
    const batch = finalDocs.slice(i, i + BATCH_SIZE);
    await Food.insertMany(batch, { ordered: false });
    console.log(`→ Inserted ${i + batch.length} of ${finalDocs.length}`);
  }

  console.log('🎉 Foods collection imported and merged!');
  await mongoose.disconnect();
  console.log('🔌 MongoDB connection closed.');
}

run().catch(err => {
  console.error('❌ Import+Merge failed:', err);
  process.exit(1);
});

