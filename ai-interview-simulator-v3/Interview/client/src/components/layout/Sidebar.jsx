import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Brain, Settings2, Mic, BarChart3, RefreshCw, Sparkles, LogOut, LogIn, BarChart2, Clock, Trophy, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useInterviewStore from '../../store/interviewStore';
import useAuthStore from '../../store/authStore';
import { logout } from '../../services/authApi';
import AuthModal from '../auth/AuthModal';

const navItems = [
  { id:'upload', label:'Resume', icon:FileText, desc:'Upload & parse' },
  { id:'demo', label:'Demo Mode', icon:Sparkles, desc:'No API key needed', free:true },
  { id:'analysis', label:'Analysis', icon:Brain, desc:'AI insights' },
  { id:'rounds', label:'Rounds', icon:Settings2, desc:'Select 1–3 rounds' },
  { id:'interview', label:'Interview', icon:Mic, desc:'Live session' },
  { id:'report', label:'Report', icon:BarChart3, desc:'Final evaluation' },
];

function ScoreBar({ value, color = '#0EA5E9' }) {
  return (
    <div className="h-1 bg-dark-600 rounded-full overflow-hidden w-full">
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
    </div>
  );
}

export default function Sidebar() {
  const { currentView, setCurrentView, resumeData, report, isDemoMode, selectedRounds, resetAll } = useInterviewStore();
  const { user, token, stats, logout: logoutStore } = useAuthStore();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [profileOpen, setProfileOpen] = useState(false);

  const isAccessible = (id) => {
    if (id === 'upload' || id === 'demo') return true;
    if (id === 'analysis') return !!resumeData && !isDemoMode;
    if (id === 'rounds') return !!resumeData;
    if (id === 'interview') return !!resumeData && selectedRounds.length > 0;
    if (id === 'report') return !!report;
    return false;
  };

  const handleLogout = async () => {
    try { if (token) await logout(token); } catch (_) {}
    logoutStore();
    toast.success('Signed out');
  };

  const recentBadge = stats?.badges?.[stats.badges.length - 1];
  const avgScore = stats?.averageScore || 0;
  const total = stats?.totalInterviews || 0;

  return (
    <>
      <aside className="w-64 min-h-screen glass border-r border-white/[0.04] flex flex-col py-5 px-3 fixed left-0 top-0 z-30 overflow-y-auto">
        {/* Logo */}
        <div className="px-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)', boxShadow: '0 0 15px rgba(14,165,233,0.3)' }}>
              <Brain size={17} className="text-white" />
            </div>
            <div>
              <div className="font-display font-black text-white text-sm leading-tight">InterviewAI</div>
              <div className="text-[10px] font-mono" style={{ color: isDemoMode ? '#F59E0B' : '#38BDF8' }}>{isDemoMode ? 'Demo Mode' : 'AI Mode'}</div>
            </div>
          </div>
        </div>

        {/* USER PROFILE BLOCK */}
        {user ? (
          <div className="mx-1 mb-5">
            <motion.button onClick={() => setProfileOpen(v => !v)} className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-dark-600/50" style={{ background: 'rgba(36,49,82,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-display font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}>
                {user.avatar || user.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-display font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-body truncate">{total} interview{total !== 1 ? 's' : ''} done</div>
              </div>
              <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={13} className="text-slate-500" />
              </motion.div>
            </motion.button>

            {/* PROFILE DROPDOWN */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(13,20,36,0.8)', border: '1px solid rgba(56,189,248,0.08)' }}>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: 'Interviews', val: total, icon: Mic, color: '#38BDF8' },
                        { label: 'Avg Score', val: avgScore, icon: BarChart2, color: '#A78BFA' },
                        { label: 'Best', val: stats?.bestScore || 0, icon: Trophy, color: '#34D399' },
                      ].map(s => (
                        <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="text-base font-display font-bold" style={{ color: s.color }}>{s.val}</div>
                          <div className="text-[9px] text-slate-600 font-body">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Score bar */}
                    {total > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-slate-500 font-body">Avg performance</span>
                          <span className="text-[10px] font-mono text-slate-400">{avgScore}/100</span>
                        </div>
                        <ScoreBar value={avgScore} color={avgScore >= 70 ? '#34D399' : avgScore >= 50 ? '#F59E0B' : '#F87171'} />
                      </div>
                    )}

                    {/* Streak */}
                    {stats?.streakDays > 0 && (
                      <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <span className="text-amber-400 text-sm">🔥</span>
                        <span className="text-[10px] font-mono text-amber-400">{stats.streakDays}-day streak</span>
                      </div>
                    )}

                    {/* Latest badge */}
                    {recentBadge && (
                      <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                        <span className="text-sm">{recentBadge.icon}</span>
                        <span className="text-[10px] font-mono text-accent-400">{recentBadge.label}</span>
                      </div>
                    )}

                    {/* Recent interviews */}
                    {stats?.recentHistory?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[10px] text-slate-600 font-body mb-1.5 flex items-center gap-1"><Clock size={9} /> Recent</div>
                        {stats.recentHistory.slice(0, 3).map(h => (
                          <div key={h.id} className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0">
                            <div>
                              <div className="text-[10px] font-mono text-slate-400">{h.rounds.join('+')||'Interview'}</div>
                              <div className="text-[9px] text-slate-600">{new Date(h.date).toLocaleDateString()}</div>
                            </div>
                            <span className="text-[11px] font-display font-bold" style={{ color: h.overallScore >= 70 ? '#34D399' : h.overallScore >= 50 ? '#F59E0B' : '#F87171' }}>{h.overallScore}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {total === 0 && <p className="text-[10px] text-slate-600 font-body text-center py-1">Complete an interview to see stats</p>}

                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] font-body text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <LogOut size={11} /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="mx-1 mb-5">
            <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-body text-xs text-slate-400 hover:text-brand-400 transition-all" style={{ background: 'rgba(36,49,82,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <LogIn size={13} className="text-slate-500" />
              <div className="text-left flex-1">
                <div className="text-xs font-display font-medium">Sign In / Register</div>
                <div className="text-[10px] text-slate-600">Save your interview history</div>
              </div>
            </button>
          </div>
        )}

        {/* NAV */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            const accessible = isAccessible(item.id);
            const isDemo = item.id === 'demo';
            return (
              <motion.button key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => accessible && setCurrentView(item.id)} disabled={!accessible}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200
                  ${active ? (isDemo ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300' : 'bg-brand-600/20 border border-brand-500/30 text-brand-300') :
                    accessible ? (isDemo ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-300 cursor-pointer' : 'hover:bg-dark-600/60 text-slate-400 hover:text-slate-200 cursor-pointer') :
                    'opacity-30 cursor-not-allowed text-slate-600'}`}>
                {active && <motion.div layoutId="activeNav" className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-brand-400'}`} />}
                <Icon size={14} className={active ? (isDemo ? 'text-amber-400' : 'text-brand-400') : ''} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-display font-semibold flex items-center gap-1.5">
                    {item.label}
                    {item.free && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono">FREE</span>}
                  </div>
                  <div className="text-[10px] text-slate-600 font-body">{item.desc}</div>
                </div>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-4">
          <button onClick={resetAll} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-xs font-display">
            <RefreshCw size={12} /> Start Over
          </button>
        </div>
      </aside>

      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onModeChange={setAuthMode} onSuccess={() => setShowAuth(false)} />}
    </>
  );
}
