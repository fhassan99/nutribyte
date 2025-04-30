// server/routes/foods.js
const express = require('express');
const Food = require('../models/Food');
const router = express.Router();

// GET /api/foods?search=rice
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;
    // case-insensitive match against description or brandOwner
    const regex = new RegExp(search, 'i');
    const results = await Food.find({
      $or: [
        { description: regex },
        { brandOwner: regex }
      ]
    })
    .limit(50);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching foods' });
  }
});

module.exports = router;




