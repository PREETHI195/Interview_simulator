import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import ResumeUpload from './ResumeUpload';
import AnalysisPage from './AnalysisPage';
import DemoSetupPage from './DemoSetupPage';
import RoundsPage from './RoundsPage';
import InterviewPage from './InterviewPage';
import ReportPage from './ReportPage';
import useInterviewStore from '../store/interviewStore';

export default function DashboardPage() {
  const { currentView, setCurrentView } = useInterviewStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('demo') === 'true') setCurrentView('demo');
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'upload':    return <ResumeUpload />;
      case 'analysis':  return <AnalysisPage />;
      case 'demo':      return <DemoSetupPage />;
      case 'rounds':    return <RoundsPage />;
      case 'interview': return <InterviewPage />;
      case 'report':    return <ReportPage />;
      default:          return <ResumeUpload />;
    }
  };

  const isInterview = currentView === 'interview';

  return (
    <DashboardLayout>
      {!isInterview && (
        <div className="glass border-b border-white/[0.04] px-8 py-4 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-600">
            <span className="text-slate-400">Dashboard</span>
            <span className="mx-2">/</span>
            <span className="capitalize text-brand-400">{currentView}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-600">
              {currentView === 'demo' ? 'Built-in Model · No API Key' : 'InterviewAI v3 · Analysis Mode'}
            </span>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={currentView} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}
          className={isInterview ? 'h-[calc(100vh-0px)]' : ''}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}
