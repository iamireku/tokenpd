
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Terminal, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Fingerprint, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  ChevronLeft,
  LayoutGrid,
  TrendingUp,
  Lock,
  Smartphone,
  Check,
  User,
  Tag,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';
import { triggerHaptic } from '../utils';
import { useHoldToConfirm } from '../hooks/useHoldToConfirm';
import { useApp } from '../store';
import { Theme } from '../types';

interface OnboardingProps {
  onComplete: (nick: string, pin: string, ref?: string) => void;
  onBack: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const { isProcessing, setView, state } = useApp();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [ref, setRef] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
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

  const [demoProgress, setDemoProgress] = useState(0);
  const [demoStatus, setDemoStatus] = useState<'SCANNING' | 'READY' | 'CLAIMED'>('SCANNING');

  useEffect(() => {
    if (step === 2 && demoStatus === 'SCANNING') {
      const interval = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setDemoStatus('READY');
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step, demoStatus]);

  const handleDemoClaim = () => {
    if (demoStatus !== 'READY') return;
    triggerHaptic('heavy');
    setDemoStatus('CLAIMED');
    setTimeout(() => {
      setStep(3);
    }, 1000);
  };

  const { holdProgress, handleStart, handleEnd } = useHoldToConfirm(() => {
    triggerHaptic('heavy');
    setStep(4);
  }, 1500);

  const pinsMatch = pin === confirmPin;
  const isFormReady = nickname.length >= 2 && pin.length === 4 && pinsMatch;

  const handleFinalize = () => {
    if (!isFormReady) return;
    triggerHaptic('heavy');
    onComplete(nickname, pin, ref);
  };

  const inputThemeClasses = isDark
    ? 'bg-black text-white border-white'
    : 'bg-white text-black border-black';

  return (
    <div className="min-h-screen bg-theme-main text-theme-main flex flex-col p-8 pt-16 selection:bg-theme-primary/30 overflow-x-hidden">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => step > 1 ? setStep((step - 1) as any) : onBack()} 
            className="p-2 bg-theme-card border border-theme rounded-xl text-theme-muted hover:text-theme-primary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-theme-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-theme-muted">
              System v6.9 | Phase 0{step}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-6 bg-theme-primary' : 'w-2 bg-theme-card'}`} />
          ))}
        </div>
      </header>

      {step === 1 && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
          <div className="mb-12 flex justify-start">
            <div className="w-20 h-20 bg-theme-primary/10 rounded-[2rem] flex items-center justify-center border-2 border-theme-primary/20 shadow-xl">
               <Info className="text-theme-primary" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-6 uppercase leading-tight text-theme-main">
            Smart<br/><span className="text-theme-primary">Harvesting.</span>
          </h1>
          <p className="text-theme-muted font-bold text-[13px] leading-relaxed mb-10 uppercase tracking-tight">
            TokenPod is your primary dashboard for managing reward cycles. Securely track app timers and streaks via our high-speed cloud.
          </p>
          
          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-theme-card flex items-center justify-center text-theme-primary border border-theme">
                <Zap size={18} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Real-time Sync</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-theme-card flex items-center justify-center text-theme-primary border border-theme">
                <ShieldCheck size={18} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Verified Apps</p>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <button onClick={() => { triggerHaptic('light'); setStep(2); }} className="w-full bg-theme-primary text-theme-contrast py-6 rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
              Initialize Vault <ArrowRight size={18} />
            </button>
            <button onClick={() => { triggerHaptic('light'); setView('GUIDE'); }} className="w-full bg-theme-card border border-theme text-theme-muted py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:text-theme-main transition-all">
              View App Guide
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
          <h2 className="text-3xl font-black tracking-tighter mb-4 uppercase">Hyper-Sync</h2>
          <p className="text-[10px] font-black text-theme-primary uppercase tracking-[0.3em] mb-12">Interactive Simulation</p>
          
          <div className="bg-theme-card border border-theme rounded-[2.5rem] p-8 mb-12 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                <Zap size={150} />
             </div>
             
             <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-theme-main rounded-2xl flex items-center justify-center border border-theme shadow-lg">
                   <div className="w-full h-full bg-gradient-to-br from-theme-primary to-red-600 flex items-center justify-center text-theme-contrast font-black text-xl">TP</div>
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase tracking-tight text-theme-main">Earning Pod</h3>
                   <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">
                      {demoStatus === 'SCANNING' ? 'SCANNING SIGNALS...' : demoStatus === 'READY' ? 'SIGNAL ACQUIRED' : 'DATA SYNCED'}
                   </p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="h-2 w-full bg-theme-main rounded-full overflow-hidden border border-theme">
                   <div 
                     className="h-full bg-theme-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-300" 
                     style={{ width: `${demoProgress}%` }} 
                   />
                </div>
                <button 
                  onClick={handleDemoClaim}
                  disabled={demoStatus !== 'READY'}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    demoStatus === 'READY' 
                      ? 'bg-theme-primary text-theme-contrast shadow-xl active:scale-95' 
                      : demoStatus === 'CLAIMED' 
                        ? 'bg-green-500/20 text-green-500 border border-green-500/20' 
                        : 'bg-theme-main text-theme-muted/20'
                  }`}
                >
                  {demoStatus === 'CLAIMED' ? 'REWARD SECURED' : demoStatus === 'READY' ? 'HARVEST NOW' : 'WAITING...'}
                </button>
             </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6 flex items-start gap-4">
             <Info className="text-orange-500 shrink-0" size={16} />
             <p className="text-[9px] font-bold text-theme-muted uppercase leading-relaxed tracking-tight">
               TokenPod detects harvest windows across your apps. When a timer hits zero, it turns orange and moves to your priority queue.
             </p>
          </div>

          <div className="mt-auto">
            <button onClick={() => setStep(3)} className="w-full bg-theme-contrast text-theme-primary py-5 rounded-3xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all">
              Continue Setup
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
          <div className="mb-12">
            <ShieldCheck className="text-theme-primary" size={48} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-4 uppercase text-theme-main">Usage Agreement</h2>
          <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.3em] mb-12">Security & Privacy Rules</p>
          
          <div className="space-y-6 mb-12">
            <div className="bg-theme-card border border-theme rounded-[2rem] p-6 space-y-6">
               <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-theme-primary/10 flex items-center justify-center text-theme-primary shrink-0"><Check size={16} /></div>
                  <p className="text-[10px] font-bold text-theme-muted uppercase leading-relaxed">No emails, passwords, or personal keys required.</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-theme-primary/10 flex items-center justify-center text-theme-primary shrink-0"><ShieldAlert size={16} /></div>
                  <p className="text-[10px] font-bold text-theme-muted uppercase leading-relaxed">I will perform my own research (DYOR) on external apps.</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-theme-primary/10 flex items-center justify-center text-theme-primary shrink-0"><Check size={16} /></div>
                  <p className="text-[10px] font-bold text-theme-muted uppercase leading-relaxed">Secure cloud architecture with zero behavioral tracking.</p>
               </div>
            </div>
            <p className="text-[8px] font-bold text-theme-muted uppercase tracking-widest text-center px-4 opacity-50">
              By confirming, you agree to the privacy manifesto and system rules.
            </p>
          </div>

          <div className="mt-auto">
            <button 
              onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
              onTouchStart={handleStart} onTouchEnd={handleEnd}
              className="w-full relative overflow-hidden bg-theme-primary text-theme-contrast py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-theme-contrast/30" style={{ width: `${holdProgress}%` }} />
              <span className="relative z-10">
                {holdProgress > 0 ? `AGREEING ${Math.round(holdProgress)}%` : 'Hold to Agree'}
              </span>
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
          <h2 className="text-3xl font-black tracking-tighter mb-4 uppercase text-theme-main">Create Vault</h2>
          <p className="text-[10px] font-black text-theme-primary uppercase tracking-[0.3em] mb-12">Identity Verification</p>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-theme-muted ml-4 tracking-widest uppercase">Nickname</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={e => setNickname(e.target.value.toUpperCase())} 
                  placeholder="USERNAME" 
                  className={`w-full border rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-theme-primary transition-all font-bold text-[11px] ${inputThemeClasses}`} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-theme-muted ml-4 tracking-widest uppercase">Set 4-Digit PIN</label>
              <div className="relative">
                <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                <input 
                  type={showPin ? "text" : "password"} 
                  maxLength={4} 
                  value={pin} 
                  onChange={e => setPin(e.target.value.replace(/\D/g,''))} 
                  placeholder="****" 
                  className={`w-full border rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-theme-primary transition-all text-center text-3xl font-bold tracking-[0.8em] ${inputThemeClasses}`} 
                />
                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-6 top-1/2 -translate-y-1/2 text-theme-muted">
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-theme-muted ml-4 tracking-widest uppercase">Invite Code (Optional)</label>
              <div className="relative">
                <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                <input 
                  type="text" 
                  value={ref} 
                  onChange={e => setRef(e.target.value.toUpperCase())} 
                  placeholder="CODE" 
                  className={`w-full border rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-theme-primary transition-all font-bold text-[10px] ${inputThemeClasses}`} 
                />
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button 
              disabled={!isFormReady || isProcessing}
              onClick={handleFinalize}
              className="w-full bg-theme-primary text-theme-contrast py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl disabled:opacity-30 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {isProcessing ? 'SYNCHRONIZING...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
