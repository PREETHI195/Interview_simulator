import { useEffect } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';

export default function CameraPanel() {
  const { videoRef, isActive, error, startCamera, stopCamera } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="relative bg-dark-900 aspect-video rounded-2xl overflow-hidden">
        {isActive ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            {error ? (
              <>
                <AlertCircle size={24} className="text-red-400" />
                <p className="text-xs text-red-400 font-body text-center px-4">{error}</p>
              </>
            ) : (
              <>
                <CameraOff size={24} className="text-slate-600" />
                <p className="text-xs text-slate-600 font-body">Camera offline</p>
              </>
            )}
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 glass px-2 py-1 rounded-full">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-[10px] font-mono text-slate-400">{isActive ? 'LIVE' : 'OFF'}</span>
        </div>

        {/* Face detected badge */}
        {isActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 glass px-2 py-1 rounded-full">
            <Camera size={10} className="text-brand-400" />
            <span className="text-[10px] font-mono text-slate-400">FACE ON</span>
          </div>
        )}
      </div>

      <div className="p-3 flex items-center justify-between">
        <span className="text-xs text-slate-600 font-body">Webcam feed</span>
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={`text-xs px-3 py-1.5 rounded-lg font-display font-medium transition-all ${
            isActive
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
              : 'bg-brand-600/10 text-brand-400 hover:bg-brand-600/20 border border-brand-500/20'
          }`}
        >
          {isActive ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
}
