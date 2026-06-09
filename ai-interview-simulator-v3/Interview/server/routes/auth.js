const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();
const { createUser, findByEmail, saveToken, removeToken, findByToken, getUserProfile, getUserStats, addInterviewRecord } = require('../services/userStore');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, and password are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (findByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists.' });

  const hash = await bcrypt.hash(password, 10);
  const user = createUser(name.trim(), email.toLowerCase().trim(), hash);
  const token = crypto.randomBytes(32).toString('hex');
  saveToken(token, user.email);

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required.' });

  const user = findByEmail(email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = crypto.randomBytes(32).toString('hex');
  saveToken(token, user.email);

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  removeToken(token);
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const profile = getUserProfile(req.user.id);
  res.json({ success: true, user: profile });
});

// GET /api/auth/stats
router.get('/stats', authMiddleware, (req, res) => {
  const stats = getUserStats(req.user.id);
  res.json({ success: true, stats });
});

// POST /api/auth/record-interview
router.post('/record-interview', authMiddleware, (req, res) => {
  const { report, mode, rounds, questionsAnswered, durationMinutes } = req.body;
  if (!report) return res.status(400).json({ error: 'report is required.' });

  const session = addInterviewRecord(req.user.id, {
    mode: mode || 'ai',
    rounds: rounds || [],
    overallScore: report.overallScore || 0,
    technicalScore: report.technicalScore || 0,
    communicationScore: report.communicationScore || 0,
    confidenceScore: report.confidenceScore || 0,
    recommendation: report.recommendation || 'N/A',
    skillsAssessed: report.skillsAssessed || [],
    questionsAnswered: questionsAnswered || 0,
    durationMinutes: durationMinutes || 0,
  });

  const stats = getUserStats(req.user.id);
  res.json({ success: true, session, stats });
});

module.exports = router;
