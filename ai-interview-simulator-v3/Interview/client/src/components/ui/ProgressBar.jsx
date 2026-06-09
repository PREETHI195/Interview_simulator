import { useEffect, useRef } from 'react';

export default function ProgressBar({ value, color = 'brand', label, showValue = true }) {
  const barRef = useRef(null);
  const colors = {
    brand: 'bg-gradient-to-r from-brand-600 to-brand-400',
    accent: 'bg-gradient-to-r from-accent-600 to-accent-400',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-400',
    danger: 'bg-gradient-to-r from-red-600 to-red-400',
  };

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = '0%';
      setTimeout(() => {
        if (barRef.current) barRef.current.style.width = `${value}%`;
      }, 100);
    }
  }, [value]);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-2">
          {label && <span className="text-sm text-slate-400 font-body">{label}</span>}
          {showValue && <span className="text-sm font-mono font-medium text-slate-300">{value}%</span>}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-dark-600 overflow-hidden">
        <div
          ref={barRef}
          className={`h-full rounded-full ${colors[color] || colors.brand} transition-all duration-1000 ease-out`}
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}
