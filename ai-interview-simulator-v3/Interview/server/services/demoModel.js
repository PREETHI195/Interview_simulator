/**
 * Server-side Demo Model
 * Mirrors client/src/services/demoModel.js for server routes
 */

function generateDemoQuestions(roundType, profile) {
  const { name, place, role, skills=[], projects=[], experience } = profile;
  const firstName = name.split(' ')[0];
  if (roundType==='general') return [
    {id:1,question:`${firstName}, tell me about yourself and your professional journey.`,category:'General'},
    {id:2,question:`You're from ${place||'your city'}. How has your background shaped your career?`,category:'General'},
    {id:3,question:`What specifically attracted you to the ${role||'developer'} role?`,category:'General'},
    {id:4,question:`With ${experience||'your'} experience, what has been your most valuable lesson?`,category:'General'},
    {id:5,question:`Where do you see yourself in 5 years as a ${role||'professional'}?`,category:'General'},
  ];
  if (roundType==='hr') return [
    {id:1,question:`${firstName}, what are your top 3 strengths for a ${role||'developer'} role?`,category:'HR'},
    {id:2,question:`What is your biggest professional weakness and how are you addressing it?`,category:'HR'},
    {id:3,question:`Describe a challenging situation you faced${experience?` in your ${experience}`:''}  and how you resolved it.`,category:'HR'},
    {id:4,question:`Why should we hire you over others with similar ${(skills.slice(0,2).join(' and '))||'skills'}?`,category:'HR'},
    {id:5,question:`How do you manage pressure when working with ${skills[0]||'your tech stack'}?`,category:'HR'},
  ];
  const qs=[];let id=1;
  for(const s of skills.slice(0,2)){qs.push({id:id++,question:`How have you used ${s} in a real project? What was the hardest part?`,category:'Technical',skill_tested:s},{id:id++,question:`What is the most advanced feature of ${s} you've implemented?`,category:'Technical',skill_tested:s});}
  for(const p of (projects||[]).filter(x=>x.name).slice(0,3)){if(qs.length>=5)break;qs.push({id:id++,question:`Tell me about "${p.name}". What was the biggest technical challenge?`,category:'Technical',skill_tested:p.name});}
  for(const s of skills.slice(2)){if(qs.length>=5)break;qs.push({id:id++,question:`How do you debug and optimize code in ${s}?`,category:'Technical',skill_tested:s});}
  while(qs.length<5)qs.push({id:id++,question:`How do you stay current with ${skills[0]||'your tech stack'}?`,category:'Technical',skill_tested:skills[0]||'Technology'});
  return qs.slice(0,5);
}

function generateDemoFollowUp(question, answer, profile) {
  const {skills=[],projects=[],name} = profile;
  const a=answer.toLowerCase();
  if(a.includes('database')||a.includes('sql')){const db=skills.find(s=>['postgresql','mysql','mongodb'].includes(s.toLowerCase()));return db?`In ${db}, how do you optimize query performance?`:'Which database did you use and how did you optimize it?';}
  if(a.includes('team')||a.includes('collaborat'))return 'How did you handle disagreements or conflicting priorities in the team?';
  if(a.includes('bug')||a.includes('fix')||a.includes('error'))return 'What debugging tools or methods did you use to resolve that?';
  if(a.includes('api')||a.includes('rest'))return 'How did you handle authentication and error responses in that API?';
  if(a.includes('deploy')||a.includes('production'))return 'How did you handle monitoring and rollback in that deployment?';
  const usedSkill=skills.find(s=>a.includes(s.toLowerCase()));
  if(usedSkill)return `You mentioned ${usedSkill}. What performance challenge did you face with it?`;
  return `Can you give a more specific technical example from your work with ${skills[0]||'your stack'}?`;
}

function evaluateDemoAnswer(question, answer, profile) {
  const {skills=[],projects=[]} = profile;
  const a=answer.toLowerCase();
  const wc=answer.trim().split(/\s+/).filter(Boolean).length;
  let tech=4;
  tech+=Math.min(3,skills.filter(s=>a.includes(s.toLowerCase())).length*1.5);
  tech+=Math.min(2,(projects||[]).filter(p=>p.name&&a.includes(p.name.toLowerCase())).length);
  if(a.includes('because')||a.includes('therefore'))tech+=0.5;
  if(/\d+/.test(answer))tech+=0.5;
  tech=Math.min(10,Math.max(1,Math.round(tech)));
  let clarity=3;
  if(wc>=20)clarity=4;if(wc>=40)clarity=5;if(wc>=70)clarity=7;if(wc>=110)clarity=8;if(wc>=150)clarity=9;
  if(a.includes('first')||a.includes('then')||a.includes('finally'))clarity+=0.5;
  clarity=Math.min(10,Math.max(1,Math.round(clarity)));
  let conf=5;
  ['maybe','perhaps','i think','i guess','not sure','kind of'].forEach(w=>{if(a.includes(w))conf-=1;});
  ['i have','i built','i implemented','i designed','i developed','successfully'].forEach(w=>{if(a.includes(w))conf+=0.7;});
  conf=Math.min(10,Math.max(1,Math.round(conf)));
  return {technical_score:tech,clarity_score:clarity,confidence_score:conf,overall_score:Math.min(10,Math.round(tech*0.4+clarity*0.35+conf*0.25))};
}

function generateDemoImprovements(question, answer, scores, profile) {
  const {skills=[]}=profile;const a=answer.toLowerCase();const wc=answer.trim().split(/\s+/).filter(Boolean).length;const tips=[];
  if(scores.technical_score<7){const missing=skills.filter(s=>!a.includes(s.toLowerCase())).slice(0,2);tips.push(missing.length>0?`Reference ${missing.join(', ')} with concrete implementation details`:'Include specific technical depth — methods, patterns, measurable outcomes');}
  if(scores.clarity_score<7)tips.push(wc<50?'Expand your answer — aim for 4-6 sentences with a specific example':'Use STAR: Situation → Task → Action → Result');
  if(scores.confidence_score<7)tips.push('Use assertive language: replace "I think" with "I implemented" and "I achieved"');
  if(!tips.length)tips.push('Strong answer! Quantify results (e.g. "reduced load time by 40%") for maximum impact');
  return tips.slice(0,3);
}

function generateDemoReport(history, profile, selectedRounds) {
  const {name,role,skills=[],projects=[]}=profile;
  if(!history.length) return {overallScore:0,technicalScore:0,communicationScore:0,confidenceScore:0,recommendation:'No Hire',roundScores:{},strengths:[],improvements:['Complete the interview rounds'],summary:'No answers recorded.',skillsAssessed:skills};
  const allScores=history.map(h=>evaluateDemoAnswer(h.question,h.answer,profile));
  const avg=key=>allScores.length?Math.round(allScores.reduce((a,s)=>a+s[key],0)/allScores.length*10):0;
  const avgTech=avg('technical_score'),avgClarity=avg('clarity_score'),avgConf=avg('confidence_score');
  const overall=Math.round(avgTech*0.4+avgClarity*0.35+avgConf*0.25);
  const roundScores={};
  (selectedRounds||[]).forEach(r=>{const rh=history.filter(h=>h.round===r);if(!rh.length){roundScores[r]=0;return;}const rs=rh.map(h=>evaluateDemoAnswer(h.question,h.answer,profile));roundScores[r]=Math.round(rs.reduce((a,s)=>a+s.overall_score,0)/rs.length*10);});
  let recommendation='No Hire';
  if(overall>=80)recommendation='Strong Hire';else if(overall>=65)recommendation='Hire';else if(overall>=50)recommendation='Maybe';
  const strengths=[];
  if(avgTech>=70)strengths.push(`Strong technical knowledge of ${skills.slice(0,3).join(', ')}`);
  if(avgClarity>=70)strengths.push('Clear, structured communication');
  if(avgConf>=70)strengths.push('Confident and assertive delivery');
  if((projects||[]).filter(p=>p.name).length>0)strengths.push(`Hands-on project experience: ${projects.filter(p=>p.name).map(p=>p.name).slice(0,2).join(', ')}`);
  while(strengths.length<2)strengths.push('Shows genuine motivation for the role');
  const improvements=[];
  if(avgTech<70)improvements.push('Add measurable technical outcomes — specific numbers and performance improvements');
  if(avgClarity<70)improvements.push('Use STAR method: Situation, Task, Action, Result');
  if(avgConf<70)improvements.push('Replace hesitant phrases with assertive language');
  improvements.push(`Deepen expertise in ${skills[skills.length-1]||'your newest skill'} for competitive advantage`);
  const summary=`${name} demonstrates ${overall>=70?'strong':overall>=55?'moderate':'developing'} readiness for the ${role} role. ${avgTech>=70?`Technical depth in ${skills.slice(0,2).join(' and ')} is clear.`:'Technical answers need more implementation detail.'} ${recommendation==='Strong Hire'||recommendation==='Hire'?'Recommended for the next stage.':'Further preparation recommended.'}`;
  return {overallScore:overall,technicalScore:avgTech,communicationScore:avgClarity,confidenceScore:avgConf,recommendation,roundScores,strengths:strengths.slice(0,3),improvements:improvements.slice(0,3),summary,skillsAssessed:skills};
}

module.exports={generateDemoQuestions,generateDemoFollowUp,evaluateDemoAnswer,generateDemoImprovements,generateDemoReport};
