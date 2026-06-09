import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Briefcase, Code2, FolderOpen, Plus, X, ArrowRight, Sparkles, GraduationCap, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';

const SKILL_SUGGESTIONS = [
  'JavaScript','TypeScript','Python','Java','React','Node.js','Django','Express',
  'MongoDB','PostgreSQL','MySQL','AWS','Docker','Git','HTML','CSS','Vue.js',
  'Angular','Spring Boot','Machine Learning','TensorFlow','Redux','GraphQL',
  'REST APIs','C++','Go','Ruby','PHP','Kubernetes','Redis','Firebase','Flutter'
];

const steps = [
  { id:1, label:'Personal', icon:User },
  { id:2, label:'Skills', icon:Code2 },
  { id:3, label:'Projects', icon:FolderOpen },
  { id:4, label:'Review', icon:Sparkles },
];

export default function DemoSetupPage() {
  const { setDemoProfile, setResumeData, setCurrentView, setIsDemoMode, resetInterview } = useInterviewStore();
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name:'', place:'', role:'', experience:'', education:'',
    skills:[],
    projects:[{ name:'', description:'', tech:'' }],
  });

  const update = (k,v) => setForm(f=>({...f,[k]:v}));
  const addSkill = (s) => { const t=s.trim(); if(!t||form.skills.includes(t)) return; update('skills',[...form.skills,t]); setSkillInput(''); };
  const removeSkill = (s) => update('skills',form.skills.filter(x=>x!==s));
  const addProject = () => update('projects',[...form.projects,{name:'',description:'',tech:''}]);
  const removeProject = (i) => update('projects',form.projects.filter((_,idx)=>idx!==i));
  const updateProject = (i,k,v) => { const p=[...form.projects]; p[i]={...p[i],[k]:v}; update('projects',p); };

  const goNext = () => {
    if (step===1){if(!form.name.trim()){toast.error('Enter your name');return;}if(!form.role.trim()){toast.error('Enter your target role');return;}}
    if (step===2&&form.skills.length===0){toast.error('Add at least one skill');return;}
    setStep(s=>Math.min(4,s+1));
  };

  const handleStart = () => {
    const profile = {
      name: form.name.trim(),
      place: form.place.trim(),
      role: form.role.trim(),
      experience: form.experience.trim(),
      education: form.education.trim(),
      skills: form.skills,
      technologies: form.skills,
      projects: form.projects.filter(p=>p.name.trim()).map(p=>({
        name: p.name.trim(),
        description: p.description.trim(),
        technologies: p.tech.split(',').map(t=>t.trim()).filter(Boolean),
      })),
    };
    const resumeData = {
      name: profile.name,
      title: profile.role,
      summary: `${profile.name} from ${profile.place||'India'} with ${profile.experience||'professional'} experience as ${profile.role}. Skilled in ${profile.skills.slice(0,4).join(', ')}.`,
      skills: profile.skills,
      technologies: profile.skills,
      projects: profile.projects,
      experience: profile.experience?[{company:'Previous Company',role:profile.role,duration:profile.experience}]:[],
      education: profile.education||'Not specified',
      totalExperience: profile.experience||'N/A',
    };
    resetInterview();
    setDemoProfile(profile);
    setResumeData(resumeData);
    setIsDemoMode(true);
    toast.success(`Profile ready, ${profile.name.split(' ')[0]}! Interview personalized for you.`);
    setCurrentView('rounds');
  };

  const inp = "w-full glass rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 font-body text-sm border border-dark-500 focus:border-brand-500/40 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.08)]";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><Sparkles size={16} className="text-amber-400"/></div>
            <span className="text-xs font-mono text-amber-400 font-semibold">DEMO MODE — No API Key Needed</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Build Your Profile</h1>
          <p className="text-slate-500 font-body text-sm">Our built-in AI model trains on your real details — name, city, skills, projects — to generate fully personalized questions, scores, and improvements.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s,i)=>{ const Icon=s.icon; const done=step>s.id; const active=step===s.id; return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${active?'bg-brand-600/30 border border-brand-500/40 text-brand-300':done?'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400':'bg-dark-700/50 border border-dark-500 text-slate-600'}`}>
                <Icon size={11}/>{s.label}{done?' ✓':''}
              </div>
              {i<steps.length-1&&<ChevronRight size={12} className="text-dark-500"/>}
            </div>
          );})}
        </div>

        <AnimatePresence mode="wait">
          {step===1&&(
            <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="flex flex-col gap-4">
              <div className="card">
                <div className="font-display font-semibold text-white mb-4 flex items-center gap-2"><User size={15} className="text-brand-400"/>Personal Information</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-slate-500 font-body mb-1.5 block">Full Name *</label><input className={inp} placeholder="e.g. Arjun Sharma" value={form.name} onChange={e=>update('name',e.target.value)}/></div>
                  <div><label className="text-xs text-slate-500 font-body mb-1.5 block flex items-center gap-1"><MapPin size={10}/>City / Place</label><input className={inp} placeholder="e.g. Chennai, Tamil Nadu" value={form.place} onChange={e=>update('place',e.target.value)}/></div>
                  <div><label className="text-xs text-slate-500 font-body mb-1.5 block">Target Role *</label><input className={inp} placeholder="e.g. Full Stack Developer" value={form.role} onChange={e=>update('role',e.target.value)}/></div>
                  <div><label className="text-xs text-slate-500 font-body mb-1.5 block flex items-center gap-1"><Briefcase size={10}/>Experience</label><input className={inp} placeholder="e.g. 2 years" value={form.experience} onChange={e=>update('experience',e.target.value)}/></div>
                  <div className="col-span-2"><label className="text-xs text-slate-500 font-body mb-1.5 block flex items-center gap-1"><GraduationCap size={10}/>Education</label><input className={inp} placeholder="e.g. B.Tech CS, Anna University 2022" value={form.education} onChange={e=>update('education',e.target.value)}/></div>
                </div>
              </div>
              <div className="card border-amber-500/15 bg-amber-500/5">
                <p className="text-xs text-amber-400/80 font-body leading-relaxed">Your <strong className="text-amber-400">{form.name||'name'}</strong> and <strong className="text-amber-400">{form.place||'city'}</strong> will appear directly in interview questions — making them feel personal and realistic.</p>
              </div>
            </motion.div>
          )}

          {step===2&&(
            <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="flex flex-col gap-4">
              <div className="card">
                <div className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Code2 size={15} className="text-accent-400"/>Skills & Technologies</div>
                <div className="flex gap-2 mb-4">
                  <input className={`${inp} flex-1`} placeholder="Type a skill and press Enter" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addSkill(skillInput);}}}/>
                  <button onClick={()=>addSkill(skillInput)} className="btn-primary px-4">Add</button>
                </div>
                {form.skills.length>0&&(
                  <div className="flex flex-wrap gap-2 mb-4 p-3 glass-light rounded-xl">
                    {form.skills.map(s=>(
                      <span key={s} className="flex items-center gap-1.5 tag text-xs">{s}<button onClick={()=>removeSkill(s)} className="ml-1 text-slate-500 hover:text-red-400"><X size={10}/></button></span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-slate-600 font-body mb-2">Quick add:</div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(s=>!form.skills.includes(s)).slice(0,16).map(s=>(
                    <button key={s} onClick={()=>addSkill(s)} className="text-[11px] px-2.5 py-1 rounded-full border border-dark-500 text-slate-500 hover:border-brand-500/40 hover:text-brand-400 transition-all font-body">+ {s}</button>
                  ))}
                </div>
              </div>
              <div className="card border-brand-500/15 bg-brand-500/5">
                <p className="text-xs text-brand-400/80 font-body">Technical questions will be generated <strong>only</strong> from your {form.skills.length} listed skills. No technologies will be assumed or added.</p>
              </div>
            </motion.div>
          )}

          {step===3&&(
            <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="flex flex-col gap-4">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display font-semibold text-white flex items-center gap-2"><FolderOpen size={15} className="text-emerald-400"/>Projects</div>
                  <button onClick={addProject} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors font-display font-medium"><Plus size={12}/>Add Project</button>
                </div>
                {form.projects.map((proj,i)=>(
                  <div key={i} className="glass-light rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-slate-500">Project {i+1}</span>
                      {form.projects.length>1&&<button onClick={()=>removeProject(i)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={13}/></button>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input className={inp} placeholder="Project name (e.g. E-Commerce Platform)" value={proj.name} onChange={e=>updateProject(i,'name',e.target.value)}/>
                      <input className={inp} placeholder="What does it do?" value={proj.description} onChange={e=>updateProject(i,'description',e.target.value)}/>
                      <input className={inp} placeholder="Technologies used (comma-separated)" value={proj.tech} onChange={e=>updateProject(i,'tech',e.target.value)}/>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 font-body">Projects are optional — they make technical questions much more specific and personalized.</p>
            </motion.div>
          )}

          {step===4&&(
            <motion.div key="s4" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="flex flex-col gap-4">
              <div className="card">
                <div className="font-display font-semibold text-white mb-5 flex items-center gap-2"><Sparkles size={15} className="text-amber-400"/>Profile Preview</div>
                <div className="flex items-start gap-4 mb-5 pb-5 border-b border-dark-600">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-xl shrink-0">{form.name[0]?.toUpperCase()||'?'}</div>
                  <div>
                    <div className="font-display font-bold text-white text-xl">{form.name||'Your Name'}</div>
                    <div className="text-brand-400 text-sm font-body">{form.role||'Your Role'}</div>
                    {form.place&&<div className="text-slate-500 text-xs font-body flex items-center gap-1 mt-1"><MapPin size={10}/>{form.place}</div>}
                    {form.experience&&<div className="text-slate-500 text-xs font-body flex items-center gap-1"><Briefcase size={10}/>{form.experience}</div>}
                    {form.education&&<div className="text-slate-500 text-xs font-body flex items-center gap-1"><GraduationCap size={10}/>{form.education}</div>}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-xs text-slate-500 font-body mb-2">{form.skills.length} skills</div>
                  <div className="flex flex-wrap gap-1.5">{form.skills.map(s=><span key={s} className="tag text-xs">{s}</span>)}</div>
                </div>
                {form.projects.filter(p=>p.name).length>0&&(
                  <div>
                    <div className="text-xs text-slate-500 font-body mb-2">{form.projects.filter(p=>p.name).length} project(s)</div>
                    {form.projects.filter(p=>p.name).map((p,i)=>(
                      <div key={i} className="text-xs text-slate-400 font-body mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
                        <span className="font-medium text-white">{p.name}</span> — {p.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card border-emerald-500/20 bg-emerald-500/5">
                <div className="text-xs text-emerald-400 font-body leading-relaxed">
                  <strong className="font-display text-emerald-300">Demo model will use your data to:</strong>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {[
                      `Address you as "${form.name.split(' ')[0]||'you'}" in every question`,
                      `Reference "${form.place||'your city'}" in General round questions`,
                      `Generate Technical Qs ONLY from: ${form.skills.slice(0,4).join(', ')||'your skills'}`,
                      `Ask about your specific projects: ${form.projects.filter(p=>p.name).map(p=>p.name).join(', ')||'none added'}`,
                      'Score every answer on Technical Accuracy, Clarity, Confidence',
                      'Give 2-3 personalized improvement tips after each answer',
                    ].map((item,i)=>(
                      <div key={i} className="flex items-start gap-2"><CheckCircle size={11} className="text-emerald-400 mt-0.5 shrink-0"/>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 mt-6">
          {step>1&&<button onClick={()=>setStep(s=>s-1)} className="btn-secondary">← Back</button>}
          {step<4?(
            <button onClick={goNext} className="btn-primary flex items-center gap-2 flex-1 justify-center">Next <ArrowRight size={16}/></button>
          ):(
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleStart} className="btn-accent flex items-center gap-2 flex-1 justify-center py-4">
              <Sparkles size={16}/>Start My Personalized Interview
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
