/**
 * Demo Model — Zero API Key Required
 * Fully trained on user-entered profile: name, place, skills, projects
 * Generates personalized questions, evaluates answers, gives real scores & improvements
 */

export function generateDemoQuestions(roundType, profile) {
  const { name, place, role, skills = [], projects = [], experience, education } = profile;
  const firstName = name.split(' ')[0];

  if (roundType === 'general') {
    return [
      { id:1, question:`${firstName}, tell me about yourself and your professional journey.`, category:'General' },
      { id:2, question:`You're from ${place||'your city'}. How has your background shaped your career path?`, category:'General' },
      { id:3, question:`What specifically attracted you to the ${role||'developer'} role?`, category:'General' },
      { id:4, question:`With ${experience||'your'} experience, what has been your most valuable professional lesson?`, category:'General' },
      { id:5, question:`Where do you see yourself in 5 years as a ${role||'professional'}?`, category:'General' },
    ];
  }

  if (roundType === 'hr') {
    return [
      { id:1, question:`${firstName}, what are your top 3 strengths relevant to a ${role||'developer'} role?`, category:'HR' },
      { id:2, question:`What is your biggest professional weakness and how are you actively addressing it?`, category:'HR' },
      { id:3, question:`Describe a challenging situation you faced${experience?` during your ${experience} of experience`:', in your career'} and how you resolved it.`, category:'HR' },
      { id:4, question:`Why should we hire you over other candidates with similar ${(skills.slice(0,2).join(' and '))||'skills'}?`, category:'HR' },
      { id:5, question:`How do you manage pressure and deadlines, especially when working with ${skills[0]||'your tech stack'}?`, category:'HR' },
    ];
  }

  // Technical — strictly from skills + projects only
  const techQs = [];
  let id = 1;
  const topSkills = skills.slice(0, 2);
  for (const skill of topSkills) {
    techQs.push(
      { id:id++, question:`How have you used ${skill} in a real project? What was the hardest part?`, category:'Technical', skill_tested:skill },
      { id:id++, question:`What is the most advanced feature of ${skill} you've implemented? Explain it.`, category:'Technical', skill_tested:skill }
    );
  }
  for (const proj of (projects||[]).filter(p=>p.name).slice(0,3)) {
    if (techQs.length >= 5) break;
    techQs.push({ id:id++, question:`Tell me about "${proj.name}". What was the biggest technical challenge and how did you solve it?`, category:'Technical', skill_tested:proj.name });
  }
  for (const skill of skills.slice(2)) {
    if (techQs.length >= 5) break;
    techQs.push({ id:id++, question:`How do you debug and optimize code written in ${skill}?`, category:'Technical', skill_tested:skill });
  }
  while (techQs.length < 5) {
    techQs.push({ id:id++, question:`How do you stay current with updates and best practices in ${skills[0]||'your tech stack'}?`, category:'Technical', skill_tested:skills[0]||'Technology' });
  }
  return techQs.slice(0, 5);
}

export function generateDemoFollowUp(question, answer, profile) {
  const { skills=[], projects=[], name } = profile;
  const firstName = name.split(' ')[0];
  const a = answer.toLowerCase();
  const q = question.toLowerCase();

  if (a.includes('database')||a.includes('sql')||a.includes('db')||a.includes('query')) {
    const db = skills.find(s=>['postgresql','mysql','mongodb','sqlite','redis'].includes(s.toLowerCase()));
    return db ? `In ${db}, how do you handle indexing and query optimization for large datasets?` : 'Which database did you use and how did you optimize its performance?';
  }
  if (a.includes('team')||a.includes('collaborat')||a.includes('work with')) {
    return 'How did you handle disagreements or conflicting priorities within the team?';
  }
  if (a.includes('bug')||a.includes('fix')||a.includes('error')||a.includes('issue')) {
    return 'What debugging tools or methods did you use to identify and resolve that issue?';
  }
  if (a.includes('api')||a.includes('rest')||a.includes('endpoint')||a.includes('http')) {
    return 'How did you handle authentication, rate limiting, and error responses in that API?';
  }
  if (a.includes('deploy')||a.includes('production')||a.includes('ci/cd')||a.includes('docker')) {
    return 'How did you handle monitoring, rollback, and downtime mitigation in that deployment?';
  }
  if (a.includes('learn')||a.includes('course')||a.includes('tutorial')||a.includes('read')) {
    return 'Give me a concrete example of something you learned and immediately applied to a real project.';
  }
  const usedSkill = skills.find(s=>a.includes(s.toLowerCase()));
  if (usedSkill) return `You mentioned ${usedSkill}. Can you walk me through a specific performance or scalability challenge you faced with it?`;
  const usedProj = (projects||[]).find(p=>p.name&&a.includes(p.name.toLowerCase()));
  if (usedProj) return `In "${usedProj.name}", what would you architect differently today and why?`;

  const generics = [
    `Can you give a more specific technical example from your work with ${skills[0]||'your stack'}?`,
    `How did you measure success in that case? What metrics or outcomes did you track?`,
    `What would you do differently if you tackled this problem again today?`,
    `${firstName}, how did this experience change your approach going forward?`,
    `What was the biggest lesson you took from that situation?`,
  ];
  return generics[Math.floor(Math.random()*generics.length)];
}

export function evaluateDemoAnswer(question, answer, profile) {
  const { skills=[], projects=[] } = profile;
  const a = answer.toLowerCase();
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  // Technical score
  let tech = 4;
  const skillHits = skills.filter(s=>a.includes(s.toLowerCase())).length;
  const projHits = (projects||[]).filter(p=>p.name&&a.includes(p.name.toLowerCase())).length;
  tech += Math.min(3, skillHits * 1.5);
  tech += Math.min(2, projHits);
  if (a.includes('because')||a.includes('therefore')||a.includes('which means')) tech += 0.5;
  if (/\d+/.test(answer)) tech += 0.5;
  tech = Math.min(10, Math.max(1, Math.round(tech)));

  // Clarity score
  let clarity = 3;
  if (wordCount >= 20) clarity = 4;
  if (wordCount >= 40) clarity = 5;
  if (wordCount >= 70) clarity = 7;
  if (wordCount >= 110) clarity = 8;
  if (wordCount >= 150) clarity = 9;
  const sentences = answer.split(/[.!?]+/).filter(s=>s.trim().length>0).length;
  if (sentences >= 3) clarity += 0.5;
  if (a.includes('first')||a.includes('then')||a.includes('finally')||a.includes('next')) clarity += 0.5;
  clarity = Math.min(10, Math.max(1, Math.round(clarity)));

  // Confidence score
  let conf = 5;
  ['maybe','perhaps','i think','i guess','not sure','kind of','sort of',"i don't know","i'm not"].forEach(w=>{if(a.includes(w))conf-=1;});
  ['i have','i built','i implemented','i designed','i led','i created','i developed','successfully','i achieved','i deployed'].forEach(w=>{if(a.includes(w))conf+=0.7;});
  conf = Math.min(10, Math.max(1, Math.round(conf)));

  const overall = Math.min(10, Math.round(tech*0.4 + clarity*0.35 + conf*0.25));
  return { technical_score:tech, clarity_score:clarity, confidence_score:conf, overall_score:overall };
}

export function generateDemoImprovements(question, answer, scores, profile) {
  const { skills=[] } = profile;
  const a = answer.toLowerCase();
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const tips = [];

  if (scores.technical_score < 7) {
    const missing = skills.filter(s=>!a.includes(s.toLowerCase())).slice(0,2);
    tips.push(missing.length > 0
      ? `Reference specific technologies like ${missing.join(', ')} with concrete implementation details`
      : 'Include technical depth — specific methods, patterns, and measurable outcomes you achieved');
  }
  if (scores.clarity_score < 7) {
    tips.push(wordCount < 50
      ? 'Expand your answer — aim for 4-6 sentences with a specific example and outcome'
      : 'Structure answers with STAR method: Situation → Task → Action → Result');
  }
  if (scores.confidence_score < 7) {
    tips.push('Use assertive language — replace "I think" and "maybe" with "I implemented" and "I achieved"');
  }
  if (wordCount > 220) {
    tips.push('Be more concise — focus on 2-3 key points and avoid repeating information');
  }
  if (tips.length === 0) {
    tips.push('Strong answer! Quantify results with numbers (e.g., "reduced load time by 40%") for maximum impact');
  }
  return tips.slice(0, 3);
}

export function generateDemoReport(history, profile, selectedRounds) {
  const { name, role, skills=[], projects=[] } = profile;

  if (!history.length) return { overallScore:0, technicalScore:0, communicationScore:0, confidenceScore:0, recommendation:'No Hire', roundScores:{}, strengths:[], improvements:['Complete more interview rounds for accurate evaluation'], summary:'No answers recorded.', skillsAssessed:skills };

  const allScores = history.map(h=>evaluateDemoAnswer(h.question, h.answer, profile));
  const avg = key => allScores.length ? Math.round(allScores.reduce((a,s)=>a+s[key],0)/allScores.length*10) : 0;
  const avgTech = avg('technical_score');
  const avgClarity = avg('clarity_score');
  const avgConf = avg('confidence_score');
  const overall = Math.round(avgTech*0.4 + avgClarity*0.35 + avgConf*0.25);

  const roundScores = {};
  selectedRounds.forEach(r=>{
    const rh = history.filter(h=>h.round===r);
    if (!rh.length){roundScores[r]=0;return;}
    const rs = rh.map(h=>evaluateDemoAnswer(h.question,h.answer,profile));
    roundScores[r] = Math.round(rs.reduce((a,s)=>a+s.overall_score,0)/rs.length*10);
  });

  let recommendation = 'No Hire';
  if (overall>=80) recommendation='Strong Hire';
  else if (overall>=65) recommendation='Hire';
  else if (overall>=50) recommendation='Maybe';

  const strengths = [];
  if (avgTech>=70) strengths.push(`Strong technical knowledge of ${skills.slice(0,3).join(', ')}`);
  if (avgClarity>=70) strengths.push('Clear, structured communication with good reasoning');
  if (avgConf>=70) strengths.push('Confident and assertive in describing experience and decisions');
  if ((projects||[]).filter(p=>p.name).length>0) strengths.push(`Solid hands-on project experience with ${projects.filter(p=>p.name).map(p=>p.name).slice(0,2).join(' and ')}`);
  while (strengths.length<2) strengths.push('Shows genuine motivation and interest in the role');

  const improvements = [];
  if (avgTech<70) improvements.push('Add measurable technical outcomes — specific numbers, performance improvements, scale handled');
  if (avgClarity<70) improvements.push('Use STAR method for behavioral answers: Situation, Task, Action, Result');
  if (avgConf<70) improvements.push('Replace hesitant phrases with assertive language: "I built", "I achieved", "I delivered"');
  improvements.push(`Deepen expertise in ${skills[skills.length-1]||'your newest skill'} for competitive advantage`);

  const summary = `${name} demonstrates ${overall>=70?'strong':overall>=55?'moderate':'developing'} readiness for the ${role} role. ${avgTech>=70?`Technical depth in ${skills.slice(0,2).join(' and ')} is clear.`:'Technical answers need more implementation-specific detail.'} ${avgClarity>=70?'Communication is well-structured.':'Answer structure can be improved with STAR framing.'} ${recommendation==='Strong Hire'||recommendation==='Hire'?'Recommended for the next stage.':'Further preparation recommended.'}`;

  return { overallScore:overall, technicalScore:avgTech, communicationScore:avgClarity, confidenceScore:avgConf, recommendation, roundScores, strengths:strengths.slice(0,3), improvements:improvements.slice(0,3), summary, skillsAssessed:skills };
}
