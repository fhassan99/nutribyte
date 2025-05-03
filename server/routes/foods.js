const express = require("express");
const Food = require("../models/Food");
const router = express.Router();

// GET /api/foods?search=&page=1&limit=20
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const pg = Math.max(1, Number(page));
    const lim = Math.max(1, Number(limit));

    const filter =
      search.trim() === ""
        ? {}
        : {
            $or: [
              { description: new RegExp(search, "i") },
              { brandOwner: new RegExp(search, "i") },
            ],
          };

    const [count, foods] = await Promise.all([
      Food.countDocuments(filter),
      Food.find(filter)
        .skip((pg - 1) * lim)
        .limit(lim),
    ]);

    res.json({ foods, count });
  } catch (err) {
    console.error("  Food search error:", err);
    res.status(500).json({ error: "Server error fetching foods" });
  }
});

// GET /api/foods/:fdcId
router.get("/:fdcId", async (req, res) => {
  try {
    const food = await Food.findOne({ fdcId: Number(req.params.fdcId) });
    if (!food) return res.status(404).json({ error: "Food not found" });
    res.json(food);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching food" });
  }
});

module.exports = router;
