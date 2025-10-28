const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  // NOTE: Hash password in prod
  const user = await User.create({ name, email, passwordHash: password });
  res.json({ ok: true, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email }});
  if (!user || user.passwordHash !== password) return res.status(401).json({ error: 'Invalid' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email }});
});

module.exports = router;
