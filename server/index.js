const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const authRouter = require('./routes/auth');
const foodsRouter = require('./routes/foods');
const entriesRouter = require('./routes/entries');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutribyte';
console.log('🌐 Connecting to MongoDB:', MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── API Routes ────────────────────────────────────────────────────────────────
console.log('🔁 Mounting API routes...');
app.use('/api/auth', authRouter);
app.use('/api/foods', foodsRouter);
app.use('/api/entries', authMiddleware, entriesRouter);
console.log('✅ All routes mounted');

// ─── Serve React Frontend in Production ────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');

  // Serve static files
  app.use(express.static(buildPath));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🔧 NutriByte API server running (dev mode)');
  });
}

// ─── Error Handling Middleware ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
