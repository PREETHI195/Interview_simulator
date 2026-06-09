import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 30000 });

api.interceptors.response.use(
  r => r,
  err => Promise.reject(new Error(err.response?.data?.error || err.message || 'Request failed'))
);

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then(r => r.data);

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const logout = (token) =>
  api.post('/auth/logout', {}, { headers: authHeader(token) }).then(r => r.data);

export const getMe = (token) =>
  api.get('/auth/me', { headers: authHeader(token) }).then(r => r.data);

export const getStats = (token) =>
  api.get('/auth/stats', { headers: authHeader(token) }).then(r => r.data);

export const recordInterview = (token, payload) =>
  api.post('/auth/record-interview', payload, { headers: authHeader(token) }).then(r => r.data);
