import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, RotateCcw, TrendingUp, MessageSquare, Zap, Star, CheckCircle, AlertTriangle, Trophy, ShieldCheck, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';
import useAuthStore from '../store/authStore';
import { recordInterview, getStats } from '../services/authApi';
import ProgressBar from '../components/ui/ProgressBar';

const getScoreColor = (s) => s >= 80 ? 'success' : s >= 60 ? 'brand' : s >= 40 ? 'warning' : 'danger';
const getRecColor = (r = '') => {
  const l = r.toLowerCase();
  if (l.includes('strong')) return 'text-emerald-400';
  if (l.includes('no')) return 'text-red-400';
  if (l.includes('maybe')) return 'text-amber-400';
  return 'text-brand-400';
};
const getRecBg = (r = '') => {
  const l = r.toLowerCase();
  if (l.includes('strong')) return { bg: 'var(--color-background-success)', border: 'var(--color-border-success)' };
  if (l.includes('no')) return { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' };
  if (l.includes('maybe')) return { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' };
  return { bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)' };
};

export default function ReportPage() {
  const { report, resumeData, selectedRounds, interviewHistory, allImprovements, perAnswerScores, isDemoMode, resetAll, setCurrentView } = useInterviewStore();
  const { user, token, setStats } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const savedRef = useRef(false);

  // Auto-save interview to user profile
  useEffect(() => {
    if (!report || !user || !token || savedRef.current) return;
    savedRef.current = true;
    (async () => {
      try {
        const res = await recordInterview(token, {
          report,
          mode: isDemoMode ? 'demo' : 'ai',
          rounds: selectedRounds,
          questionsAnswered: interviewHistory.length,
          durationMinutes: Math.round(interviewHistory.length * 2.5),
        });
        setStats(res.stats);
        setSaved(true);
        toast.success('Interview saved to your profile!');
      } catch (err) {
        console.warn('Could not save interview:', err.message);
      }
    })();
  }, [report, user, token]);

  if (!report) return (
    <div className="p-8 text-center">
      <p className="text-slate-500 font-body">No report yet. Complete an interview first.</p>
      <button onClick={() => setCurrentView('upload')} className="btn-primary mt-4 mx-auto">Start Interview</button>
    </div>
  );

  const { overallScore=0, technicalScore=0, communicationScore=0, confidenceScore=0, recommendation='N/A', strengths=[], improvements=[], summary='', roundScores={}, skillsAssessed=[] } = report;
  const allSkills = skillsAssessed.length > 0 ? skillsAssessed : [...new Set([...(resumeData?.skills||[]),...(resumeData?.technologies||[])])];
  const recStyle = getRecBg(recommendation);

  const handleDownloadJSON = () => {
    const out = {
      candidate: resumeData?.name||'Candidate', role: resumeData?.title||'N/A',
      selected_rounds: selectedRounds, skills_detected: allSkills,
      scores: { technicalScore, communicationScore, confidenceScore, overallScore },
      round_scores: roundScores, per_answer_scores: perAnswerScores,
      improvements: [...new Set([...improvements,...allImprovements])], strengths,
      recommendation, summary, interview_transcript: interviewHistory,
    };
    const blob = new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
    const a = document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download=`interview-report-${Date.now()}.json`; a.click();
    toast.success('Report downloaded!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div className="flex items-start justify-between mb-8">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 rounded-full border-2 border-brand-500/20 border-t-brand-500" />
              <span className="text-[10px] font-mono text-brand-400 uppercase tracking-widest">Certified Analysis Report</span>
            </div>
            <h1 className="font-display font-black text-4xl text-white mb-1 tracking-tight">AI Analysing Report</h1>
            <p className="text-slate-500 font-body flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400"/>
              Evaluation Engine v3.2.0 — {isDemoMode ? 'Simulated Intelligence' : 'Resume-based neural assessment'}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {saved && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-xl" style={{background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)'}}>
                <Cloud size={12}/> Saved to profile
              </div>
            )}
            {!user && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 px-3 py-1.5 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                Sign in to save
              </div>
            )}
            <button onClick={handleDownloadJSON} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Download JSON</button>
            <button onClick={resetAll} className="btn-accent flex items-center gap-2 text-sm"><RotateCcw size={14}/> New Interview</button>
          </div>
        </div>

        <div className="card mb-6 relative overflow-hidden text-center py-12 border-brand-500/20 bg-dark-900/40">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={120} />
          </div>
          <div className="absolute inset-0 opacity-10" style={{background:'radial-gradient(circle at center, #0EA5E9 0%, transparent 70%)'}}/>
          
          <div className="relative z-10">
            <div className="text-[10px] font-mono text-brand-400 uppercase tracking-[0.2em] mb-4">Overall Performance Quotient</div>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-8xl font-display font-black text-gradient leading-none">{overallScore}</div>
              <div className="text-left">
                <div className="text-sm font-body text-slate-500 mb-1">Scale of 100</div>
                <div className={`text-lg font-display font-bold uppercase tracking-wider ${getRecColor(recommendation)}`}>
                  {recommendation}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-6 border-t border-white/[0.05] max-w-sm mx-auto">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Report ID</div>
                <div className="text-xs text-white font-mono">IAI-{Math.floor(Date.now()/1000).toString(16).toUpperCase()}</div>
              </div>
              <div className="w-px h-8 bg-white/[0.05]" />
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Status</div>
                <div className="text-xs text-emerald-400 font-mono uppercase">Verified ✓</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 score cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['Technical',technicalScore,Zap,'brand'],['Communication',communicationScore,MessageSquare,'accent'],['Confidence',confidenceScore,TrendingUp,'success']].map(([label,value,Icon,color])=>(
            <motion.div key={label} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.1}} className="card text-center">
              <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${color==='brand'?'bg-brand-600/20 text-brand-400':color==='accent'?'bg-accent-600/20 text-accent-400':'bg-emerald-600/20 text-emerald-400'}`}><Icon size={18}/></div>
              <div className="text-3xl font-display font-extrabold text-white mb-1">{value}</div>
              <div className="text-xs text-slate-500 font-body mb-3">{label}</div>
              <ProgressBar value={value} color={getScoreColor(value)} showValue={false}/>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-5">Round Breakdown</h3>
            {selectedRounds.map(r=>(
              <div key={r} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-body capitalize">{r} round</span>
                  <span className="text-xs font-mono text-slate-300">{roundScores[r]||0}/100</span>
                </div>
                <ProgressBar value={roundScores[r]||0} color={getScoreColor(roundScores[r]||0)} showValue={false}/>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4">AI Assessment</h3>
            <p className="text-slate-400 text-sm font-body leading-relaxed">{summary}</p>
            {allSkills.length>0&&(
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                <div className="flex items-center gap-2 mb-2"><ShieldCheck size={12} className="text-brand-400"/><span className="text-xs text-slate-500 font-body">Skills assessed</span></div>
                <div className="flex flex-wrap gap-1">{allSkills.slice(0,8).map(s=><span key={s} className="tag text-[10px]">{s}</span>)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-400"/>Strengths</h3>
            {strengths.map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}} className="flex items-start gap-3 text-sm font-body text-slate-300 mb-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle size={9} className="text-emerald-400"/></div>
                {s}
              </motion.div>
            ))}
          </div>
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-400"/>Improvements</h3>
            {[...new Set([...improvements,...allImprovements])].slice(0,5).map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}} className="flex items-start gap-3 text-sm font-body text-slate-300 mb-3">
                <div className="w-5 h-5 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5"><AlertTriangle size={9} className="text-amber-400"/></div>
                {s}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
