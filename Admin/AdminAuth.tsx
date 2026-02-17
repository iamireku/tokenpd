
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { Theme } from '../types';
import { ShieldAlert, Terminal, Lock, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { triggerHaptic } from '../utils';

export const AdminAuth: React.FC = () => {
  const { setView, adminLogin, addToast, setAdminKey, state } = useApp();
  const [key, setKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const isDark = useMemo(() => {
    if (state.theme === Theme.SYSTEM) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return state.theme === Theme.DARK;
  }, [state.theme]);

  const inputContrastClass = isDark 
    ? 'bg-black text-white border-white/20 focus:border-white' 
    : 'bg-white text-black border-black/20 focus:border-black';

  const handleAuth = async () => {
    if (!key) return;
    setIsVerifying(true);
    triggerHaptic('heavy');
    
    try {
      const res = await adminLogin(key);
      if (res.success && res.sessionToken) {
        setAdminKey(res.sessionToken);
        setView('ADMIN');
        addToast("SECURE SESSION ESTABLISHED", "SUCCESS");
      } else {
        addToast(res.error || "ACCESS DENIED", "ERROR");
      }
    } catch (e) {
      addToast("UPLINK FAILED", "ERROR");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-theme-main flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-sm:max-w-sm">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-theme-card rounded-3xl flex items-center justify-center border border-theme shadow-2xl mb-6 relative">
             <Terminal className="text-theme-primary relative z-10" size={36} />
          </div>
          <h1 className="text-theme-main font-black text-2xl uppercase tracking-tighter mb-2">SECURE GATEWAY</h1>
          <p className="text-theme-muted font-bold uppercase tracking-[0.2em] text-[9px]">Method 5: Session Handshake</p>
        </div>

        <div className="bg-theme-card p-8 rounded-[3rem] border border-theme backdrop-blur-md shadow-2xl space-y-8">
           <div className="space-y-3">
              <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-4">MASTER ADMIN TOKEN</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                <input 
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="********"
                  className={`w-full border rounded-2xl py-5 pl-14 pr-6 font-mono text-sm tracking-widest outline-none transition-all text-center ${inputContrastClass}`}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  disabled={isVerifying}
                />
              </div>
           </div>

           <button 
             onClick={handleAuth}
             disabled={!key || isVerifying}
             className="w-full py-6 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition-all bg-theme-primary text-theme-contrast shadow-xl shadow-theme-primary/20 active:translate-y-1 disabled:opacity-50"
           >
             {isVerifying ? <Loader2 className="animate-spin" size={16} /> : 'INITIALIZE SESSION'} <ArrowRight size={16} />
           </button>

           <button 
            onClick={() => setView('SETTINGS')}
            className="w-full text-theme-muted hover:text-theme-main font-black text-[9px] uppercase tracking-widest py-2 transition-colors flex items-center justify-center gap-2"
           >
             <ChevronLeft size={14} /> ABORT COMMAND
           </button>
        </div>

        <div className="mt-12 p-6 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-4">
           <ShieldAlert className="text-orange-500 shrink-0" size={16} />
           <p className="text-[8px] text-orange-800 font-bold uppercase leading-relaxed tracking-widest text-center mx-auto">
             REQUEST SIGNING (HMAC) AND RATE LIMITING ACTIVE. UNAUTHORIZED ATTEMPTS ARE LOGGED.
           </p>
        </div>
      </div>
    </div>
  );
};
