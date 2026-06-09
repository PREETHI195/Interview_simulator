import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, Mic2, BarChart3, Shield, Star, ChevronDown, Play } from 'lucide-react';
import useAuthStore from '../store/authStore';
import AuthModal from '../components/auth/AuthModal';

/* ── helpers ── */
function FloatingOrb({ cx, cy, r, color, delay = 0, duration = 8 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${cx}%`, top: `${cy}%`, width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, background: color, filter: 'blur(80px)', opacity: 0.18, willChange: 'transform' }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.04 }}>
      <div style={{ backgroundImage: 'linear-gradient(rgba(110,231,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,255,1) 1px,transparent 1px)', backgroundSize: '80px 80px', width: '100%', height: '100%' }} />
    </div>
  );
}

/* Rotating 3D-like AI brain visual using CSS transforms */
function HeroBrain() {
  const rings = [0, 1, 2, 3];
  return (
    <div className="relative w-80 h-80 flex items-center justify-center" style={{ perspective: '800px' }}>
      {rings.map(i => (
        <motion.div key={i}
          className="absolute rounded-full border"
          style={{
            width: `${100 + i * 60}px`, height: `${100 + i * 60}px`,
            borderColor: i % 2 === 0 ? 'rgba(110,231,255,0.25)' : 'rgba(167,139,250,0.2)',
            borderWidth: i === 0 ? '2px' : '1px',
            boxShadow: i === 0 ? '0 0 40px rgba(110,231,255,0.15), inset 0 0 40px rgba(110,231,255,0.08)' : 'none',
            willChange: 'transform',
          }}
          animate={{ rotateX: [0, 360], rotateY: [i * 45, i * 45 + 360] }}
          transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
        />
      ))}
      {/* Center node */}
      <motion.div
        className="absolute w-20 h-20 rounded-2xl flex items-center justify-center z-10"
        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.9), rgba(124,58,237,0.9))', boxShadow: '0 0 60px rgba(14,165,233,0.4), 0 0 120px rgba(14,165,233,0.15)' }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Brain size={32} className="text-white" />
      </motion.div>
      {/* Orbiting dots */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{ background: i % 2 === 0 ? '#6EE7FF' : '#A78BFA', transformOrigin: '0 0' }}
          animate={{ rotate: [angle, angle + 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
        >
          <div className="absolute w-2.5 h-2.5 rounded-full" style={{ transform: `translateX(120px) translateY(-5px)`, background: 'inherit', boxShadow: '0 0 8px currentColor' }} />
        </motion.div>
      ))}
      {/* Scan line */}
      <motion.div
        className="absolute w-full h-0.5 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(110,231,255,0.6), transparent)', top: '50%' }}
        animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
      />
    </div>
  );
}

function TypewriterText({ texts }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    const current = texts[idx];
    if (phase === 'typing') {
      if (displayed.length < current.length) {
        const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase('deleting'), 2000);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
        return () => clearTimeout(t);
      } else {
        setIdx((idx + 1) % texts.length);
        setPhase('typing');
      }
    }
  }, [displayed, phase, idx, texts]);

  return (
    <span className="text-gradient">
      {displayed}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
    </span>
  );
}

const STATS = [{ val: '50K+', label: 'Interviews Done' }, { val: '94%', label: 'Success Rate' }, { val: '3', label: 'AI Rounds' }, { val: '4.9★', label: 'Rating' }];

const FEATURES = [
  { icon: Brain, title: 'Resume Intelligence', desc: 'AI extracts your exact skills — zero assumptions, 100% accurate', tag: 'AI-Powered', color: 'brand' },
  { icon: Mic2, title: 'Live Voice Interview', desc: 'Speak your answers aloud, AI listens and responds in real-time', tag: 'Voice AI', color: 'accent' },
  { icon: BarChart3, title: 'Per-Answer Scoring', desc: 'Technical accuracy, clarity, confidence scored instantly after each answer', tag: 'Real-time', color: 'success' },
  { icon: Shield, title: 'Strict Mode', desc: 'Technical questions ONLY from your listed skills — never invented', tag: 'Precision', color: 'brand' },
  { icon: Sparkles, title: 'Demo Mode', desc: 'No API key needed — our built-in model knows your name, city, and stack', tag: 'Free', color: 'warning' },
  { icon: Star, title: 'Interview History', desc: 'Track every session, score trends, badges, and improvement over time', tag: 'Dashboard', color: 'accent' },
];

const HOW_STEPS = [
  { n: '01', title: 'Create Account', desc: 'Sign up free. Your interview history and scores are saved to your profile.' },
  { n: '02', title: 'Upload or Enter Skills', desc: 'Upload your PDF resume for AI mode, or enter your details for demo mode.' },
  { n: '03', title: 'Choose Your Rounds', desc: 'Pick 1, 2, or all 3 rounds — General, HR, and Technical.' },
  { n: '04', title: 'Get Interviewed', desc: 'Answer questions, get follow-ups, see live scores after every answer.' },
  { n: '05', title: 'Review & Improve', desc: 'Full report with strengths, improvement tips, and recommendation.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const goToDashboard = () => navigate('/dashboard');
  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); };

  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <GridLines />
        <FloatingOrb cx={15} cy={20} r={300} color="radial-gradient(circle, #0EA5E9, transparent)" />
        <FloatingOrb cx={80} cy={15} r={250} color="radial-gradient(circle, #7C3AED, transparent)" delay={2} duration={10} />
        <FloatingOrb cx={50} cy={70} r={200} color="radial-gradient(circle, #F59E0B, transparent)" delay={4} duration={9} />
        <FloatingOrb cx={90} cy={60} r={180} color="radial-gradient(circle, #10B981, transparent)" delay={6} duration={11} />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
            <Brain size={20} className="text-white" />
          </motion.div>
          <div>
            <span className="font-display font-black text-white text-lg tracking-tight">InterviewAI</span>
            <span className="ml-2 text-[10px] font-mono text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded-full">v3</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it Works', 'Demo'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-slate-400 hover:text-white transition-colors font-body">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={goToDashboard} className="btn-primary flex items-center gap-2 text-sm">
              Go to Dashboard <ArrowRight size={15} />
            </motion.button>
          ) : (
            <>
              <button onClick={openLogin} className="text-sm text-slate-400 hover:text-white transition-colors font-body px-4 py-2">Sign In</button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={openRegister} className="btn-primary text-sm px-5 py-2.5">Get Started Free</motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* HERO */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-32 flex flex-col lg:flex-row items-center gap-16 min-h-[90vh]">
        {/* Left */}
        <div className="flex-1 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
            <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-xs font-mono text-brand-400">AI Interview System — v3 Pro</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] tracking-tight mb-6">
            <span className="text-white">Master Every</span><br />
            <TypewriterText texts={['Job Interview', 'Technical Round', 'HR Round', 'Career Goal']} />
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="text-slate-400 text-lg font-body leading-relaxed mb-10 max-w-xl">
            AI-powered interview simulation with strict resume analysis, real-time scoring, voice input, and personalized improvement tips. No generic questions — only what's relevant to <em className="text-white not-italic">you</em>.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex items-center gap-4 flex-wrap">
            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(14,165,233,0.4)' }} whileTap={{ scale: 0.96 }}
              onClick={user ? goToDashboard : openRegister}
              className="btn-primary text-base px-8 py-4 flex items-center gap-3 rounded-2xl"
              style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.25)' }}>
              {user ? 'Go to Dashboard' : 'Start Free'} <ArrowRight size={18} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard?demo=true')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-semibold text-base transition-all text-amber-300"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Sparkles size={18} /> Try Demo — Free
            </motion.button>
          </motion.div>

          {/* Trust line */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center gap-6 mt-10">
            <div className="flex -space-x-2">
              {['SK', 'PR', 'AN', 'VK', 'RJ'].map((initials, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-950 flex items-center justify-center text-[10px] font-display font-bold text-white" style={{ background: `hsl(${i * 60}, 70%, 45%)` }}>{initials}</div>
              ))}
            </div>
            <span className="text-sm text-slate-500 font-body"><span className="text-white font-medium">50,000+</span> interviews completed</span>
          </motion.div>
        </div>

        {/* Right — 3D Visual */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="flex-1 flex items-center justify-center relative">
          <HeroBrain />
          {/* Floating cards */}
          {[
            { label: 'Technical Score', value: '87/100', color: '#6EE7FF', x: '-180px', y: '-60px', icon: '⚡' },
            { label: 'Interview Round', value: 'Technical ✓', color: '#A78BFA', x: '160px', y: '-80px', icon: '🎯' },
            { label: 'Improvement', value: 'Add more depth', color: '#34D399', x: '-150px', y: '80px', icon: '💡' },
            { label: 'AI Analysis', value: 'Resume scanned', color: '#F59E0B', x: '140px', y: '90px', icon: '🧠' },
          ].map((card, i) => (
            <motion.div key={i}
              className="absolute rounded-xl px-3 py-2.5 backdrop-blur-xl"
              style={{ left: `calc(50% + ${card.x})`, top: `calc(50% + ${card.y})`, transform: 'translate(-50%,-50%)', background: 'rgba(13,20,36,0.85)', border: `1px solid ${card.color}30`, minWidth: '130px', boxShadow: `0 4px 20px ${card.color}15`, willChange: 'transform' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, y: [0, i % 2 === 0 ? -6 : 6, 0] }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.4, y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <div className="text-[10px] text-slate-500 font-mono mb-0.5">{card.icon} {card.label}</div>
              <div className="text-sm font-display font-bold" style={{ color: card.color }}>{card.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* STATS BAR */}
      <section className="relative z-10 border-y border-white/[0.06]" style={{ background: 'rgba(7,11,20,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl font-display font-black text-gradient mb-1">{s.val}</div>
              <div className="text-xs text-slate-500 font-body">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="text-xs font-mono text-brand-400 uppercase tracking-widest mb-4">What You Get</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mb-4">Built for Serious Candidates</h2>
          <p className="text-slate-500 font-body max-w-xl mx-auto">Every feature is designed to make your interview practice as close to the real thing as possible.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const colorMap = { brand: '#0EA5E9', accent: '#8B5CF6', success: '#10B981', warning: '#F59E0B' };
            const c = colorMap[f.color];
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: `0 20px 60px ${c}15` }}
                className="rounded-2xl p-6 transition-all duration-300 cursor-default"
                style={{ background: 'rgba(13,20,36,0.7)', border: `1px solid rgba(255,255,255,0.06)`, backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${c}15`, border: `1px solid ${c}30` }}>
                    <Icon size={19} style={{ color: c }} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ background: `${c}10`, color: c, border: `1px solid ${c}25` }}>{f.tag}</span>
                </div>
                <h3 className="font-display font-bold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-slate-500 text-xs font-body leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-8 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-4">The Process</div>
          <h2 className="font-display font-black text-4xl text-white mb-4">From Resume to Report in Minutes</h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/50 via-accent-500/50 to-transparent" />
          {HOW_STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="flex gap-6 sm:gap-8 mb-10 relative pl-16 sm:pl-20">
              <div className="absolute left-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-display font-black text-base sm:text-lg" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(14,165,233,0.2)', color: '#6EE7FF' }}>{s.n}</div>
              <div className="flex-1 pt-3">
                <h3 className="font-display font-bold text-white text-base mb-1">{s.title}</h3>
                <p className="text-slate-500 text-sm font-body">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DEMO CTA */}
      <section id="demo" className="relative z-10 max-w-4xl mx-auto px-8 py-16 pb-28">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(124,58,237,0.08))', border: '1px solid rgba(14,165,233,0.15)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.12), transparent 70%)' }} />
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-8 right-12 w-16 h-16 rounded-full border border-brand-500/20" />
          <div className="relative">
            <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-4">Try Without Signing Up</div>
            <h2 className="font-display font-black text-4xl text-white mb-4">Demo Mode — Instant Access</h2>
            <p className="text-slate-400 font-body max-w-lg mx-auto mb-8">Enter your name, city, skills and projects. Our built-in AI model generates questions using your real details — scores you, gives follow-ups, and produces a full report. No API key, no server needed.</p>
            <div className="flex items-center justify-center gap-4">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/dashboard?demo=true')}
                className="px-10 py-4 rounded-2xl font-display font-bold text-base flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff', boxShadow: '0 8px 30px rgba(245,158,11,0.3)' }}>
                <Sparkles size={18} /> Try Demo Now — Free
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={user ? goToDashboard : openRegister}
                className="btn-primary px-10 py-4 rounded-2xl text-base flex items-center gap-3">
                {user ? 'Dashboard' : 'Create Account'} <ArrowRight size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.04] px-8 py-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}><Brain size={16} className="text-white" /></div>
          <span className="font-display font-bold text-white text-sm">InterviewAI</span>
          <span className="text-xs text-slate-600 font-mono">v3 Pro</span>
        </div>
        <p className="text-xs text-slate-600 font-body">AI-Powered Interview Simulator — 2024</p>
      </footer>

      {/* AUTH MODAL */}
      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onModeChange={setAuthMode} onSuccess={() => { setShowAuth(false); goToDashboard(); }} />}
    </div>
  );
}
