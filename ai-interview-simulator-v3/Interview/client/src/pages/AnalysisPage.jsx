import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Briefcase, Code2, GraduationCap, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';
import { analyzeResume } from '../services/api';

export default function AnalysisPage() {
  const { resumeText, resumeData, setResumeData, setCurrentView, resetInterview } = useInterviewStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (resumeText && !resumeData) runAnalysis(); }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await analyzeResume(resumeText);
      setResumeData(res.analysis);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 rounded-2xl bg-brand-600/20 flex items-center justify-center mb-6"><Brain size={36} className="text-brand-400 animate-pulse" /></div>
      <h2 className="font-display font-bold text-2xl text-white mb-2">Analyzing Resume</h2>
      <p className="text-slate-500 font-body mb-4">Extracting only skills explicitly present in your resume...</p>
      <div className="flex items-center gap-2 text-brand-400"><Loader2 size={16} className="animate-spin" /><span className="font-mono text-sm">Strict extraction mode active</span></div>
    </div>
  );

  if (!resumeData) return (
    <div className="p-8 text-center"><p className="text-slate-500">No data. <button onClick={() => setCurrentView('upload')} className="text-brand-400 underline">Upload a resume first.</button></p></div>
  );

  const { name, title, summary, skills = [], technologies = [], projects = [], experience = [], education, totalExperience } = resumeData;
  const allSkills = [...new Set([...skills, ...technologies])];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-1">Resume Analysis</h1>
            <p className="text-slate-500 font-body">Only these detected skills will be used for technical questions</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { resetInterview(); setCurrentView('rounds'); }} className="btn-primary flex items-center gap-2">
            Select Rounds <ArrowRight size={16} />
          </motion.button>
        </div>

        <div className="card mb-6 flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0 text-white text-xl font-display font-bold">
            {(name || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl text-white">{name || 'Candidate'}</h2>
            <p className="text-brand-400 font-body text-sm mb-2">{title || 'Professional'}</p>
            <p className="text-slate-400 text-sm font-body leading-relaxed">{summary}</p>
            <div className="flex items-center gap-4 mt-3">
              {totalExperience && <span className="flex items-center gap-1.5 text-xs text-slate-500"><Briefcase size={12} /> {totalExperience}</span>}
              {education && <span className="flex items-center gap-1.5 text-xs text-slate-500"><GraduationCap size={12} /> {education}</span>}
            </div>
          </div>
        </div>

        {/* Strict mode notice */}
        <div className="card mb-6 border-brand-500/20 flex items-center gap-3 py-3">
          <ShieldCheck size={16} className="text-brand-400 shrink-0" />
          <p className="text-sm text-slate-300 font-body">
            <span className="text-brand-400 font-display font-semibold">Strict mode active</span> — Technical questions will only reference the {allSkills.length} skills below. No assumptions added.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Code2 size={14} className="text-brand-400" /> Skills Detected ({allSkills.length})</h3>
            <div className="flex flex-wrap gap-2">
              {allSkills.length > 0 ? allSkills.map(s => <span key={s} className="tag text-xs">{s}</span>) : <span className="text-slate-600 text-sm">None found</span>}
            </div>
          </div>

          {projects.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><span className="text-amber-400">◆</span> Projects ({projects.length})</h3>
              <div className="flex flex-col gap-3">
                {projects.map((p, i) => (
                  <div key={i} className="glass-light rounded-xl p-3">
                    <div className="font-display font-semibold text-sm text-white mb-1">{p.name}</div>
                    <p className="text-slate-500 text-xs font-body mb-2 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {(p.technologies || []).map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent-600/10 border border-accent-500/20 text-accent-400 font-mono">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {experience.length > 0 && (
            <div className="card col-span-2">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Briefcase size={14} className="text-emerald-400" /> Experience</h3>
              <div className="flex flex-col gap-2">
                {experience.map((e, i) => (
                  <div key={i} className="flex items-center justify-between glass-light rounded-xl px-4 py-3">
                    <div><div className="font-display font-semibold text-sm text-white">{e.role}</div><div className="text-xs text-slate-500 font-body">{e.company}</div></div>
                    <span className="text-xs font-mono text-slate-600">{e.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 card border-brand-500/20 text-center py-8">
          <h3 className="font-display font-bold text-xl text-white mb-2">Ready to select your rounds?</h3>
          <p className="text-slate-500 font-body text-sm mb-5">Choose 1, 2, or all 3 rounds — General, HR, Technical</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { resetInterview(); setCurrentView('rounds'); }} className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            Select Rounds <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
