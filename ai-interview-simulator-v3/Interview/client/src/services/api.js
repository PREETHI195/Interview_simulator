import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 60000 });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('interviewai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.error || err.message || 'Unexpected error';
    return Promise.reject(new Error(msg));
  }
);

// Auth
export const register = async (name, email, password) => (await api.post('/auth/register', { name, email, password })).data;
export const login = async (email, password) => (await api.post('/auth/login', { email, password })).data;
export const logout = async () => (await api.post('/auth/logout')).data;
export const getMe = async () => (await api.get('/auth/me')).data;
export const getStats = async () => (await api.get('/auth/stats')).data;
export const recordInterview = async (payload) => (await api.post('/auth/record-interview', payload)).data;

// Resume
export const uploadResume = async (file) => {
  const fd = new FormData(); fd.append('resume', file);
  return (await api.post('/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};
export const analyzeResume = async (resumeText) => (await api.post('/analyze', { resumeText })).data;

// Interview
export const generateQuestions = async (roundType, resumeData) => (await api.post('/questions', { roundType, resumeData })).data;
export const generateFollowUp = async (question, answer, resumeData) => (await api.post('/follow-up', { question, answer, resumeData })).data;
export const evaluateAnswer = async (question, answer, resumeData) => (await api.post('/evaluate', { question, answer, resumeData })).data;
export const generateReport = async (interviewHistory, resumeData, selectedRounds) => (await api.post('/report', { interviewHistory, resumeData, selectedRounds })).data;

export default api;
