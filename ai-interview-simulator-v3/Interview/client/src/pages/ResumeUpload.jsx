import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';
import { uploadResume } from '../services/api';

export default function ResumeUpload() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const { setResumeFile, setResumeText, setCurrentView } = useInterviewStore();

  const handleFile = useCallback(async (f) => {
    const ext = f.name.toLowerCase().split('.').pop();
    if (!['pdf','docx','doc','txt'].includes(ext)) {
      toast.error('Please upload PDF, DOCX, or TXT files only.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB.'); return; }
    setFile(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadResume(file);
      setResumeFile(file);
      setResumeText(res.text);
      toast.success('Resume extracted successfully!');
      setTimeout(() => setCurrentView('analysis'), 400);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const formatSize = (b) => b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB';

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Upload Resume</h1>
          <p className="text-slate-500 font-body">Questions will be <span className="text-brand-400 font-medium">strictly based on your resume skills only</span> — no assumptions added</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
            ${dragging ? 'border-brand-400 bg-brand-600/10' : 'border-dark-500 hover:border-dark-400 bg-dark-800/30'}
            ${file ? 'border-emerald-500/40 bg-emerald-600/5' : ''}`}
          onClick={() => !file && document.getElementById('file-input').click()}
        >
          <input id="file-input" type="file" accept=".pdf,.docx,.doc,.txt" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} className="hidden" />
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-brand-600/30 scale-110' : 'bg-dark-600/50'}`}>
                  <Upload size={28} className={dragging ? 'text-brand-400' : 'text-slate-500'} />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{dragging ? 'Drop your resume here' : 'Drag & drop your resume'}</h3>
                <p className="text-slate-500 text-sm font-body mb-4">or click to browse files</p>
                <div className="flex items-center justify-center gap-3">
                  {['PDF', 'DOCX', 'DOC', 'TXT'].map(t => <span key={t} className="tag text-xs">{t}</span>)}
                </div>
              </motion.div>
            ) : (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-600/20 flex items-center justify-center">
                  <FileText size={28} className="text-emerald-400" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-1">{file.name}</h3>
                <p className="text-slate-500 text-sm font-mono">{formatSize(file.size)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {file && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3 mt-4">
              <button onClick={handleUpload} disabled={loading} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Extracting Text...</> : <><CheckCircle size={16} /> Upload & Continue</>}
              </button>
              <button onClick={() => setFile(null)} disabled={loading} className="btn-secondary flex items-center gap-2"><X size={16} /> Remove</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="card flex gap-3">
            <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-display font-semibold text-white mb-1">Best Results</div>
              <div className="text-xs text-slate-500 font-body leading-relaxed">Use text-based PDF or DOCX for accurate extraction.</div>
            </div>
          </div>
          <div className="card flex gap-3">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-display font-semibold text-white mb-1">Strict Mode</div>
              <div className="text-xs text-slate-500 font-body leading-relaxed">Technical questions are generated ONLY from skills found in your resume.</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
