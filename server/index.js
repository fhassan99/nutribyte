console.log('Mounting routes...');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRouter     = require('./routes/auth');
const foodsRouter    = require('./routes/foods');
const entriesRouter  = require('./routes/entries');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nutribyte';
console.log('🌐 Connecting to MongoDB:', MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
console.log('Mounted /api/foods');

app.use('/api/foods:fdcId', foodsRouter);
console.log('Mounted /api/foods');

app.use('/api/entries', authMiddleware, entriesRouter);
console.log('Mounted /api/foods');


// ─── Serve React Frontend in Production ────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🔧 NutriByte API server running (dev mode)');
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





