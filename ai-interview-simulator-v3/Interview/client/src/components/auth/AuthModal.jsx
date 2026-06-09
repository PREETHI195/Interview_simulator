import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { register, login } from '../../services/authApi';

export default function AuthModal({ mode, onClose, onModeChange, onSuccess }) {
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    if (!isLogin && !form.name) { toast.error('Please enter your name'); return; }
    setLoading(true);
    try {
      const res = isLogin
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
      setUser(res.user, res.token);
      toast.success(isLogin ? `Welcome back, ${res.user.name.split(' ')[0]}!` : `Account created! Welcome, ${res.user.name.split(' ')[0]}!`);
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full glass rounded-xl px-4 py-3 pl-11 text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 font-body text-sm border border-dark-500 focus:border-brand-500/40 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.08)]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md glass rounded-3xl p-8"
        style={{ border: '1px solid rgba(56,189,248,0.12)' }}
      >
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-xl glass-light flex items-center justify-center text-slate-500 hover:text-white transition-colors"><X size={15} /></button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #7C3AED)' }}><Brain size={18} className="text-white" /></div>
          <div>
            <div className="font-display font-bold text-white text-lg">{isLogin ? 'Sign In' : 'Create Account'}</div>
            <div className="text-xs text-slate-500 font-body">InterviewAI — Your scores are saved</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className={inp} placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
          )}
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className={inp} type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className={inp} type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
          </div>

          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl">
            {loading ? <><Loader2 size={16} className="animate-spin" />{isLogin ? 'Signing in...' : 'Creating account...'}</> : (isLogin ? 'Sign In' : 'Create Account')}
          </motion.button>
        </form>

        <div className="text-center mt-5 text-sm text-slate-500 font-body">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => onModeChange(isLogin ? 'register' : 'login')} className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
            {isLogin ? 'Create one free' : 'Sign in'}
          </button>
        </div>

        <p className="text-[10px] text-slate-600 font-mono text-center mt-4">Your interview history and scores are saved to your profile</p>
      </motion.div>
    </div>
  );
}
