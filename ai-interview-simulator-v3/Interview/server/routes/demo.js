const express = require('express');
const router = express.Router();
const {
  generateDemoQuestions,
  generateDemoFollowUp,
  evaluateDemoAnswer,
  generateDemoImprovements,
  generateDemoReport,
} = require('../services/demoModel');

// POST /api/demo/questions
router.post('/questions', (req, res) => {
  const { roundType, profile } = req.body;
  if (!roundType || !profile) return res.status(400).json({ error: 'roundType and profile required.' });
  try {
    const questions = generateDemoQuestions(roundType, profile);
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/demo/follow-up
router.post('/follow-up', (req, res) => {
  const { question, answer, profile } = req.body;
  if (!question || !answer || !profile) return res.status(400).json({ error: 'question, answer, profile required.' });
  try {
    const followUp = generateDemoFollowUp(question, answer, profile);
    res.json({ success: true, followUp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/demo/evaluate
router.post('/evaluate', (req, res) => {
  const { question, answer, profile } = req.body;
  if (!question || !answer || !profile) return res.status(400).json({ error: 'question, answer, profile required.' });
  try {
    const scores = evaluateDemoAnswer(question, answer, profile);
    const improvements = generateDemoImprovements(question, answer, scores, profile);
    res.json({ success: true, scores, improvements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/demo/report
router.post('/report', (req, res) => {
  const { interviewHistory, profile, selectedRounds } = req.body;
  if (!interviewHistory || !profile) return res.status(400).json({ error: 'interviewHistory and profile required.' });
  try {
    const report = generateDemoReport(interviewHistory, profile, selectedRounds || ['general', 'hr', 'technical']);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
