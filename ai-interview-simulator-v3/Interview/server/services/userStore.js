/**
 * In-memory user store (no database needed)
 * Stores users, sessions, and interview history
 * In production, replace with MongoDB/PostgreSQL
 */

const users = new Map();  // email -> user object
const tokens = new Map(); // token -> email

let userIdCounter = 1;

function createUser(name, email, passwordHash) {
  const id = `user_${userIdCounter++}`;
  const user = {
    id,
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
    avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    interviewHistory: [],       // array of interview session summaries
    totalInterviews: 0,
    totalScore: 0,
    bestScore: 0,
    lastInterviewAt: null,
    badges: [],
  };
  users.set(email, user);
  return user;
}

function findByEmail(email) {
  return users.get(email) || null;
}

function findById(id) {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
}

function saveToken(token, email) {
  tokens.set(token, email);
}

function findByToken(token) {
  const email = tokens.get(token);
  if (!email) return null;
  return findByEmail(email);
}

function removeToken(token) {
  tokens.delete(token);
}

function addInterviewRecord(userId, record) {
  const user = findById(userId);
  if (!user) return null;

  const session = {
    id: `int_${Date.now()}`,
    date: new Date().toISOString(),
    mode: record.mode || 'ai',             // 'ai' | 'demo'
    rounds: record.rounds || [],
    overallScore: record.overallScore || 0,
    technicalScore: record.technicalScore || 0,
    communicationScore: record.communicationScore || 0,
    confidenceScore: record.confidenceScore || 0,
    recommendation: record.recommendation || 'N/A',
    skillsAssessed: record.skillsAssessed || [],
    questionsAnswered: record.questionsAnswered || 0,
    durationMinutes: record.durationMinutes || 0,
  };

  user.interviewHistory.unshift(session); // newest first
  user.totalInterviews += 1;
  user.lastInterviewAt = session.date;

  // Update best score
  if (session.overallScore > user.bestScore) {
    user.bestScore = session.overallScore;
  }
  // Rolling average score
  const totalScoreSum = user.interviewHistory.reduce((a, s) => a + s.overallScore, 0);
  user.totalScore = Math.round(totalScoreSum / user.interviewHistory.length);

  // Award badges
  if (user.totalInterviews === 1) user.badges.push({ id: 'first', label: 'First Interview', icon: '🎯' });
  if (user.totalInterviews === 5) user.badges.push({ id: 'five', label: '5 Interviews', icon: '🔥' });
  if (user.totalInterviews === 10) user.badges.push({ id: 'ten', label: '10 Interviews', icon: '⭐' });
  if (session.overallScore >= 90) user.badges.push({ id: 'ace', label: 'Ace Performer', icon: '🏆' });
  if (session.overallScore >= 80 && !user.badges.find(b => b.id === 'pro')) user.badges.push({ id: 'pro', label: 'Pro Level', icon: '💎' });

  return session;
}

function getUserProfile(userId) {
  const user = findById(userId);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function getUserStats(userId) {
  const user = findById(userId);
  if (!user) return null;
  const history = user.interviewHistory.slice(0, 10);
  return {
    totalInterviews: user.totalInterviews,
    averageScore: user.totalScore,
    bestScore: user.bestScore,
    lastInterviewAt: user.lastInterviewAt,
    recentHistory: history,
    badges: user.badges,
    streakDays: calculateStreak(user.interviewHistory),
  };
}

function calculateStreak(history) {
  if (!history.length) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const hasInterview = history.some(h => {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === day.getTime();
    });
    if (hasInterview) streak++;
    else if (i > 0) break;
  }
  return streak;
}

module.exports = { createUser, findByEmail, findById, findByToken, saveToken, removeToken, addInterviewRecord, getUserProfile, getUserStats };
