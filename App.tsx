import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { AppProvider, useApp } from './store';
import { GlassDock } from './components/GlassDock';
import { Dashboard } from './components/Dashboard';
import { CreatePod as CreateApp } from './components/CreatePod';
import { GrowthLab } from './components/GrowthLab';
import { Settings } from './components/Settings';
import { FocusMode } from './components/FocusMode';
import { PointsEconomy } from './components/PointsEconomy';
import { ProtocolAcademy } from './components/ProtocolAcademy';
import { ContactCenter } from './components/ContactCenter';
import { AdminDashboard, AdminAuth } from './Admin';
import { Logo } from './components/Logo';
import { PublicLanding } from './components/PublicLanding';
import { FloatingPortal } from './components/FloatingPortal';
import { 
  Terminal, 
  CheckCircle2,
  XCircle,
  Info,
  Fingerprint,
  Construction,
  AlertTriangle,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { LifestyleRank, Theme, Toast } from './types';
import { triggerHaptic } from './utils';

/**
 * Enhanced Rolling Number for Point "Tick" animation
 */
export const RollingNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === prevValue.current) return;
    const diff = value - prevValue.current;
    const duration = 800;
    const steps = 20;
    const increment = diff / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayValue(Math.floor(prevValue.current + increment * currentStep));
      if (currentStep >= steps) {
        setDisplayValue(value);
        prevValue.current = value;
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

/**
 * SwipeableToast: Handles the gesture logic for dismissing individual toasts
 */
const SwipeableToast: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const startXRef = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const DISMISS_THRESHOLD = 100;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDismissing) return;
    startXRef.current = e.clientX;
    setIsDragging(true);
    if (elementRef.current) {
      elementRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isDismissing) return;
    const currentX = e.clientX;
    const diff = currentX - startXRef.current;
    setDragX(diff);
  };

  const handlePointerUp = () => {
    if (!isDragging || isDismissing) return;
    setIsDragging(false);

    if (Math.abs(dragX) > DISMISS_THRESHOLD) {
      triggerHaptic('light');
      setIsDismissing(true);
      // Animate off screen then remove
      setDragX(dragX > 0 ? window.innerWidth : -window.innerWidth);
      setTimeout(() => onRemove(toast.id), 200);
    } else {
      setDragX(0);
    }
  };

  const opacity = Math.max(0, 1 - Math.abs(dragX) / (DISMISS_THRESHOLD * 2));

  return (
    <div 
      ref={elementRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ 
        transform: `translateX(${dragX}px)`, 
        opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        touchAction: 'none'
      }}
      className={`pointer-events-auto flex items-center justify-between gap-4 px-6 py-4 rounded-[1.5rem] glass-dock-light border-2 animate-in slide-in-from-top duration-300 shadow-xl w-full max-w-sm cursor-grab active:cursor-grabbing ${toast.type === 'SUCCESS' ? 'border-green-500/20' : toast.type === 'ERROR' ? 'border-red-500/20' : 'border-theme-primary/20'}`}
    >
      <div className="flex items-center gap-3 select-none pointer-events-none">
        <div className={`p-1.5 rounded-lg shrink-0 ${toast.type === 'SUCCESS' ? 'bg-green-500 text-white' : toast.type === 'ERROR' ? 'bg-red-500 text-white' : 'bg-theme-primary text-theme-contrast'}`}>
          {toast.type === 'SUCCESS' ? <CheckCircle2 size={16} /> : toast.type === 'ERROR' ? <XCircle size={16} /> : <Info size={16} />}
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-theme-main uppercase tracking-tight">
            {toast.message} {toast.count && toast.count > 1 ? `(${toast.count})` : ''}
          </span>
        </div>
      </div>
      {toast.action && (
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={toast.action.onClick}
          className="bg-theme-main text-theme-card px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1.5"
        >
          <RotateCcw size={10} /> {toast.action.label}
        </button>
      )}
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  
  return (
    <div className="fixed top-6 left-0 right-0 z-[5000] px-6 pointer-events-none flex flex-col items-center gap-3">
      {toasts.map((toast) => (
        <SwipeableToast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const Main: React.FC = () => {
  const { view, setView, state, onboard, launchingAppName, isSyncing, isAuthenticating, triggerSecretTap, isProcessing, forceSync, dispatch, addToast, isPipActive, setPipActive, isInstalled } = useApp();
  const [onboardStep, setOnboardStep] = useState<'START' | 'LOGIN' | 'SYNC'>('START');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  const [bootProgress, setBootProgress] = useState(0);
  const [isLocalBooting, setIsLocalBooting] = useState(false);
  const [isSystemDark, setIsSystemDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = useMemo(() => {
    if (state.theme === Theme.SYSTEM) return isSystemDark;
    return state.theme === Theme.DARK;
  }, [state.theme, isSystemDark]);

  const themeClass = isDark ? 'theme-dark' : 'theme-light';
  const rankClass = state.rank === LifestyleRank.VISIONARY ? 'rank-visionary' : 
                   state.rank === LifestyleRank.ELITE ? 'rank-elite' : 
                   state.rank === LifestyleRank.PRO ? 'rank-pro' : '';

  useEffect(() => {
    document.body.className = themeClass;
  }, [themeClass]);

  /**
   * NATIVE BADGING SYNC
   * Synchronizes the count of READY signals with the home screen icon badge.
   */
  useEffect(() => {
    if (!state.isInitialized) return;

    const updateBadge = () => {
      const now = Date.now();
      const readyCount = state.tasks.filter(t => t.nextDueAt <= now).length;

      if ('setAppBadge' in navigator) {
        if (readyCount > 0) {
          (navigator as any).setAppBadge(readyCount).catch(() => {});
        } else {
          (navigator as any).clearAppBadge().catch(() => {});
        }
      }
    };

    updateBadge();
    const interval = setInterval(updateBadge, 10000); // Check every 10s while app is open
    return () => clearInterval(interval);
  }, [state.tasks, state.isInitialized]);

  // URL Parameter Routing for Admin Access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === 'terminal') {
      triggerHaptic('heavy');
      setView('ADMIN_AUTH');
      addToast("Administrative Uplink Detected", "INFO");
      // Clean URL without refreshing to hide the param
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [setView, addToast]);

  useEffect(() => {
    if (state.isInitialized && !state.isMaintenanceMode) {
      const syncInterval = setInterval(() => forceSync(), 30000);
      return () => clearInterval(syncInterval);
    }
  }, [state.isInitialized, state.isMaintenanceMode, forceSync]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      dispatch({ type: 'SET_INSTALL_PROMPT', prompt: e });
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [dispatch]);

  useEffect(() => {
    if (state.isInitialized && onboardStep !== 'SYNC') {
      setIsLocalBooting(true);
      const duration = 600;
      const steps = 30;
      let current = 0;
      const timer = setInterval(() => {
        current++;
        setBootProgress((current / steps) * 100);
        if (current >= steps) { 
          clearInterval(timer); 
          setTimeout(() => setIsLocalBooting(false), 100); 
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [state.isInitialized, onboardStep]);

  const handleRegister = async (nick: string, pass: string, referral?: string) => {
    const success = await onboard(nick, pass, 'REGISTER', referral);
    if (success) {
      triggerHaptic('success');
      setOnboardStep('SYNC');
    }
  };

  const handleLogin = async () => {
    const success = await onboard(nickname, pin, 'LOGIN');
    if (success) {
      triggerHaptic('success');
      setOnboardStep('SYNC');
    } else {
      triggerHaptic('error');
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  const isAdminView = view === 'ADMIN' || view === 'ADMIN_AUTH';
  const isContactView = view === 'CONTACT';
  const isGuideView = view === 'GUIDE';
  const isSyncingStep = onboardStep === 'SYNC';
  const isUninitialized = !state.isInitialized;

  if (state.isMaintenanceMode && !isAdminView) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center z-[6000] bg-theme-main p-10 text-center ${themeClass}`}>
         <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 select-none">
            <Construction size={48} className="text-red-500 animate-bounce" />
         </div>
         <h1 className="text-theme-main font-black text-3xl uppercase tracking-tighter mb-4">Down for Tuning</h1>
         <p className="text-theme-muted font-bold text-[11px] leading-relaxed mb-10 max-w-xs mx-auto uppercase tracking-tight">
           TokenPod is currently undergoing routine maintenance. Access will be restored shortly.
         </p>
         <div className="bg-theme-card p-4 rounded-2xl border border-theme flex items-center gap-3 text-red-600 shadow-sm">
            <AlertTriangle size={16} />
            <span className="text-[8px] font-black uppercase tracking-widest">Earning features suspended</span>
         </div>
      </div>
    );
  }

  if (isLocalBooting && state.isInitialized && !isAdminView && !isSyncingStep) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center z-[5000] bg-theme-main ${themeClass}`}>
        <div className="mb-12"><Logo size={100} strokeColor="var(--primary)" /></div>
        <div className="text-center space-y-4">
          <h2 className="text-theme-main font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Syncing...</h2>
          <div className="w-48 h-1 bg-theme-muted/10 rounded-full overflow-hidden border border-theme/30">
            <div className="h-full bg-theme-primary transition-all duration-150" style={{ width: `${bootProgress}%` }} />
          </div>
        </div>
      </div>
    );
  }

  const inputThemeClasses = isDark
    ? 'bg-black text-white border-white'
    : 'bg-white text-black border-black';

  return (
    <div className={`min-h-screen relative bg-theme-main overflow-x-hidden ${themeClass} ${rankClass} ${isProcessing ? 'cursor-wait select-none' : ''}`}>
      <div className={`fixed inset-0 pointer-events-none -z-10 opacity-40 transition-opacity duration-1000`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.1),transparent_70%)]" />
      </div>

      <ToastContainer />

      {/* Post-Installation Success View (Easy Tech-English) */}
      {state.isNewlyInstalled && !isInstalled && (
        <div className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border-2 border-green-500/20 shadow-xl">
              <CheckCircle2 size={48} className="text-green-500 animate-bounce" />
           </div>
           <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">App Installed</h1>
           <p className="text-[10px] font-black text-theme-primary uppercase tracking-[0.3em] mb-8">Home Screen Ready</p>
           <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 mb-10 max-w-xs">
              <p className="text-[11px] font-bold text-slate-600 uppercase leading-relaxed">
                TokenPod is now synced to your device. You can close this browser tab and open the app from your home screen for full features and faster syncing.
              </p>
           </div>
           <button 
             onClick={() => dispatch({ type: 'SET_NEWLY_INSTALLED', status: false })}
             className="w-full max-w-xs bg-theme-primary text-theme-contrast py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
           >
             Launch From Home Screen
           </button>
        </div>
      )}

      {/* Global Signal Overlay Container */}
      {isPipActive && <FloatingPortal onClose={() => setPipActive(false)} />}

      <div className={`max-w-2xl mx-auto min-h-screen relative transition-all duration-500 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
        {isAdminView ? (
          <>
            {view === 'ADMIN' && <AdminDashboard />}
            {view === 'ADMIN_AUTH' && <AdminAuth />}
          </>
        ) : isContactView ? (
          <ContactCenter />
        ) : isGuideView ? (
          <ProtocolAcademy />
        ) : isUninitialized || isSyncingStep ? (
          <div className="min-h-screen">
            {onboardStep === 'START' && (
              <PublicLanding 
                onRegister={handleRegister}
                onLogin={() => setOnboardStep('LOGIN')}
                onViewGuide={() => setView('GUIDE')}
                isProcessing={isAuthenticating}
              />
            )}

            {onboardStep === 'LOGIN' && (
              <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center p-8 animate-in slide-in-from-right duration-300">
                <div className="w-full max-sm:max-w-sm space-y-8">
                  <header className="flex items-center gap-4 mb-8">
                     <button onClick={() => setOnboardStep('START')} className="p-2 bg-theme-card rounded-xl text-theme-muted border border-theme" disabled={isProcessing}>
                        <ArrowLeft size={20} />
                     </button>
                     <div>
                        <h2 className="text-2xl font-black text-theme-main tracking-tighter uppercase">Sign In</h2>
                        <p className="text-[9px] font-black text-theme-primary tracking-[0.2em] uppercase">Access Account</p>
                     </div>
                  </header>

                  <div className={`bg-theme-card rounded-[3rem] p-8 border border-theme space-y-6 shadow-xl transition-all ${pinError ? 'animate-shake border-red-500 shadow-red-500/20' : ''}`}>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-theme-muted ml-4 tracking-widest uppercase">Nickname</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                        <input 
                          type="text" 
                          value={nickname} 
                          onChange={e => setNickname(e.target.value.toUpperCase())} 
                          placeholder="NICKNAME" 
                          disabled={isProcessing} 
                          className={`w-full border rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-theme-primary transition-all disabled:opacity-50 font-bold text-[11px] ${inputThemeClasses}`} 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-theme-muted ml-4 tracking-widest uppercase">4-Digit PIN</label>
                      <div className="relative">
                        <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                        <input 
                          type={showPin ? "text" : "password"} 
                          maxLength={4} 
                          value={pin} 
                          onChange={e => setPin(e.target.value.replace(/\D/g,''))} 
                          placeholder="****" 
                          disabled={isProcessing} 
                          className={`w-full border rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-theme-primary transition-all disabled:opacity-50 text-center text-3xl font-bold tracking-[0.8em] ${inputThemeClasses} ${pinError ? 'text-red-500' : ''}`} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPin(!showPin)} 
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-theme-muted"
                        >
                          {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <button disabled={!nickname || pin.length < 4 || isProcessing} onClick={handleLogin} className="w-full bg-theme-primary text-theme-contrast py-5 rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl disabled:opacity-30 transition-all flex items-center justify-center gap-2 border-t border-white/20 disabled:pointer-events-none">
                      {isProcessing ? 'SYNCING...' : 'Enter Dashboard'} <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {onboardStep === 'SYNC' && (
              <div className="min-h-screen bg-theme-main animate-in zoom-in duration-300 flex flex-col items-center justify-center py-20 text-center p-8">
                 <div className="relative mb-12">
                    <div className="w-28 h-28 bg-theme-primary/10 rounded-full flex items-center justify-center border-2 border-dashed border-theme-primary/30">
                       <Terminal className="text-theme-primary animate-pulse" size={48} />
                    </div>
                    <div className="absolute -inset-4 border-2 border-theme-primary rounded-full animate-ping opacity-10" />
                 </div>
                 <h3 className="text-xl font-black text-theme-main tracking-tighter uppercase mb-2">Ready</h3>
                 <p className="text-[10px] font-black text-theme-primary tracking-[0.4em] uppercase mb-12">Fast Sync Complete</p>
                 <button 
                  onClick={() => { triggerHaptic('medium'); setOnboardStep('START'); setView('DASHBOARD'); }} 
                  className="w-full max-w-xs bg-theme-primary text-theme-contrast py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all border-t border-white/20"
                 >
                   Open Dashboard
                 </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {view === 'DASHBOARD' && <Dashboard />}
            {view === 'CREATE' && <CreateApp />}
            {view === 'LAB' && <GrowthLab />}
            {view === 'SETTINGS' && <Settings />}
            {view === 'FOCUS' && <FocusMode />}
            {view === 'ECONOMY' && <PointsEconomy />}
            {['DASHBOARD', 'LAB', 'SETTINGS'].includes(view) && <GlassDock />}
          </>
        )}
      </div>

      {launchingAppName && (
        <div className="fixed inset-0 z-[1000] bg-theme-main/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="relative mb-12">
              <div className="w-32 h-32 bg-theme-card rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl relative z-10 border border-[var(--primary)]/20">
                <img src={state.apps.find(p => p.name === launchingAppName)?.icon} className="w-full h-full object-cover" alt="" />
              </div>
              {/* Pulsing ring simulation */}
              <div className="absolute -inset-6 border-2 border-[var(--primary)]/30 rounded-[3.5rem] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />
              <div className="absolute -inset-10 border border-[var(--primary)]/10 rounded-[4rem] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" />
           </div>

           <div className="text-center space-y-6 w-full max-w-[240px]">
              <div>
                <h2 className="text-theme-primary font-black text-[10px] tracking-[0.4em] uppercase mb-2 flex items-center justify-center gap-2">
                  <Cpu size={12} className="animate-pulse" /> Scanning Signal
                </h2>
                <h1 className="text-theme-main font-black text-3xl tracking-tighter uppercase leading-none">{launchingAppName}</h1>
              </div>

              {/* SIMULATION PROGRESS BAR */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-theme-main border border-theme/30 rounded-full overflow-hidden p-[1px]">
                  <div className="h-full bg-theme-primary rounded-full animate-[launchProgress_1s_linear_forwards] shadow-[0_0_15px_var(--primary-glow)]" />
                </div>
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[7px] font-black uppercase tracking-widest">Handshake</span>
                  <span className="text-[7px] font-black uppercase tracking-widest">100%</span>
                </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes launchProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}