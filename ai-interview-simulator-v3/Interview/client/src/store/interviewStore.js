import { create } from 'zustand';

const useInterviewStore = create((set, get) => ({
  // Resume (AI mode)
  resumeFile: null,
  resumeText: '',
  resumeData: null,

  // Demo mode (built-in model, no API key needed)
  isDemoMode: false,
  demoProfile: null,

  // Round selection
  selectedRounds: ['general', 'hr', 'technical'],

  // Interview state
  currentView: 'upload',
  currentRound: 0,
  currentRoundKey: '',
  roundsList: [],
  currentQuestionIndex: 0,
  questions: { general: [], hr: [], technical: [] },
  interviewHistory: [],
  isTyping: false,
  chatMessages: [],
  awaitingFollowUp: false,
  followUpQ: '',

  // Scoring
  perAnswerScores: [],
  allImprovements: [],
  report: null,

  // Actions
  setResumeFile: (f) => set({ resumeFile: f }),
  setResumeText: (t) => set({ resumeText: t }),
  setResumeData: (d) => set({ resumeData: d }),
  setIsDemoMode: (v) => set({ isDemoMode: v }),
  setDemoProfile: (p) => set({ demoProfile: p }),
  setSelectedRounds: (r) => set({ selectedRounds: r }),
  setCurrentView: (v) => set({ currentView: v }),
  setCurrentRound: (r) => set({ currentRound: r }),
  setCurrentRoundKey: (k) => set({ currentRoundKey: k }),
  setRoundsList: (l) => set({ roundsList: l }),
  setCurrentQuestionIndex: (i) => set({ currentQuestionIndex: i }),
  setQuestions: (type, qs) => set((s) => ({ questions: { ...s.questions, [type]: qs } })),
  setReport: (r) => set({ report: r }),
  setIsTyping: (v) => set({ isTyping: v }),
  setAwaitingFollowUp: (v) => set({ awaitingFollowUp: v }),
  setFollowUpQ: (q) => set({ followUpQ: q }),
  addChatMessage: (m) => set((s) => ({ chatMessages: [...s.chatMessages, m] })),
  addToHistory: (e) => set((s) => ({ interviewHistory: [...s.interviewHistory, e] })),
  addPerAnswerScore: (sc) => set((s) => ({ perAnswerScores: [...s.perAnswerScores, sc] })),
  addImprovement: (items) => set((s) => ({ allImprovements: [...s.allImprovements, ...items] })),

  resetInterview: () => set({
    currentRound: 0, currentRoundKey: '', roundsList: [],
    currentQuestionIndex: 0,
    questions: { general: [], hr: [], technical: [] },
    interviewHistory: [], chatMessages: [], report: null,
    isTyping: false, awaitingFollowUp: false, followUpQ: '',
    perAnswerScores: [], allImprovements: [],
  }),

  resetAll: () => set({
    resumeFile: null, resumeText: '', resumeData: null,
    isDemoMode: false, demoProfile: null,
    selectedRounds: ['general', 'hr', 'technical'],
    currentView: 'upload',
    currentRound: 0, currentRoundKey: '', roundsList: [],
    currentQuestionIndex: 0,
    questions: { general: [], hr: [], technical: [] },
    interviewHistory: [], chatMessages: [], report: null,
    isTyping: false, awaitingFollowUp: false, followUpQ: '',
    perAnswerScores: [], allImprovements: [],
  }),
}));

export default useInterviewStore;
