import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Code2, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';

const ROUND_CONFIG = [
  { key: 'general', label: 'General Round', icon: MessageCircle, color: 'brand', desc: '5 questions about background, motivation, and career goals', questions: ['Tell me about yourself.', 'What is your professional background?', 'Why did you choose this field?', 'What are your career goals?', 'What motivates you professionally?'] },
  { key: 'hr', label: 'HR Round', icon: Users, color: 'accent', desc: '5 behavioral and situational HR questions', questions: ['What are your key strengths?', 'What is your biggest weakness?', 'Describe a challenge you faced.', 'Why should we hire you?', 'Where do you see yourself in 5 years?'] },
  { key: 'technical', label: 'Technical Round', icon: Code2, color: 'success', desc: 'Questions STRICTLY from your resume skills and projects only', questions: ['Generated from your specific skills', 'Based on your listed projects', 'Tailored to your tech stack', 'No assumed technologies', 'Strictly resume-based'] },
];

export default function RoundsPage() {
  const { selectedRounds, setSelectedRounds, setCurrentView, resetInterview } = useInterviewStore();

  const toggleRound = (key) => {
    setSelectedRounds(
      selectedRounds.includes(key)
        ? selectedRounds.filter(r => r !== key)
        : [...selectedRounds, key]
    );
  };

  const handleStart = () => {
    if (selectedRounds.length === 0) { toast.error('Please select at least one round.'); return; }
    resetInterview();
    setCurrentView('interview');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Select Interview Rounds</h1>
          <p className="text-slate-500 font-body">Choose 1, 2, or all 3 rounds. You can mix and match.</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {ROUND_CONFIG.map((round, i) => {
            const Icon = round.icon;
            const isSelected = selectedRounds.includes(round.key);
            const colorMap = { brand: 'border-brand-500/40 bg-brand-600/10', accent: 'border-accent-500/40 bg-accent-600/10', success: 'border-emerald-500/40 bg-emerald-600/10' };
            const iconMap = { brand: 'bg-brand-600/20 text-brand-400', accent: 'bg-accent-600/20 text-accent-400', success: 'bg-emerald-600/20 text-emerald-400' };

            return (
              <motion.div
                key={round.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => toggleRound(round.key)}
                className={`card cursor-pointer transition-all duration-200 ${isSelected ? colorMap[round.color] : 'hover:border-dark-400'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? iconMap[round.color] : 'bg-dark-600/50 text-slate-500'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-semibold text-white text-sm">{round.label}</h3>
                      {isSelected && <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400"><CheckCircle size={10} /> Selected</span>}
                    </div>
                    <p className="text-xs text-slate-500 font-body mb-3">{round.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {round.questions.map((q, qi) => (
                        <span key={qi} className={`text-[10px] px-2 py-0.5 rounded-full border font-body ${isSelected ? (round.color === 'brand' ? 'bg-brand-600/10 border-brand-500/20 text-brand-300' : round.color === 'accent' ? 'bg-accent-600/10 border-accent-500/20 text-accent-300' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-300') : 'bg-dark-600/30 border-dark-500 text-slate-600'}`}>{q}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-dark-400'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="card mb-6 border-dark-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-semibold text-white text-sm mb-1">
                {selectedRounds.length === 0 ? 'No rounds selected' : `${selectedRounds.length} round${selectedRounds.length > 1 ? 's' : ''} selected`}
              </div>
              <div className="text-xs text-slate-500 font-body">
                {selectedRounds.length > 0 ? selectedRounds.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' → ') : 'Select at least one round to continue'}
              </div>
            </div>
            <div className="text-2xl font-display font-bold text-gradient">{selectedRounds.length * 5}+</div>
          </div>
          <div className="text-xs text-slate-600 font-mono mt-2">questions + follow-ups for each</div>
        </div>

        <motion.button
          whileHover={{ scale: selectedRounds.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedRounds.length > 0 ? 0.98 : 1 }}
          onClick={handleStart}
          disabled={selectedRounds.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Begin Interview <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </div>
  );
}
