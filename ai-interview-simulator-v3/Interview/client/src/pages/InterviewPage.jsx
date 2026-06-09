import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';
import { generateQuestions, generateFollowUp, evaluateAnswer, generateReport } from '../services/api';
import { generateDemoQuestions, generateDemoFollowUp, evaluateDemoAnswer, generateDemoImprovements, generateDemoReport } from '../services/demoModel';
import { useSpeech } from '../hooks/useSpeech';
import CameraPanel from '../components/interview/CameraPanel';
import ChatMessage from '../components/interview/ChatMessage';
import TypingIndicator from '../components/ui/TypingIndicator';
import RoundBadge from '../components/ui/RoundBadge';

const ROUND_LABELS = { general:'General', hr:'HR', technical:'Technical' };

export default function InterviewPage() {
  const {
    resumeData, demoProfile, isDemoMode, selectedRounds,
    currentRound, currentQuestionIndex, questions, chatMessages,
    isTyping, interviewHistory, awaitingFollowUp, followUpQ,
    setCurrentRound, setCurrentQuestionIndex, setQuestions,
    addChatMessage, addToHistory, setIsTyping, setReport, setCurrentView,
    setAwaitingFollowUp, setFollowUpQ, addPerAnswerScore, addImprovement,
  } = useInterviewStore();

  const [answer, setAnswer] = useState('');
  const [loadingQs, setLoadingQs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const chatEndRef = useRef(null);
  const { speak, stopSpeaking, startListening, stopListening, isListening } = useSpeech();

  const profile = isDemoMode ? demoProfile : null;
  const roundKey = selectedRounds[currentRound] || 'general';
  const currentRoundQs = questions[roundKey] || [];
  const currentQ = awaitingFollowUp ? { question: followUpQ } : currentRoundQs[currentQuestionIndex];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatMessages, isTyping]);

  useEffect(() => {
    if (currentRoundQs.length === 0 && selectedRounds.length > 0) {
      loadRoundQuestions(roundKey);
    }
  }, [currentRound]);

  const loadRoundQuestions = async (round) => {
    if (!resumeData) { toast.error('No profile found.'); setCurrentView('upload'); return; }
    setLoadingQs(true);
    const welcomes = {
      general: isDemoMode ? `Welcome, ${profile?.name?.split(' ')[0]}! Starting the General round — 5 personalized questions about you.` : "Welcome! Starting the General round — 5 questions about your background.",
      hr: "Moving to the HR round — 5 behavioral questions about your soft skills.",
      technical: isDemoMode ? `Technical round! All questions are strictly from your skills: ${(profile?.skills||[]).slice(0,4).join(', ')}` : `Technical round — all questions strictly from your resume skills.`
    };
    addChatMessage({ role:'ai', content:welcomes[round], type:'info' });
    try {
      let qs;
      if (isDemoMode) {
        // Use built-in demo model — no API needed
        qs = generateDemoQuestions(round, profile);
      } else {
        const res = await generateQuestions(round, resumeData);
        qs = res.questions;
      }
      setQuestions(round, qs);
      setTimeout(() => {
        const q = qs[0];
        if (q) {
          addChatMessage({ role:'ai', content:q.question, type:'question', category:`${ROUND_LABELS[round]} Q1`, badge:q.skill_tested||'' });
          if (voiceOn) speak(q.question);
        }
      }, 500);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoadingQs(false); }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    const userAnswer = answer.trim();
    setAnswer('');
    const questionText = awaitingFollowUp ? followUpQ : (currentQ?.question || '');
    addChatMessage({ role:'user', content:userAnswer, type:'answer' });
    addToHistory({ question:questionText, answer:userAnswer, round:roundKey });
    setSubmitting(true);
    setIsTyping(true);

    try {
      let scores, improvements, followUpText;

      if (isDemoMode) {
        // Built-in model — instant, no API
        scores = evaluateDemoAnswer(questionText, userAnswer, profile);
        improvements = generateDemoImprovements(questionText, userAnswer, scores, profile);
        followUpText = generateDemoFollowUp(questionText, userAnswer, profile);
        // Small delay to simulate "thinking"
        await new Promise(r => setTimeout(r, 800));
      } else {
        // Real OpenAI evaluation
        const evalRes = await evaluateAnswer(questionText, userAnswer, resumeData);
        scores = evalRes.scores;
        improvements = evalRes.improvements;
        const fuRes = await generateFollowUp(questionText, userAnswer, resumeData);
        followUpText = fuRes.followUp;
      }

      addPerAnswerScore(scores);
      if (improvements?.length) addImprovement(improvements);

      // Show inline score
      const scoreMsg = `Score — Technical: ${scores.technical_score}/10 · Clarity: ${scores.clarity_score}/10 · Confidence: ${scores.confidence_score}/10 · Overall: ${scores.overall_score}/10`;
      addChatMessage({ role:'ai', content:scoreMsg, type:'score' });

      // Show improvements
      if (improvements?.length) {
        const impMsg = improvements.map((imp,i) => `${i+1}. ${imp}`).join('\n');
        addChatMessage({ role:'ai', content:`Improvement tips:\n${impMsg}`, type:'improvement' });
      }

      if (!awaitingFollowUp) {
        setIsTyping(false);
        addChatMessage({ role:'ai', content:followUpText, type:'followup' });
        if (voiceOn) speak(followUpText);
        setFollowUpQ(followUpText);
        setAwaitingFollowUp(true);
      } else {
        setAwaitingFollowUp(false); setFollowUpQ('');
        const isLastQ = currentQuestionIndex >= currentRoundQs.length - 1;
        const isLastRound = currentRound >= selectedRounds.length - 1;

        if (!isLastQ) {
          const nextIdx = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIdx);
          const nextQ = currentRoundQs[nextIdx];
          setTimeout(() => {
            setIsTyping(false);
            addChatMessage({ role:'ai', content:nextQ.question, type:'question', category:`${ROUND_LABELS[roundKey]} Q${nextIdx+1}`, badge:nextQ.skill_tested||'' });
            if (voiceOn) speak(nextQ.question);
          }, 600);
          return;
        } else if (!isLastRound) {
          setCurrentRound(currentRound + 1);
          setCurrentQuestionIndex(0);
          setTimeout(() => { setIsTyping(false); loadRoundQuestions(selectedRounds[currentRound+1]); }, 600);
          return;
        } else {
          setIsTyping(false);
          addChatMessage({ role:'ai', content:'All rounds complete! Generating your detailed performance report...', type:'info' });
          let report;
          if (isDemoMode) {
            report = generateDemoReport(interviewHistory, profile, selectedRounds);
            await new Promise(r => setTimeout(r, 1000));
          } else {
            const res = await generateReport(interviewHistory, resumeData, selectedRounds);
            report = res.report;
          }
          setReport(report);
          setTimeout(() => setCurrentView('report'), 1200);
          return;
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally { setIsTyping(false); setSubmitting(false); }
  };

  const progress = currentRoundQs.length > 0
    ? Math.round(((currentQuestionIndex + (awaitingFollowUp ? 0.5 : 0)) / currentRoundQs.length) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="glass border-b border-white/[0.04] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-white text-lg">Live Interview</h1>
              {isDemoMode && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400">DEMO MODE</span>}
            </div>
            <div className="mt-1"><RoundBadge currentRound={currentRound} selectedRounds={selectedRounds}/></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-dark-600 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{width:`${progress}%`}}/>
              </div>
              <span className="text-xs font-mono text-slate-500">{currentQuestionIndex+1}/{currentRoundQs.length||'?'}</span>
            </div>
            <button onClick={()=>{setVoiceOn(v=>!v);stopSpeaking();}} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${voiceOn?'bg-brand-600/20 text-brand-400':'bg-dark-600/50 text-slate-600'}`}>
              {voiceOn?<Volume2 size={14}/>:<VolumeX size={14}/>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {loadingQs ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <Loader2 size={28} className="text-brand-400 animate-spin"/>
              <p className="text-slate-500 font-body text-sm">
                {isDemoMode ? `Building personalized ${ROUND_LABELS[roundKey]} questions for ${profile?.name?.split(' ')[0]}...` : `Generating ${ROUND_LABELS[roundKey]} questions from your resume...`}
              </p>
            </div>
          ) : (
            <>
              {chatMessages.map((msg,i) => <ChatMessage key={i} msg={msg} index={i}/>)}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
                  <div className="glass rounded-2xl rounded-tl-sm"><TypingIndicator/></div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </>
          )}
        </div>

        <div className="glass border-t border-white/[0.04] px-6 py-4 shrink-0">
          {awaitingFollowUp && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-amber-500">↩ Follow-up question</span>
              <button onClick={()=>{setAwaitingFollowUp(false);setFollowUpQ('');}} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors"><SkipForward size={12}/>Skip</button>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={()=>{ if(isListening){stopListening();return;} const ok=startListening(t=>setAnswer(p=>p+(p?' ':'')+t),()=>{}); if(!ok)toast.error('Speech recognition requires Chrome.'); }}
              disabled={submitting||isTyping}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${isListening?'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse':'glass-light text-slate-500 hover:text-brand-400'}`}>
              {isListening?<MicOff size={16}/>:<Mic size={16}/>}
            </button>
            <textarea value={answer} onChange={e=>setAnswer(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSubmit();}}}
              placeholder={isListening?'Listening...':`Type your answer... (Enter to submit)`}
              disabled={submitting||isTyping||loadingQs} rows={2} className="input-field resize-none flex-1 text-sm"/>
            <button onClick={handleSubmit} disabled={!answer.trim()||submitting||isTyping||loadingQs}
              className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-all">
              {submitting?<Loader2 size={16} className="text-white animate-spin"/>:<Send size={16} className="text-white"/>}
            </button>
          </div>
          <p className="text-[10px] text-slate-700 mt-2 font-mono text-center">
            Round {currentRound+1}/{selectedRounds.length} · Q{currentQuestionIndex+1}/{currentRoundQs.length||'?'} · {awaitingFollowUp?'Follow-up':'Main Q'} · {isDemoMode?'Demo Model':'AI Model'}
          </p>
        </div>
      </div>

      <div className="w-64 shrink-0 border-l border-white/[0.04] p-4 flex flex-col gap-4 overflow-y-auto">
        <CameraPanel/>
        {isDemoMode && profile && (
          <div className="card p-4 border-amber-500/20 bg-amber-500/5">
            <div className="text-xs font-display font-semibold text-amber-400 mb-3 flex items-center gap-1.5">★ Your Profile</div>
            <div className="font-display font-bold text-white text-sm">{profile.name}</div>
            <div className="text-[11px] text-brand-400 font-body">{profile.role}</div>
            {profile.place&&<div className="text-[11px] text-slate-500 font-body">{profile.place}</div>}
            <div className="mt-3 flex flex-wrap gap-1">
              {(profile.skills||[]).slice(0,6).map(s=><span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-600/15 border border-brand-500/20 text-brand-400 font-mono">{s}</span>)}
            </div>
          </div>
        )}
        <div className="card p-4">
          <h3 className="font-display font-semibold text-sm text-white mb-3">Session</h3>
          {[
            {label:'Round',val:ROUND_LABELS[roundKey]},
            {label:'Question',val:`${currentQuestionIndex+1}/${currentRoundQs.length||'?'}`},
            {label:'Answers',val:interviewHistory.length},
            {label:'Mode',val:isDemoMode?'Demo (Built-in)':'AI (OpenAI)'},
          ].map(({label,val})=>(
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
              <span className="text-xs text-slate-600 font-body">{label}</span>
              <span className="text-xs font-mono text-slate-300">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
