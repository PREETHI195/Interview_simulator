const express = require('express');
const router = express.Router();
const {
  generateQuestions, generateFollowUp,
  evaluateAnswer, generateImprovements, generateReport
} = require('../services/openaiService');

// POST /api/questions
router.post('/questions', async (req, res) => {
  const { roundType, resumeData } = req.body;
  if (!roundType || !resumeData)
    return res.status(400).json({ error: 'roundType and resumeData are required.' });
  if (!['general', 'hr', 'technical'].includes(roundType))
    return res.status(400).json({ error: 'roundType must be general, hr, or technical.' });
  try {
    const questions = await generateQuestions(roundType, resumeData);
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/follow-up
router.post('/follow-up', async (req, res) => {
  const { question, answer, resumeData } = req.body;
  if (!question || !answer)
    return res.status(400).json({ error: 'question and answer are required.' });
  try {
    const followUp = await generateFollowUp(question, answer, resumeData || {});
    res.json({ success: true, followUp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/evaluate  (NEW v2 endpoint)
router.post('/evaluate', async (req, res) => {
  const { question, answer, resumeData } = req.body;
  if (!question || !answer)
    return res.status(400).json({ error: 'question and answer are required.' });
  try {
    const [scores, improvements] = await Promise.all([
      evaluateAnswer(question, answer, resumeData || {}),
      generateImprovements(question, answer)
    ]);
    res.json({ success: true, scores, improvements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/report
router.post('/report', async (req, res) => {
  const { interviewHistory, resumeData, selectedRounds } = req.body;
  if (!interviewHistory || !Array.isArray(interviewHistory) || interviewHistory.length === 0)
    return res.status(400).json({ error: 'interviewHistory array is required.' });
  try {
    const report = await generateReport(interviewHistory, resumeData || {}, selectedRounds);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
