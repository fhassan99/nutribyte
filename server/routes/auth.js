const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-change-me';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send('All fields required');
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).send('Email already registered');
    const user = await User.create({ firstName, lastName, email, password });
    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: { id: user._id, firstName, lastName, email }, token });

  } catch (err) {
    console.error(err);
    res.status(500).send('Registration failed');
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email & password required');
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send('User not found');
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).send('Invalid password');
    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

module.exports = router;
