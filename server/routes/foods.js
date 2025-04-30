// server/routes/foods.js
const express = require('express');
const Food    = require('../models/Food');
const router  = express.Router();

// GET /api/foods?search=rice
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;
    const regex = new RegExp(search, 'i');

    // fetch up to 50 matching docs
    const results = await Food.find({
      $or: [
        { description: regex },
        { brandOwner:  regex }
      ]
    })
    .limit(50);

    // log only the count, not the full documents
    console.log(`🔢 Found ${results.length} foods for search="${search}"`);

    // if you ever need a quick peek at the first few items:
    // console.log('  Sample:', results.slice(0,5).map(f => ({
    //   fdcId:       f.fdcId,
    //   description: f.description
    // })));

    res.json(results);
  } catch (err) {
    console.error('Error fetching foods:', err);
    res.status(500).json({ error: 'Server error fetching foods' });
  }
});

module.exports = router;





