const { extractText } = require('../services/extractor');
const { chat } = require('../services/openai');

async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    if (size === 0) {
      return res.status(400).json({ error: 'File is empty.' });
    }

    const text = await extractText(buffer, mimetype, originalname);

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        error: 'Could not extract enough text from resume. Please ensure it is a text-based PDF or DOCX (not a scanned image).',
      });
    }

    return res.json({
      success: true,
      text,
      filename: originalname,
      charCount: text.length,
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to extract text from resume.' });
  }
}

async function analyzeResume(req, res) {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }

    const prompt = `Analyze the following resume and extract structured information. Return ONLY valid JSON.

Resume:
"""
${resumeText.substring(0, 4000)}
"""

Return this exact JSON structure:
{
  "name": "candidate full name or Unknown",
  "title": "current or desired job title",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", ...],
  "technologies": ["tech1", "tech2", ...],
  "projects": [
    {
      "name": "project name",
      "description": "brief description",
      "tech": ["tech1", "tech2"]
    }
  ],
  "experience": [
    {
      "company": "company name",
      "role": "job title",
      "duration": "time period"
    }
  ],
  "education": "highest education"
}`;

    const result = await chat(
      [{ role: 'user', content: prompt }],
      true
    );

    const parsed = JSON.parse(result);
    return res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error('Analysis error:', err.message);
    return res.status(500).json({ error: 'Failed to analyze resume. Please try again.' });
  }
}

module.exports = { uploadResume, analyzeResume };
