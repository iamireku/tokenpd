
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../store';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  FastForward, 
  Timer, 
  Clock, 
  Radar, 
  Share2, 
  Play, 
  Gift, 
  Check,
  MonitorPlay
} from 'lucide-react';
import { triggerHaptic, formatTimeLeft, playFeedbackSound, playSignalSound } from '../utils';
import { Tooltip } from './Tooltip';

export const FocusMode: React.FC = () => {
  const { state, setView, claimApp, triggerLaunch, isProcessing, addToast, isPipActive, setPipActive } = useApp();
  const [now, setNow] = useState(Date.now());
  
  // Session States
  const [sessionAppsCleared, setSessionAppsCleared] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [liveDuration, setLiveDuration] = useState(0);

  // Audio Tracking
  const prevReadyCount = useRef<number>(0);

  // Post-Session Engagement States
  const [adProgress, setAdProgress] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  // PiP Browser Support Check
  const canUsePip = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  // Wake Lock Persistence
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      setLiveDuration(Math.floor((currentTime - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(heartbeat);
  }, [sessionStartTime]);

  // Global Signal Audio Alert Logic for Focus Mode
  useEffect(() => {
    const currentReadyCount = state.tasks.filter(t => t.nextDueAt <= now).length;
    if (currentReadyCount > prevReadyCount.current && state.hudAudioEnabled) {
      playSignalSound(state.soundProfile);
      triggerHaptic('medium');
    }
    prevReadyCount.current = currentReadyCount;
  }, [state.tasks, now, state.hudAudioEnabled, state.soundProfile]);

  // Screen Wake Lock API Implementation
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err: any) {
          console.warn(`[WakeLock] Failed: ${err.message}`);
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        });
      }
    };
  }, []);

  // Compute ready apps, sorting skipped ones to the back
  const readyApps = useMemo(() => {
    const apps = state.apps.filter(app => {
      const appTasks = state.tasks.filter(t => t.appId === app.id);
      return appTasks.some(t => t.nextDueAt <= now);
    });

    return [...apps].sort((a, b) => {
      const aSkipped = skippedIds.includes(a.id);
      const bSkipped = skippedIds.includes(b.id);
      if (aSkipped && !bSkipped) return 1;
      if (!aSkipped && bSkipped) return -1;
      return 0;
    });
  }, [state.apps, state.tasks, now, skippedIds]);

  const currentApp = readyApps[0];

  // Logic to find the next app in the queue (whether ready or not)
  const nextInQueue = useMemo(() => {
    const sortedByTime = [...state.apps].sort((a, b) => {
      const aMin = Math.min(...state.tasks.filter(t => t.appId === a.id).map(t => t.nextDueAt));
      const bMin = Math.min(...state.tasks.filter(t => t.appId === b.id).map(t => t.nextDueAt));
      return aMin - bMin;
    });

    if (currentApp) {
      // If we are looking at a ready app, the next in queue is the one after it in the ready list 
      // OR the first non-ready one if the ready list is exhausted.
      const readyIdx = readyApps.findIndex(a => a.id === currentApp.id);
      if (readyIdx < readyApps.length - 1) {
        return readyApps[readyIdx + 1];
      }
      
      // If we are on the last ready app, find the next overall app that isn't ready
      const overallIdx = sortedByTime.findIndex(a => a.id === currentApp.id);
      return sortedByTime[overallIdx + 1] || null;
    }

    // If standby (no ready apps), pick the first one in overall sorted list
    return sortedByTime[0] || null;
  }, [state.apps, state.tasks, readyApps, currentApp]);

  const nextDueTime = useMemo(() => {
    if (!nextInQueue) return 0;
    const taskTimes = state.tasks.filter(t => t.appId === nextInQueue.id).map(t => t.nextDueAt);
    return taskTimes.length > 0 ? Math.min(...taskTimes) : 0;
  }, [nextInQueue, state.tasks]);

  const handleClaim = async () => {
    if (!currentApp || isCalibrating || isProcessing) return;
    
    triggerHaptic('heavy');
    triggerLaunch(currentApp.name, currentApp.fallbackStoreUrl);
    
    setIsCalibrating(true);
    setCalibrationProgress(0);

    await claimApp(currentApp.id, 10000);

    const duration = 10000;
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setCalibrationProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setIsCalibrating(false);
        setSessionAppsCleared(prev => prev + 1);
        setSkippedIds(prev => prev.filter(id => id !== currentApp.id));
        triggerHaptic('success');
        playFeedbackSound('harvest');
      }
    }, interval);
  };

  const handleSkip = () => {
    if (!currentApp || isCalibrating) return;
    triggerHaptic('light');
    setSkippedIds(prev => [...prev, currentApp.id]);
    addToast(`${currentApp.name} Skipped`, "INFO");
  };

  const handleShareReferral = async () => {
    triggerHaptic('medium');
    const link = `${window.location.origin}?ref=${state.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TokenPod',
          text: `Track your mining cycles with TokenPod and get a 50P bonus using my code: ${state.referralCode}`,
          url: link
        });
      } catch (e) {
        navigator.clipboard.writeText(link);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(link);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    }
  };

  const handleStartAd = () => {
    if (isWatchingAd || adCompleted) return;
    setIsWatchingAd(true);
    triggerHaptic('medium');
    
    let current = 0;
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;

    const timer = setInterval(() => {
      current++;
      setAdProgress((current / steps) * 100);
      if (current >= steps) {
        clearInterval(timer);
        setIsWatchingAd(false);
        setAdCompleted(true);
        triggerHaptic('success');
        playFeedbackSound('harvest');
        addToast("Bonus Secured", "SUCCESS");
      }
    }, interval);
  };

  const formatSessionTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center p-6 z-[100] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-32">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(249,115,22,0.1),transparent_70%)]" />
        </div>

        <div className="w-full max-w-sm space-y-4 relative z-10 py-4">
          <header className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border-2 transition-all duration-700 bg-orange-500/10 border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]`}>
              <CheckCircle2 size={24} className="text-orange-500" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-tight">Sync Complete</h2>
          </header>

          <div className="bg-[#0b0e14] border-2 border-white/5 rounded-[1.5rem] p-4 shadow-2xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl space-y-1">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 block">Harvested</span>
                <p className="text-xl font-black text-orange-500 tabular-nums">{sessionAppsCleared}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl space-y-1 text-right">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 block">Duration</span>
                <p className="text-xl font-black text-white tabular-nums">{formatSessionTime(liveDuration)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-[#0b0e14] border border-white/10 rounded-[1.2rem] p-4 flex flex-col justify-between group active:scale-95 transition-all">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Share2 size={12} />
                    </div>
                    <span className="text-[8px] font-black text-white uppercase tracking-tight">+50P Bonus</span>
                </div>
                <button 
                  onClick={handleShareReferral}
                  className="w-full bg-[#2563eb] text-white py-2 rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg"
                >
                    {copyStatus ? <Check size={10} /> : <ArrowRight size={10} />}
                    {copyStatus ? 'COPIED' : 'SHARE'}
                </button>
             </div>

             <div className="bg-[#0b0e14] border border-white/10 rounded-[1.2rem] p-4 flex flex-col justify-between group active:scale-95 transition-all">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <Play size={12} fill="currentColor" />
                    </div>
                    <span className="text-[8px] font-black text-white uppercase tracking-tight">Daily Yield</span>
                </div>
                <button 
                  onClick={handleStartAd}
                  disabled={isWatchingAd || adCompleted}
                  className={`w-full py-2 rounded-lg font-black text-[7px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all relative overflow-hidden ${
                      adCompleted 
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
                      : 'bg-[#f97316] text-black shadow-lg shadow-orange-500/10'
                  }`}
                >
                  <div 
                      className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-75"
                      style={{ width: `${adProgress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-1.5">
                      {adCompleted ? <Check size={10} /> : isWatchingAd ? <Loader2 size={10} className="animate-spin" /> : <Gift size={10} />}
                      {adCompleted ? 'DONE' : isWatchingAd ? '...' : 'CLAIM'}
                  </span>
                </button>
             </div>
          </div>

          <button 
            onClick={() => { triggerHaptic('medium'); setView('DASHBOARD'); }}
            className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border-t border-white/20 mt-2"
          >
            Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col px-6 pt-10 pb-8 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06),transparent_70%)] transition-opacity duration-1000 ${isCalibrating || !currentApp ? 'opacity-100' : 'opacity-40'}`} />
      </div>

      {/* COMPACT HEADER */}
      <div className="relative z-10 flex items-center justify-between mb-8 px-2">
         <div className="flex items-center gap-4">
            {canUsePip && !isPipActive && (
              <button 
                onClick={() => { triggerHaptic('light'); setPipActive(true); }}
                className="p-1.5 text-slate-600 hover:text-orange-500 transition-colors active:scale-90"
                title="Overlay"
              >
                <MonitorPlay size={20} />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-orange-500 tracking-[0.2em] uppercase leading-none">Focus Active</span>
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">{formatSessionTime(liveDuration)}</span>
            </div>
         </div>
         
         <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-400 tabular-nums">{readyApps.length} READY</span>
            <div className="w-[1px] h-2 bg-white/10" />
            <span className="text-[8px] font-black text-orange-500 tabular-nums">{sessionAppsCleared} SECURED</span>
         </div>

         <button onClick={() => { triggerHaptic('medium'); setView('DASHBOARD'); }} className="p-1.5 text-slate-600 hover:text-white transition-colors">
            <X size={24} />
         </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <div className="w-full max-w-[300px]">
          {currentApp ? (
            <div key={currentApp.id} className="animate-in slide-in-from-right duration-500 ease-out">
               <div className="relative mx-auto mb-6 w-32 h-32">
                  <img src={currentApp.icon} className="w-full h-full rounded-[2rem] shadow-2xl border border-white/10 relative z-10 bg-black object-cover" alt="" />
                  <div className={`absolute -inset-4 bg-orange-500/15 blur-2xl -z-10 rounded-full transition-opacity duration-1000 ${isCalibrating ? 'opacity-100 scale-110' : 'opacity-40'}`} />
                  {isCalibrating && (
                    <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center p-4 border-2 border-orange-500/40">
                       <Loader2 size={24} className="text-orange-500 animate-spin mb-2" />
                       <div className="w-16 h-0.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: `${calibrationProgress}%` }} />
                       </div>
                    </div>
                  )}
               </div>
               <h3 className="text-xl font-black mb-6 tracking-tighter uppercase text-white truncate px-4 leading-none">{currentApp.name}</h3>
               <div className="space-y-2.5">
                 <button onClick={handleClaim} disabled={isCalibrating || isProcessing} className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-[0.98] transition-all transform uppercase tracking-tight border-t border-white/20 relative overflow-hidden ${isCalibrating ? 'bg-orange-950/20 text-orange-900 border-orange-900/10' : 'bg-orange-500 text-black shadow-orange-500/20'}`}>
                   <span className="relative z-10 flex items-center justify-center gap-2">{isCalibrating ? 'SYNCING...' : 'SECURE NOW'} <Zap size={16} fill={!isCalibrating ? "black" : "none"} /></span>
                 </button>
                 <button onClick={handleSkip} disabled={isCalibrating || isProcessing} className="w-full py-2.5 rounded-xl font-black text-[8px] text-slate-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:bg-white/5 transition-colors">Skip Harvest <FastForward size={10} /></button>
               </div>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-700 flex flex-col items-center">
              <div className="relative mb-6">
                 <div className="w-24 h-24 rounded-full bg-orange-500/5 flex items-center justify-center border-2 border-dashed border-orange-500/20"><Radar className="text-orange-500/60 animate-pulse" size={32} /></div>
                 <div className="absolute -inset-2 border border-orange-500 rounded-full animate-ping opacity-5" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Standby Mode</h3>
              <div className="space-y-2 w-full">
                <button onClick={() => setShowSummary(true)} className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">Finalize Session <CheckCircle2 size={14} /></button>
                <button onClick={() => setView('DASHBOARD')} className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors py-2">Return to Deck</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUEUE FOOTER - ALWAYS SHOWS THE NEXT TASK IN QUEUE */}
      <footer className="mt-auto py-4 relative z-10 flex flex-col items-center">
        {nextInQueue ? (
          <div className="bg-[#0b0e14] border border-white/5 rounded-2xl pl-1.5 pr-4 py-1.5 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-700 w-full max-w-[240px] shadow-2xl">
             <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shrink-0">
               <img src={nextInQueue.icon} className="w-full h-full object-cover grayscale opacity-50" alt="" />
             </div>
             <div className="text-left min-w-0 flex-1">
                <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest leading-tight">Next Task</p>
                <h4 className="text-[9px] font-black text-white/80 uppercase tracking-tight truncate leading-tight">{nextInQueue.name}</h4>
             </div>
             <div className="text-right shrink-0">
                <span className={`text-[8px] font-mono font-black tabular-nums ${nextDueTime <= now ? 'text-orange-500' : 'text-slate-500'}`}>
                  {nextDueTime <= now ? 'READY' : formatTimeLeft(nextDueTime - now)}
                </span>
             </div>
          </div>
        ) : (
          <p className="text-[7px] font-black text-slate-800 uppercase tracking-[0.2em]">End of Signal Chain</p>
        )}
      </footer>
    </div>
  );
};
