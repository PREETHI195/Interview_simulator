require('dotenv').config();
const express = require('express');
const cors = require('cors');

const resumeRoutes = require('./routes/resume');
const interviewRoutes = require('./routes/interview');
const demoRoutes = require('./routes/demo');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', resumeRoutes);
app.use('/api', interviewRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '3.0' }));

app.listen(PORT, () => console.log(`🚀 InterviewAI Server running on http://localhost:${PORT}`));
