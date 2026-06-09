const OpenAI = require('openai');

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3000', // Optional, for OpenRouter rankings
      'X-Title': 'AI Interview Simulator', // Optional
    }
  });
}

async function analyzeResume(resumeText) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a strict resume parser. Return ONLY valid JSON. Extract ONLY information explicitly present in the resume. Do NOT add or infer skills.'
      },
      {
        role: 'user',
        content: `Parse this resume. Return ONLY this JSON with no extra text or markdown:
{
  "name": "full name or Unknown",
  "title": "role from resume",
  "summary": "one line summary",
  "skills": ["ONLY skills explicitly listed in resume"],
  "technologies": ["ONLY tools/tech explicitly mentioned"],
  "projects": [{"name": "name", "description": "what it does", "technologies": ["tech used"]}],
  "experience": [{"company": "name", "role": "title", "duration": "period"}],
  "education": "degree and institution",
  "totalExperience": "X years"
}
Do NOT add skills not in the resume.
Resume:
${resumeText.substring(0, 4000)}`
      }
    ],
    temperature: 0.1,
    max_tokens: 1500
  });
  const content = response.choices[0].message.content.trim();
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// FIXED QUESTIONS per spec (always used for general/hr)
const FIXED_QUESTIONS = {
  general: [
    { id: 1, question: 'Tell me about yourself.', category: 'General' },
    { id: 2, question: 'What is your professional background?', category: 'General' },
    { id: 3, question: 'Why did you choose this field?', category: 'General' },
    { id: 4, question: 'What are your career goals?', category: 'General' },
    { id: 5, question: 'What motivates you professionally?', category: 'General' },
  ],
  hr: [
    { id: 1, question: 'What are your key strengths?', category: 'HR' },
    { id: 2, question: 'What is your biggest weakness?', category: 'HR' },
    { id: 3, question: 'Describe a challenge you faced and how you resolved it.', category: 'HR' },
    { id: 4, question: 'Why should we hire you?', category: 'HR' },
    { id: 5, question: 'Where do you see yourself in 5 years?', category: 'HR' },
  ]
};

async function generateQuestions(roundType, resumeData) {
  // General and HR use fixed questions per spec
  if (roundType === 'general') return FIXED_QUESTIONS.general;
  if (roundType === 'hr') return FIXED_QUESTIONS.hr;

  // Technical: strictly from resume skills/projects only
  const client = getClient();
  const allSkills = [...new Set([...(resumeData.skills || []), ...(resumeData.technologies || [])])];
  const skillsStr = allSkills.join(', ');
  const projStr = (resumeData.projects || [])
    .slice(0, 4)
    .map(p => `${p.name}: ${p.description} (tech: ${(p.technologies || []).join(', ')})`)
    .join('; ');

  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a strict technical interviewer. Return ONLY valid JSON arrays. CRITICAL: Only generate questions about skills and projects EXPLICITLY listed. Do NOT invent technologies.'
      },
      {
        role: 'user',
        content: `Generate exactly 5 technical interview questions STRICTLY from these resume items ONLY.
Resume Skills: ${skillsStr}
Resume Projects: ${projStr}

RULES:
1. Each question must reference a SPECIFIC skill or project from above
2. Questions must be SHORT and PROFESSIONAL
3. Do NOT ask about any technology not in the resume
4. For skills: ask practical usage questions
5. For projects: ask what decisions were made and why

Return JSON: [{"id":1,"question":"...","category":"Technical","skill_tested":"exact skill name from resume"}]`
      }
    ],
    temperature: 0.5,
    max_tokens: 900
  });

  const content = response.choices[0].message.content.trim();
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

async function generateFollowUp(question, answer, resumeData) {
  const client = getClient();
  const allSkills = [...new Set([...(resumeData.skills || []), ...(resumeData.technologies || [])])];
  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a probing interviewer. Generate ONE short, specific follow-up question. Base it on the candidate\'s actual answer and their resume skills. Return only the question as plain text.'
      },
      {
        role: 'user',
        content: `Candidate resume skills: ${allSkills.join(', ')}
Original question: "${question}"
Candidate answer: "${answer}"

Ask ONE specific follow-up question that probes deeper into what they said, using their resume skills as context.`
      }
    ],
    temperature: 0.7,
    max_tokens: 120
  });
  return response.choices[0].message.content.trim();
}

async function evaluateAnswer(question, answer, resumeData) {
  const client = getClient();
  const allSkills = [...new Set([...(resumeData.skills || []), ...(resumeData.technologies || [])])];
  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an interview evaluator. Return ONLY valid JSON. Score strictly and fairly.'
      },
      {
        role: 'user',
        content: `Evaluate this answer for a ${resumeData.title || 'developer'} candidate.
Resume skills: ${allSkills.join(', ')}
Question: "${question}"
Answer: "${answer}"

Scoring criteria:
- technical_score: Technical accuracy and depth (0-10)
- clarity_score: How clear and structured the answer is (0-10)
- confidence_score: Confidence and conviction shown (0-10)
- overall_score: Overall quality (0-10)

Return ONLY: {"technical_score":0-10,"clarity_score":0-10,"confidence_score":0-10,"overall_score":0-10}`
      }
    ],
    temperature: 0.2,
    max_tokens: 150
  });
  const content = response.choices[0].message.content.trim();
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

async function generateImprovements(question, answer) {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a concise interview coach. Return ONLY a JSON array of 2-3 short actionable improvement strings. No markdown, no explanation.'
      },
      {
        role: 'user',
        content: `Question: "${question}"\nAnswer: "${answer}"\nReturn 2-3 short actionable improvements as JSON array: ["improvement 1", "improvement 2"]`
      }
    ],
    temperature: 0.5,
    max_tokens: 200
  });
  const content = response.choices[0].message.content.trim();
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

async function generateReport(interviewHistory, resumeData, selectedRounds) {
  const client = getClient();
  const historyText = interviewHistory
    .map(h => `Q: ${h.question}\nA: ${h.answer}`)
    .join('\n\n');
  const allSkills = [...new Set([...(resumeData.skills || []), ...(resumeData.technologies || [])])];

  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert interview evaluator. Return ONLY valid JSON. Be specific and fair.'
      },
      {
        role: 'user',
        content: `Evaluate this complete interview for ${resumeData.name || 'candidate'} (${resumeData.title || 'developer'}).
Resume skills: ${allSkills.join(', ')}
Rounds completed: ${(selectedRounds || ['general', 'hr', 'technical']).join(', ')}
Interview transcript:
${historyText.substring(0, 3000)}

Return ONLY this JSON:
{
  "overallScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "recommendation": "Strong Hire / Hire / Maybe / No Hire",
  "roundScores": {"general": <0-100>, "hr": <0-100>, "technical": <0-100>},
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"],
  "summary": "2-3 sentence overall assessment",
  "skillsAssessed": ["skill1", "skill2"]
}`
      }
    ],
    temperature: 0.3,
    max_tokens: 900
  });
  const content = response.choices[0].message.content.trim();
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { analyzeResume, generateQuestions, generateFollowUp, evaluateAnswer, generateImprovements, generateReport };
