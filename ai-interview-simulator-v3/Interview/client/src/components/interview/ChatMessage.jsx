import { motion } from 'framer-motion';
import { Bot, User, BarChart2, Lightbulb } from 'lucide-react';

export default function ChatMessage({ msg, index }) {
  const isAI = msg.role === 'ai';

  if (msg.type === 'score') {
    return (
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}} className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-600/20 flex items-center justify-center shrink-0"><BarChart2 size={13} className="text-amber-400"/></div>
        <div className="glass-light rounded-xl px-4 py-2.5 text-xs font-mono text-amber-300 border border-amber-500/15 leading-relaxed">{msg.content}</div>
      </motion.div>
    );
  }

  if (msg.type === 'improvement') {
    return (
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3}} className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0"><Lightbulb size={13} className="text-emerald-400"/></div>
        <div className="glass-light rounded-xl px-4 py-3 text-xs font-body text-emerald-300 border border-emerald-500/15 leading-relaxed whitespace-pre-line">{msg.content}</div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.3,delay:index*0.012}} className={`flex gap-3 ${isAI?'':'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAI?'bg-gradient-to-br from-brand-600 to-accent-600':'bg-dark-600 border border-white/10'}`}>
        {isAI?<Bot size={13} className="text-white"/>:<User size={13} className="text-slate-400"/>}
      </div>
      <div className="max-w-[75%]">
        <div className={`text-xs font-display font-semibold mb-1.5 ${isAI?'text-brand-400':'text-right text-slate-500'}`}>{isAI?'AI Interviewer':'You'}</div>
        <div className={`rounded-2xl px-4 py-3 text-sm font-body leading-relaxed whitespace-pre-line ${isAI?'bg-dark-700/60 border border-white/[0.05] text-slate-200 rounded-tl-sm':'bg-brand-600/20 border border-brand-500/20 text-brand-100 rounded-tr-sm'}`}>{msg.content}</div>
        {msg.category&&<div className="mt-1 ml-1"><span className="text-[10px] font-mono text-slate-600">{msg.category}{msg.badge?` · ${msg.badge}`:''}</span></div>}
        {msg.type==='followup'&&<div className="mt-1 ml-1"><span className="text-[10px] font-mono text-amber-600">↩ Follow-up</span></div>}
      </div>
    </motion.div>
  );
}
