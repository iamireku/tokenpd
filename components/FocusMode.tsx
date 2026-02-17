
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
  PlayCircle, 
  Star, 
  Clock, 
  Radar, 
  Share2, 
  Play, 
  Gift, 
  Copy, 
  Check 
} from 'lucide-react';
import { triggerHaptic, hasPremiumBenefits, formatTimeLeft, playFeedbackSound } from '../utils';

export const FocusMode: React.FC = () => {
  const { state, setView, claimApp, triggerLaunch, isProcessing, addToast } = useApp();
  const [now, setNow] = useState(Date.now());
  
  // Session States
  const [sessionAppsCleared, setSessionAppsCleared] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [liveDuration, setLiveDuration] = useState(0);

  // Post-Session Engagement States
  const [adProgress, setAdProgress] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  // Wake Lock Persistence
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      setLiveDuration(Math.floor((currentTime - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

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

  // Find the next upcoming app if queue is empty
  const upcomingApp = useMemo(() => {
    if (readyApps.length > 0) return null;
    const sortedUpcoming = [...state.apps].sort((a, b) => {
      const aMin = Math.min(...state.tasks.filter(t => t.appId === a.id).map(t => t.nextDueAt));
      const bMin = Math.min(...state.tasks.filter(t => t.appId === b.id).map(t => t.nextDueAt));
      return aMin - bMin;
    });
    return sortedUpcoming[0];
  }, [state.apps, state.tasks, readyApps.length]);

  const nextDueTime = useMemo(() => {
    if (!upcomingApp) return 0;
    const taskTimes = state.tasks.filter(t => t.appId === upcomingApp.id).map(t => t.nextDueAt);
    return taskTimes.length > 0 ? Math.min(...taskTimes) : 0;
  }, [upcomingApp, state.tasks]);

  const currentApp = readyApps[0];
  const nextApp = readyApps[1];
  
  // Safe SPM Calc (Signals Per Minute)
  const spm = liveDuration > 5 ? ((sessionAppsCleared / liveDuration) * 60).toFixed(1) : '0.0';

  const handleClaim = async () => {
    if (!currentApp || isCalibrating || isProcessing) return;
    
    triggerHaptic('heavy');
    setIsCalibrating(true);
    setCalibrationProgress(0);

    // Anchor: 10s offset ensures server and client finish sync simultaneously
    await claimApp(currentApp.id, 10000);
    triggerLaunch(currentApp.name, currentApp.fallbackStoreUrl);

    // Visualizer (10s)
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
      <div className="fixed inset-0 bg-black flex flex-col items-center p-8 z-[100] animate-in fade-in duration-500 overflow-y-auto hide-scrollbar pb-32">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(249,115,22,0.1),transparent_70%)]" />
        </div>

        <div className="w-full max-w-sm space-y-6 relative z-10 py-10">
          <header className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 transition-all duration-700 bg-orange-500/10 border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]`}>
              <CheckCircle2 size={40} className="text-orange-500" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Sync<br/><span className='text-orange-500'>Completed</span></h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Harvest Summary</p>
          </header>

          {/* Performance Stats Card */}
          <div className="bg-[#0b0e14] border-2 border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Duration</span>
                <p className="text-2xl font-black text-white tabular-nums">{formatSessionTime(liveDuration)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Collected</span>
                <p className={`text-2xl font-black tabular-nums text-orange-500`}>
                  {sessionAppsCleared}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sync Speed</span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest tabular-nums">{spm} SPM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Signal Health</span>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">OPTIMAL</span>
              </div>
            </div>
          </div>

          {/* Reward Options Section */}
          <div className="space-y-4 pt-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">Extra Rewards</h3>
             
             {/* Referral Card */}
             <div className="bg-[#0b0e14] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] -rotate-12 group-hover:scale-110 transition-transform">
                   <Share2 size={100} />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                         <Share2 size={20} />
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-white uppercase tracking-tight">Invite Friends</h4>
                         <p className="text-[8px] font-black text-slate-500 uppercase">Get +50P for every friend</p>
                      </div>
                   </div>
                   <button 
                    onClick={handleShareReferral}
                    className="w-full bg-[#2563eb] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                   >
                     {copyStatus ? <Check size={14} /> : <Share2 size={14} />}
                     {copyStatus ? 'LINK COPIED' : 'SHARE MY LINK'}
                   </button>
                </div>
             </div>

             {/* Ad Reward Card */}
             <div className="bg-[#0b0e14] border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform">
                   <Gift size={100} />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                         <Play size={20} fill="currentColor" />
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-white uppercase tracking-tight">Extra Points</h4>
                         <p className="text-[8px] font-black text-slate-500 uppercase">Watch ad for points bonus</p>
                      </div>
                   </div>
                   
                   <div className="relative">
                      <button 
                        onClick={handleStartAd}
                        disabled={isWatchingAd || adCompleted}
                        className={`w-full py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                          adCompleted 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
                            : 'bg-[#f97316] text-black active:scale-95 shadow-lg shadow-orange-500/10'
                        }`}
                      >
                        <div 
                          className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-75"
                          style={{ width: `${adProgress}%` }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                           {adCompleted ? <Check size={14} /> : isWatchingAd ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
                           {adCompleted ? 'BONUS COLLECTED' : isWatchingAd ? 'CONNECTING...' : 'WATCH AD FOR POINTS'}
                        </span>
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] p-4 text-center mt-6">
             <p className="text-[8px] font-bold text-blue-400 uppercase leading-relaxed tracking-tight">
               Focus sessions align your timers for maximum streaks. Referral points are verified after sign-up.
             </p>
          </div>

          <button 
            onClick={() => { triggerHaptic('medium'); setView('DASHBOARD'); }}
            className="w-full bg-white text-black py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border-t border-white/20 mt-8"
          >
            Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col p-8 pt-16 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_70%)] transition-opacity duration-1000 ${isCalibrating || !currentApp ? 'opacity-100' : 'opacity-40'}`} />
        {(isCalibrating || !currentApp) && (
          <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
        )}
      </div>

      <button onClick={() => { triggerHaptic('medium'); setView('DASHBOARD'); }} className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors z-[110]"><X size={32} /></button>

      <div className="relative z-10 w-full max-w-sm mx-auto mb-10">
        <div className="flex justify-between items-end mb-3 px-1">
          <div className="space-y-1">
            <h2 className="text-[11px] font-black text-orange-500 tracking-[0.2em] uppercase flex items-center gap-2"><Timer size={12} /> Focus Session</h2>
            <div className="flex items-center gap-3">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{readyApps.length} Signals Ready</p>
              <div className="w-1 h-1 rounded-full bg-slate-800" />
              <div className="flex items-center gap-1.5"><Clock size={8} className="text-slate-500" /><span className="text-[8px] font-mono font-black text-slate-400 tabular-nums">{formatSessionTime(liveDuration)}</span></div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black text-white tabular-nums">{sessionAppsCleared} SECURED</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <div className={`h-full transition-all duration-700 shadow-[0_0_15px_rgba(249,115,22,0.5)] rounded-full ${readyApps.length > 0 ? 'bg-orange-500' : 'bg-slate-700'}`} style={{ width: `${(sessionAppsCleared / (readyApps.length + sessionAppsCleared || 1)) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <div className="w-full max-sm:max-w-sm">
          {currentApp ? (
            <div key={currentApp.id} className="animate-in slide-in-from-right duration-500 ease-out">
               <div className="relative mx-auto mb-10 w-56 h-56">
                  <img src={currentApp.icon} className="w-full h-full rounded-[3.5rem] shadow-2xl border border-white/10 relative z-10 bg-black object-cover" alt="" />
                  <div className={`absolute -inset-6 bg-orange-500/20 blur-3xl -z-10 rounded-full transition-opacity duration-1000 ${isCalibrating ? 'opacity-100 scale-110' : 'opacity-40'}`} />
                  {isCalibrating && (
                    <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-md rounded-[3.5rem] flex flex-col items-center justify-center p-8 border-2 border-orange-500/50">
                       <Loader2 size={40} className="text-orange-500 animate-spin mb-4" />
                       <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Connecting...</p>
                       <div className="w-32 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                          <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: `${calibrationProgress}%` }} />
                       </div>
                    </div>
                  )}
               </div>
               <h3 className="text-4xl font-black mb-10 tracking-tighter uppercase text-white">{currentApp.name}</h3>
               <div className="space-y-4">
                 <button onClick={handleClaim} disabled={isCalibrating || isProcessing} className={`w-full py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl active:scale-95 transition-all transform uppercase tracking-tighter border-t border-white/20 relative overflow-hidden group ${isCalibrating ? 'bg-orange-950/20 text-orange-900 border-orange-900/20' : 'bg-orange-500 text-black shadow-orange-500/30'}`}>
                   <span className="relative z-10 flex items-center justify-center gap-3">{isCalibrating ? 'SYNCING...' : 'SECURE NOW'} <Zap size={24} fill={!isCalibrating ? "black" : "none"} /></span>
                 </button>
                 <button onClick={handleSkip} disabled={isCalibrating || isProcessing} className="w-full py-4 rounded-[1.5rem] font-black text-[10px] text-slate-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2 active:bg-white/5 transition-colors">Skip Signal <FastForward size={14} /></button>
               </div>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-700 flex flex-col items-center">
              <div className="relative mb-12">
                 <div className="w-40 h-40 rounded-full bg-orange-500/10 flex items-center justify-center border-2 border-dashed border-orange-500/30"><Radar className="text-orange-500 animate-pulse" size={64} /></div>
                 <div className="absolute -inset-4 border-2 border-orange-500 rounded-full animate-ping opacity-5" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Signal Standby</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12">Waiting for next harvest window</p>
              {upcomingApp && (
                <div className="w-full max-w-[280px] bg-[#0b0e14] border border-white/5 rounded-[2rem] p-6 mb-12">
                   <div className="flex items-center gap-4 mb-4">
                      <img src={upcomingApp.icon} className="w-12 h-12 rounded-2xl grayscale opacity-50" alt="" />
                      <div className="text-left"><p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Next Signal From</p><h4 className="text-[11px] font-black text-white uppercase truncate w-32">{upcomingApp.name}</h4></div>
                   </div>
                   <div className="flex items-center justify-between text-orange-500"><span className="text-[8px] font-black uppercase tracking-widest">ETA</span><span className="text-xs font-mono font-black tabular-nums">{formatTimeLeft(nextDueTime - now)}</span></div>
                </div>
              )}
              <div className="space-y-4 w-full">
                <button onClick={() => setShowSummary(true)} className="w-full py-6 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">Complete Sync <CheckCircle2 size={18} /></button>
                <button onClick={() => setView('DASHBOARD')} className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-white transition-colors">Return to Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="mt-auto py-10 relative z-10 flex flex-col items-center min-h-[100px]">
        {nextApp ? (
          <div className="bg-[#0b0e14] border border-white/5 rounded-full pl-2 pr-6 py-2 flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-700">
             <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10"><img src={nextApp.icon} className="w-full h-full object-cover grayscale opacity-50" alt="" /></div>
             <div className="text-left"><p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Next Signal</p><h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">{nextApp.name}</h4></div>
          </div>
        ) : currentApp ? (
          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">Final Signal in Queue</p>
        ) : null}
      </footer>
    </div>
  );
};
