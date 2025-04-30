const express = require('express');
const router = express.Router();
const CalorieEntry = require('../models/CalorieEntry');

// Note: authMiddleware is applied in index.js, so req.userId is set

// GET /api/entries?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    const filter = { userId };

    if (date) {
      // only entries for that calendar day
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    // sort by time descending
    const entries = await CalorieEntry.find(filter).sort({ time: -1 });
    res.json(entries);
  } catch (err) {
    console.error('GET /api/entries error:', err);
    res.status(500).send('Could not fetch entries');
  }
});

// POST /api/entries
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    let {
      date,
      time,
      description,
      calories = 0,
      protein  = 0,
      carbs    = 0,
      fat      = 0,
      sugars   = 0
    } = req.body;

    if (!date || !time || !description) {
      return res.status(400).send('Date, time and description required');
    }

    const entry = await CalorieEntry.create({
      userId,
      date,
      time,
      description,
      calories,
      protein,
      carbs,
      fat,
      sugars
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Error in POST /api/entries:', err);
    res.status(400).send('Invalid entry data');
  }
});

// PATCH /api/entries/:id
router.patch('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { time } = req.body;
    if (!time) return res.status(400).send('Time required');

    const entry = await CalorieEntry.findOne({ _id: req.params.id, userId });
    if (!entry) return res.status(404).send('Entry not found');

    entry.time = time;
    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error('PATCH /api/entries/:id error:', err);
    res.status(500).send('Could not update entry');
  }
});

// DELETE /api/entries/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const result = await CalorieEntry.deleteOne({ _id: req.params.id, userId });
    if (result.deletedCount === 0) return res.status(404).send('Entry not found');
    res.sendStatus(204);
  } catch (err) {
    console.error('DELETE /api/entries/:id error:', err);
    res.status(500).send('Could not delete entry');
  }
});

module.exports = router;



