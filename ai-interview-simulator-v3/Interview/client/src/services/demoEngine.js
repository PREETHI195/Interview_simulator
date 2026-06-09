/**
 * Demo AI Engine - Local model trained on user's real input details
 * Uses the user's name, place, skills for personalized questions & scoring
 * No API key required
 */

// ===== QUESTION BANK =====
const GENERAL_QUESTIONS = [
  (p) => `Tell me about yourself, ${p.name}. What's your professional journey so far?`,
  (p) => `${p.name}, why did you choose a career in ${p.skills[0] || 'technology'}?`,
  (p) => `What motivated you to develop skills in ${p.skills.slice(0,2).join(' and ')}?`,
  (p) => `Where do you see yourself in 5 years, ${p.name}?`,
  (p) => `What are your biggest career goals as a ${p.role || 'professional'} based in ${p.place}?`,
];

const HR_QUESTIONS = [
  (p) => `What do you consider your top strength as a ${p.role || 'developer'}, ${p.name}?`,
  (p) => `${p.name}, describe a challenge you faced while working with ${p.skills[0] || 'your team'} and how you resolved it.`,
  (p) => `Why should we hire you over other ${p.role || 'candidates'} with similar skills?`,
  (p) => `How do you stay updated with trends in ${p.skills[0] || 'technology'}, especially from ${p.place}?`,
  (p) => `${p.name}, what is your biggest professional weakness and how are you working on it?`,
];

const TECHNICAL_TEMPLATES = {
  // Frontend
  'react': [
    (p) => `${p.name}, explain the difference between useState and useReducer in React with an example from your experience.`,
    (p) => `How have you optimized React component performance in your projects, ${p.name}?`,
  ],
  'javascript': [
    (p) => `${p.name}, explain closures in JavaScript and how you've used them in real projects.`,
    (p) => `What is event loop in JavaScript? How does it affect async code in your ${p.role || 'work'}?`,
  ],
  'typescript': [
    (p) => `${p.name}, how does TypeScript's type system improve code quality in your projects?`,
    (p) => `Explain generics in TypeScript with a practical example you've used, ${p.name}.`,
  ],
  'html': [
    (p) => `${p.name}, explain semantic HTML and why it matters for accessibility.`,
    (p) => `How do you ensure cross-browser compatibility in your HTML/CSS work?`,
  ],
  'css': [
    (p) => `${p.name}, explain CSS specificity and how conflicts are resolved.`,
    (p) => `How have you used CSS Grid or Flexbox in your projects?`,
  ],
  // Backend
  'node.js': [
    (p) => `${p.name}, how does Node.js handle concurrent requests with a single thread?`,
    (p) => `Explain middleware in Express.js and how you've used it in your projects.`,
  ],
  'python': [
    (p) => `${p.name}, explain list comprehensions vs generators in Python with examples.`,
    (p) => `How have you used Python's decorators in your projects?`,
  ],
  'django': [
    (p) => `${p.name}, explain Django's MTV architecture and how it differs from MVC.`,
    (p) => `How do you handle database migrations in Django projects?`,
  ],
  'java': [
    (p) => `${p.name}, explain OOP principles you apply most in your Java code.`,
    (p) => `What is the difference between abstract classes and interfaces in Java?`,
  ],
  // Databases
  'sql': [
    (p) => `${p.name}, explain the difference between INNER JOIN and LEFT JOIN with an example.`,
    (p) => `How do you optimize slow SQL queries in your projects?`,
  ],
  'mongodb': [
    (p) => `${p.name}, when would you choose MongoDB over a relational database?`,
    (p) => `Explain MongoDB's aggregation pipeline with a real use case.`,
  ],
  'postgresql': [
    (p) => `${p.name}, what makes PostgreSQL different from MySQL in your experience?`,
    (p) => `How have you used PostgreSQL's indexing to improve query performance?`,
  ],
  // DevOps/Cloud
  'docker': [
    (p) => `${p.name}, explain the difference between Docker images and containers.`,
    (p) => `How have you used Docker in your development workflow?`,
  ],
  'aws': [
    (p) => `${p.name}, which AWS services have you used and what for?`,
    (p) => `How do you manage security and IAM roles in AWS?`,
  ],
  'git': [
    (p) => `${p.name}, explain your Git branching strategy in team projects.`,
    (p) => `How do you handle merge conflicts in large codebases?`,
  ],
  // AI/ML
  'machine learning': [
    (p) => `${p.name}, explain overfitting and how you prevent it in your ML models.`,
    (p) => `What evaluation metrics do you use for classification vs regression problems?`,
  ],
  // Default fallback
  'default': [
    (p, skill) => `${p.name}, explain how you've used ${skill} in your projects.`,
    (p, skill) => `What are the key challenges you've faced working with ${skill} and how did you overcome them?`,
  ],
};

// ===== GENERATE QUESTIONS =====
export function generateDemoQuestions(roundType, profile) {
  if (roundType === 'general') {
    return GENERAL_QUESTIONS.map((fn, i) => ({
      id: i + 1,
      question: fn(profile),
      category: 'General',
    }));
  }

  if (roundType === 'hr') {
    return HR_QUESTIONS.map((fn, i) => ({
      id: i + 1,
      question: fn(profile),
      category: 'HR',
    }));
  }

  // Technical: use real skills
  const skills = profile.skills.slice(0, 6);
  const questions = [];

  skills.forEach((skill) => {
    const key = skill.toLowerCase();
    const templates = TECHNICAL_TEMPLATES[key] || TECHNICAL_TEMPLATES['default'];
    const q = templates[0];
    questions.push({
      id: questions.length + 1,
      question: q(profile, skill),
      category: 'Technical',
      skill_tested: skill,
    });
    if (questions.length < 5 && templates[1]) {
      const q2 = templates[1];
      questions.push({
        id: questions.length + 1,
        question: q2(profile, skill),
        category: 'Technical',
        skill_tested: skill,
      });
    }
    if (questions.length >= 5) return;
  });

  // If fewer than 5, pad with projects
  if (questions.length < 5 && profile.projects?.length > 0) {
    profile.projects.forEach((proj) => {
      if (questions.length >= 5) return;
      questions.push({
        id: questions.length + 1,
        question: `${profile.name}, walk me through the architecture and key decisions in your ${proj.name} project.`,
        category: 'Technical',
        skill_tested: proj.name,
      });
    });
  }

  return questions.slice(0, 5);
}

// ===== GENERATE FOLLOW-UP =====
const FOLLOWUP_TEMPLATES = [
  (ans, profile) => ans.toLowerCase().includes('worked') || ans.toLowerCase().includes('built')
    ? `Can you quantify the impact of that work, ${profile.name}? Any metrics or results?`
    : null,
  (ans, profile) => ans.length < 80
    ? `${profile.name}, could you elaborate on that with a specific example from your experience?`
    : null,
  (ans, profile) => ans.toLowerCase().includes('team')
    ? `What was your specific role in the team, ${profile.name}?`
    : null,
  (ans, profile) => ans.toLowerCase().includes('problem') || ans.toLowerCase().includes('challenge')
    ? `What would you do differently if you faced that challenge again, ${profile.name}?`
    : null,
  (ans, profile) => ans.toLowerCase().includes('learn') || ans.toLowerCase().includes('study')
    ? `How long did it take you to become proficient, ${profile.name}? What resources helped most?`
    : null,
];

export function generateDemoFollowUp(question, answer, profile) {
  // Try contextual follow-ups
  for (const fn of FOLLOWUP_TEMPLATES) {
    const result = fn(answer, profile);
    if (result) return result;
  }
  // Default smart follow-ups
  const defaults = [
    `Interesting, ${profile.name}. Can you give a concrete example from your work in ${profile.place || 'your projects'}?`,
    `How does your experience with ${profile.skills[0] || 'your skills'} help you here, ${profile.name}?`,
    `${profile.name}, what would you do differently with more experience?`,
    `Can you walk me through the technical decisions behind that, ${profile.name}?`,
    `How does that align with best practices in ${profile.role || 'software development'}, ${profile.name}?`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ===== EVALUATE ANSWER =====
export function evaluateDemoAnswer(question, answer, profile) {
  const ans = answer.trim();
  const words = ans.split(/\s+/).length;
  const hasName = ans.toLowerCase().includes(profile.name.toLowerCase());
  const hasSkill = profile.skills.some(s => ans.toLowerCase().includes(s.toLowerCase()));
  const hasExample = /for example|such as|instance|built|worked|created|developed|implemented/i.test(ans);
  const hasNumbers = /\d+/.test(ans);
  const isQuestion = question.toLowerCase().includes('technical') || question.toLowerCase().includes('explain') || question.toLowerCase().includes('how');

  // Technical score: penalize very short answers, reward examples & skill mention
  let technical = 5;
  if (hasSkill) technical += 2;
  if (hasExample) technical += 1.5;
  if (hasNumbers) technical += 0.5;
  if (words < 20 && isQuestion) technical -= 2;
  if (words > 80) technical += 1;
  technical = Math.min(10, Math.max(1, Math.round(technical)));

  // Clarity: based on structure & length
  let clarity = 5;
  if (words >= 30 && words <= 200) clarity += 2;
  if (words < 15) clarity -= 2;
  if (words > 250) clarity -= 1; // too wordy
  if (hasExample) clarity += 1;
  if (/first|then|finally|because|therefore/i.test(ans)) clarity += 1; // structured
  clarity = Math.min(10, Math.max(1, Math.round(clarity)));

  // Confidence: positive language, assertive statements
  let confidence = 5;
  const positive = /i have|i built|i led|i created|i developed|i managed|successfully|achieved|delivered/i;
  const hesitant = /i think maybe|i'm not sure|probably|i guess|sort of|kind of/i;
  if (positive.test(ans)) confidence += 2;
  if (hesitant.test(ans)) confidence -= 2;
  if (words > 40) confidence += 1;
  if (hasNumbers) confidence += 1;
  confidence = Math.min(10, Math.max(1, Math.round(confidence)));

  // Relevance: does it match the question topic?
  let relevance = 6;
  if (hasSkill) relevance += 2;
  if (hasExample) relevance += 1;
  if (words < 10) relevance -= 3;
  relevance = Math.min(10, Math.max(1, Math.round(relevance)));

  const overall = Math.round((technical + clarity + confidence + relevance) / 4);

  // Improvements
  const improvements = [];
  if (words < 30) improvements.push('Provide a more detailed answer with at least 3-4 sentences.');
  if (!hasExample) improvements.push('Include a specific real-world example from your experience.');
  if (hesitant.test(ans)) improvements.push('Use more assertive language — replace "I think maybe" with "I believe" or "I have."');
  if (!hasNumbers && (question.toLowerCase().includes('result') || question.toLowerCase().includes('impact')))
    improvements.push('Add quantifiable results (e.g., improved performance by 30%, reduced load time by 2s).');
  if (!hasSkill && isQuestion) improvements.push(`Connect your answer to your ${profile.skills[0]} skills more explicitly.`);
  if (improvements.length === 0) improvements.push('Structure your answer using the STAR method for even clearer delivery.');

  return {
    scores: { technical_score: technical, clarity_score: clarity, confidence_score: confidence, overall_score: overall },
    improvements: improvements.slice(0, 3),
  };
}

// ===== GENERATE FINAL REPORT =====
export function generateDemoReport(history, profile, selectedRounds) {
  const allScores = history.map(h => {
    const eval_ = evaluateDemoAnswer(h.question, h.answer, profile);
    return eval_.scores;
  });

  const avg = (key) => allScores.length > 0
    ? Math.round(allScores.reduce((s, e) => s + (e[key] || 0), 0) / allScores.length * 10)
    : 50;

  const technicalScore = avg('technical_score');
  const communicationScore = avg('clarity_score');
  const confidenceScore = avg('confidence_score');
  const overallScore = Math.round((technicalScore + communicationScore + confidenceScore) / 3);

  // Per-round scores
  const roundScores = {};
  selectedRounds.forEach(round => {
    const roundHistory = history.filter(h => h.round === round);
    if (roundHistory.length === 0) { roundScores[round] = 0; return; }
    const rs = roundHistory.map(h => evaluateDemoAnswer(h.question, h.answer, profile).scores);
    roundScores[round] = Math.round(rs.reduce((s, e) => s + e.overall_score, 0) / rs.length * 10);
  });

  // Recommendation
  let recommendation = 'No Hire';
  if (overallScore >= 80) recommendation = 'Strong Hire';
  else if (overallScore >= 65) recommendation = 'Hire';
  else if (overallScore >= 50) recommendation = 'Maybe';

  // Collect all improvements
  const allImprovements = [...new Set(
    history.flatMap(h => evaluateDemoAnswer(h.question, h.answer, profile).improvements)
  )].slice(0, 5);

  // Strengths based on scores
  const strengths = [];
  if (technicalScore >= 65) strengths.push(`Strong technical knowledge in ${profile.skills.slice(0,2).join(' and ')}`);
  if (communicationScore >= 65) strengths.push('Clear and structured communication style');
  if (confidenceScore >= 65) strengths.push('Confident delivery and assertive language');
  if (history.length >= 8) strengths.push('Completed full interview with consistent engagement');
  if (profile.projects?.length > 0) strengths.push(`Hands-on project experience in ${profile.projects[0]?.name}`);
  if (strengths.length < 3) strengths.push(`Relevant skills for ${profile.role || 'the role'} including ${profile.skills[0]}`);

  const summary = `${profile.name} from ${profile.place} demonstrated ${overallScore >= 65 ? 'solid' : 'developing'} competency across the interview. ${recommendation === 'Strong Hire' || recommendation === 'Hire' ? `Their answers showed good command of ${profile.skills[0]} and relevant project experience.` : `There is room to deepen technical explanations and add more concrete examples.`} Overall performance: ${overallScore}/100.`;

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    recommendation,
    roundScores,
    strengths: strengths.slice(0, 4),
    improvements: allImprovements,
    summary,
    skillsAssessed: profile.skills,
  };
}
