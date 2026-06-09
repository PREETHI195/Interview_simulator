const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromFile } = require('../services/extractionService');
const { analyzeResume } = require('../services/openaiService');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  const ext = file.originalname.toLowerCase().split('.').pop();
  const allowedExts = ['pdf', 'docx', 'doc', 'txt'];

  if (allowed.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload PDF, DOCX, DOC, or TXT files only.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/upload-resume
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Please select a resume file.' });
  }

  try {
    const text = await extractTextFromFile(req.file.path, req.file.mimetype, req.file.originalname);

    // Cleanup uploaded file
    try { fs.unlinkSync(req.file.path); } catch (_) {}

    res.json({
      success: true,
      text,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    res.status(422).json({ error: err.message || 'Failed to extract text from resume.' });
  }
});

// POST /api/analyze
router.post('/analyze', async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ error: 'Resume text is too short or empty.' });
  }

  try {
    const analysis = await analyzeResume(resumeText);
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to analyze resume.' });
  }
});

module.exports = router;
