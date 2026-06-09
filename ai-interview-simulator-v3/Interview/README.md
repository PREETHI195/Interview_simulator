# InterviewAI v3 Pro

AI Interview Simulator with 3D Landing Page, User Auth, Interview History, Demo Mode, and GPT-4o mini.

---

## Quick Start

```bash
# 1. Configure environment
cp server/.env.example server/.env
# Edit server/.env:
# OPENAI_API_KEY=sk-...   (required for AI mode only)
# JWT_SECRET=any_random_string  (optional, used internally)

# 2. Backend
cd server && npm install && npm run dev   # → localhost:5000

# 3. Frontend
cd client && npm install && npm run dev   # → localhost:5173
```

---

## New in v3

### 3D Landing Page
- Animated 3D rotating brain with orbiting rings
- Floating score cards with live animations
- Typewriter hero text cycling through roles
- Scroll parallax hero section
- Floating orb background effects
- How-It-Works timeline
- Feature grid with hover depth effects

### User Authentication
- Register / Login with email + password
- JWT tokens stored in localStorage
- Secure bcrypt password hashing
- Persistent sessions across page reloads

### User Profile in Sidebar (replaces "GPT-4o mini" label)
- Avatar with initials
- Total interviews counter
- Average score
- Best score ever
- Current streak (days)
- Latest badge earned
- Last 3 interview history with scores
- All badges collected

### Interview History Tracking
- Every completed interview saved to user profile
- Tracks: mode (ai/demo), rounds, all 4 scores, recommendation, skills assessed
- Auto-saved when report page loads (if logged in)
- "Saved to profile" confirmation shown in report
- Badge system: First Interview, 5 Interviews, 10 Interviews, Ace Performer, Pro Level

---

## Architecture

```
server/
├── routes/auth.js          # register, login, logout, me, stats, record-interview
├── services/userStore.js   # In-memory user DB with interview history
├── middleware/auth.js       # JWT bearer token validation
└── services/openaiService.js

client/src/
├── store/authStore.js      # Zustand auth state with localStorage persistence
├── services/authApi.js     # API calls: register, login, logout, stats
├── components/auth/
│   └── AuthModal.jsx       # Login/Register modal
├── components/layout/
│   └── Sidebar.jsx         # Profile panel (replaces GPT label)
└── pages/
    ├── LandingPage.jsx      # 3D animated landing
    └── ReportPage.jsx       # Auto-saves interview to profile
```

---

## API Routes

```
POST /api/auth/register         Body: {name, email, password}
POST /api/auth/login            Body: {email, password}
POST /api/auth/logout           Auth required
GET  /api/auth/me               Auth required → user profile
GET  /api/auth/stats            Auth required → stats + history
POST /api/auth/record-interview Auth required, Body: {report, mode, rounds, ...}
```
