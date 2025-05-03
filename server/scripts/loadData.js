// server/scripts/loadData.js
require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const Food = require("../models/Food");

// Generic function to process remote JSON files that are newline-delimited
async function processRemoteJson(url, onObject) {
  const res = await axios.get(url);
  const lines = res.data.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line || line === "[" || line === "]" || line === ",") continue;
    if (line.endsWith(",")) line = line.slice(0, -1);
    try {
      const obj = JSON.parse(line);
      await onObject(obj);
    } catch (err) {
      console.error(`Skipping invalid JSON line from ${url}: ${err.message}`);
    }
  }
}

async function run() {
  const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/nutribyte";
  await mongoose.connect(MONGO_URI);
  console.log(" MongoDB connected to", MONGO_URI);

  await Food.deleteMany({});
  console.log("🗑️  Cleared Food collection");

  const docMap = new Map();

  // URLs to your JSON data (host these files on GitHub, S3, etc.)
  const BASE_URL =
    "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/data";

  // 1) branded_foods.json
  console.log("  Loading branded_foods.json...");
  await processRemoteJson(`${BASE_URL}/branded_foods.json`, (obj) => {
    docMap.set(obj.fdcId, {
      fdcId: obj.fdcId,
      description: obj.description || "",
      brandOwner: obj.brandOwner || "",
      ingredients: obj.ingredients || "",
      nutrients: [],
      attributes: [],
    });
  });

  // 2) food_descriptions.json
  console.log("  Loading food_descriptions.json...");
  await processRemoteJson(`${BASE_URL}/food_descriptions.json`, (obj) => {
    const doc = docMap.get(obj.fdcId);
    if (doc && !doc.description) doc.description = obj.description;
  });

  // 3) food_attributes.json
  console.log("  Loading food_attributes.json...");
  await processRemoteJson(`${BASE_URL}/food_attributes.json`, (obj) => {
    const doc = docMap.get(obj.fdcId);
    if (doc) {
      doc.attributes.push({
        attributeId: obj.attributeId,
        name: obj.name,
        value: obj.value,
      });
    }
  });

  // 4) food_nutrients.json
  console.log("  Loading food_nutrients.json...");
  await processRemoteJson(`${BASE_URL}/food_nutrients.json`, (obj) => {
    const doc = docMap.get(obj.fdcId);
    if (doc) {
      doc.nutrients.push({
        nutrientId: obj.nutrientId,
        nutrientName: obj.nutrientName,
        nutrientUnit: obj.nutrientUnit,
        amount: obj.amount,
      });
    }
  });

  const docs = Array.from(docMap.values());
  console.log(`🔨 Prepared ${docs.length} documents for insert`);

  const BATCH_SIZE = 5000;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await Food.insertMany(batch, { ordered: false });
    console.log(
      `   → Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(
        docs.length / BATCH_SIZE
      )}`
    );
  }

  console.log(" All foods saved in bulk!");
  await mongoose.disconnect();
  console.log("🔌 MongoDB connection closed");
}

run().catch((err) => {
  console.error("  Error loading data:", err);
  process.exit(1);
});
