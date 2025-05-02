// server/index.js
console.log('🌐 Connected to MongoDB:', MONGO_URI);
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

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nutribyte';
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/foods', foodsRouter);
app.use('/api/entries', authMiddleware, entriesRouter);

// ─── Serve React in Production ─────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const buildDir = path.join(__dirname, '../client/build');
  // 1) Serve all the static files out of client/build
  app.use(express.static(buildDir));
  // 2) On any request that isn't handled by the API, send back index.html
  app.use((req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
} else {
  // During development, just verify the server is up
  app.get('/', (req, res) => {
    res.send('Hello from NutriByte API');
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





