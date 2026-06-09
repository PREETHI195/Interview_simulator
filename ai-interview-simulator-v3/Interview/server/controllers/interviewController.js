const { chat } = require('../services/openai');

async function generateQuestions(req, res) {
  try {
    const { round, analysis } = req.body;
    if (!round || !analysis) {
      return res.status(400).json({ error: 'round and analysis are required.' });
    }

    const skillsStr = (analysis.skills || []).slice(0, 10).join(', ');
    const techStr = (analysis.technologies || []).slice(0, 10).join(', ');
    const projectsStr = (analysis.projects || [])
      .slice(0, 3)
      .map(p => p.name)
      .join(', ');

    let systemPrompt = '';
    let userPrompt = '';

    if (round === 'general') {
      systemPrompt = 'You are an experienced interviewer conducting a general interview round. Ask thoughtful, open-ended questions.';
      userPrompt = `Generate exactly 5 general interview questions for a candidate named ${analysis.name || 'the candidate'} with the title "${analysis.title || 'Software Engineer'}". 
Questions should cover: background, career goals, strengths/weaknesses, work style, motivation.
Return ONLY valid JSON: { "questions": ["q1", "q2", "q3", "q4", "q5"] }`;
    } else if (round === 'hr') {
      systemPrompt = 'You are an HR interviewer. Ask behavioral and cultural fit questions.';
      userPrompt = `Generate exactly 5 HR interview questions for ${analysis.name || 'a candidate'} applying for a ${analysis.title || 'tech'} role.
Use STAR method prompts (Situation, Task, Action, Result). Cover: teamwork, conflict resolution, leadership, adaptability, values.
Return ONLY valid JSON: { "questions": ["q1", "q2", "q3", "q4", "q5"] }`;
    } else if (round === 'technical') {
      systemPrompt = 'You are a senior technical interviewer. Ask role-specific technical questions.';
      userPrompt = `Generate exactly 5 technical interview questions tailored to this candidate:
- Skills: ${skillsStr}
- Technologies: ${techStr}
- Projects: ${projectsStr}

Mix conceptual, problem-solving, and experience-based questions about their actual tech stack.
Return ONLY valid JSON: { "questions": ["q1", "q2", "q3", "q4", "q5"] }`;
    } else {
      return res.status(400).json({ error: 'Invalid round. Must be: general, hr, or technical' });
    }

    const result = await chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      true
    );

    const parsed = JSON.parse(result);
    return res.json({ success: true, questions: parsed.questions });
  } catch (err) {
    console.error('Questions error:', err.message);
    return res.status(500).json({ error: 'Failed to generate questions.' });
  }
}

async function generateFollowUp(req, res) {
  try {
    const { question, answer, round, analysis } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required.' });
    }

    const prompt = `You are interviewing a ${analysis?.title || 'software engineer'} in a ${round || 'technical'} interview round.

Previous question: "${question}"
Candidate answered: "${answer}"

Analyze the answer and generate ONE insightful follow-up question that:
- Digs deeper into their answer
- Probes for specifics or examples they haven't mentioned
- Challenges them constructively
- Is relevant to the ${round} context

Return ONLY valid JSON: { "followUp": "your follow-up question here" }`;

    const result = await chat(
      [{ role: 'user', content: prompt }],
      true
    );

    const parsed = JSON.parse(result);
    return res.json({ success: true, followUp: parsed.followUp });
  } catch (err) {
    console.error('Follow-up error:', err.message);
    return res.status(500).json({ error: 'Failed to generate follow-up question.' });
  }
}

async function generateReport(req, res) {
  try {
    const { answers, analysis } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required.' });
    }

    const answersText = answers
      .map((a, i) => `Q${i + 1} [${a.round}]: ${a.question}\nAnswer: ${a.answer}`)
      .join('\n\n');

    const prompt = `You are a senior hiring manager evaluating a job candidate after a 3-round interview.

Candidate: ${analysis?.name || 'Candidate'}
Role: ${analysis?.title || 'Software Engineer'}
Skills: ${(analysis?.skills || []).join(', ')}

Interview Transcript:
${answersText.substring(0, 5000)}

Evaluate the candidate comprehensively. Return ONLY valid JSON:
{
  "technicalScore": <0-100 integer>,
  "communicationScore": <0-100 integer>,
  "confidenceScore": <0-100 integer>,
  "problemSolvingScore": <0-100 integer>,
  "overallScore": <0-100 integer>,
  "recommendation": "Strong Hire | Hire | Maybe | No Hire",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"],
  "summary": "3-4 sentence overall evaluation paragraph",
  "roundScores": {
    "general": <0-100>,
    "hr": <0-100>,
    "technical": <0-100>
  }
}`;

    const result = await chat(
      [{ role: 'user', content: prompt }],
      true
    );

    const parsed = JSON.parse(result);
    return res.json({ success: true, report: parsed });
  } catch (err) {
    console.error('Report error:', err.message);
    return res.status(500).json({ error: 'Failed to generate report.' });
  }
}

module.exports = { generateQuestions, generateFollowUp, generateReport };
