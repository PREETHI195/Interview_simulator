const ROUND_META = {
  general: { label: 'General', icon: '💬' },
  hr: { label: 'HR', icon: '🤝' },
  technical: { label: 'Technical', icon: '⚙️' },
};

export default function RoundBadge({ currentRound, selectedRounds = ['general', 'hr', 'technical'] }) {
  return (
    <div className="flex items-center gap-2">
      {selectedRounds.map((key, i) => {
        const meta = ROUND_META[key] || { label: key, icon: '◆' };
        const isActive = i === currentRound;
        const isDone = i < currentRound;
        return (
          <div key={key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold transition-all duration-300 ${
              isActive ? 'bg-brand-600/30 border border-brand-500/50 text-brand-300' :
              isDone ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400' :
              'bg-dark-600/50 border border-white/5 text-slate-600'}`}>
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              {isDone && <span className="text-emerald-400">✓</span>}
            </div>
            {i < selectedRounds.length - 1 && <div className={`w-3 h-px ${isDone ? 'bg-emerald-500/50' : 'bg-dark-500'}`} />}
          </div>
        );
      })}
    </div>
  );
}
