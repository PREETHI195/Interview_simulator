import { create } from 'zustand';

const TOKEN_KEY = 'interviewai_token';
const USER_KEY = 'interviewai_user';

const useAuthStore = create((set, get) => ({
  user: (() => { try { return JSON.parse(localStorage.getItem(USER_KEY)||'null'); } catch { return null; } })(),
  token: localStorage.getItem(TOKEN_KEY) || null,
  stats: null,
  isLoading: false,
  error: null,

  setUser: (user, token) => {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); localStorage.setItem(TOKEN_KEY, token); } catch {}
    set({ user, token, error: null });
  },

  updateUser: (updates) => {
    const updated = { ...get().user, ...updates };
    try { localStorage.setItem(USER_KEY, JSON.stringify(updated)); } catch {}
    set({ user: updated });
  },

  setStats: (stats) => set({ stats }),
  setError: (error) => set({ error }),
  setLoading: (v) => set({ isLoading: v }),

  logout: () => {
    try { localStorage.removeItem(USER_KEY); localStorage.removeItem(TOKEN_KEY); } catch {}
    set({ user: null, token: null, stats: null });
  },

  isLoggedIn: () => !!get().token && !!get().user,
}));

export default useAuthStore;
