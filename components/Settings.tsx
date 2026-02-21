
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { Theme, SoundProfile } from '../types';
import { 
  Bell, 
  LogOut, 
  ChevronRight, 
  Monitor, 
  Trash2, 
  Fingerprint,
  MessageSquare,
  Copy,
  Sun,
  Moon,
  Shield,
  Key,
  ChevronDown,
  Loader2,
  BellOff,
  Volume2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Cloud
} from 'lucide-react';
import { triggerHaptic, playFeedbackSound, playSignalSound } from '../utils';
import { useHoldToConfirm } from '../hooks/useHoldToConfirm';

export const Settings: React.FC = () => {
  const { state, signOut, setTheme, toggleNotifications, setView, deleteAccount, addToast, updatePin, isProcessing, dispatch, isSyncing, isBackgroundSyncing } = useApp();
  const [showAccountId, setShowAccountId] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [isSystemDark, setIsSystemDark] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const [showPinUpdate, setShowPinUpdate] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  useEffect(() => {
    const checkPerm = () => {
      if (typeof Notification !== 'undefined') setBrowserPermission(Notification.permission);
    };
    checkPerm();
    const interval = setInterval(checkPerm, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdatePin = async () => {
    if (newPin !== confirmNewPin) {
      addToast("PINs do not match", "ERROR");
      return;
    }
    if (newPin.length !== 4) {
      addToast("PIN must be 4 digits", "ERROR");
      return;
    }
    const success = await updatePin(currentPin, newPin);
    if (success) {
      triggerHaptic('success');
      playFeedbackSound('uplink');
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
      setShowPinUpdate(false);
    }
  };

  const handleResetTooltips = () => {
    triggerHaptic('heavy');
    dispatch({ type: 'SET_VAULT', vault: { acknowledgedTooltips: [], isDirty: true } });
    addToast("Interface Training Reset", "SUCCESS");
  };

  const { holdProgress, handleStart, handleEnd } = useHoldToConfirm(handleUpdatePin, 1500);

  const copyAccountId = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(state.accountId);
    addToast("ID copied to clipboard", "SUCCESS");
  };

  const themes = [
    { id: Theme.SYSTEM, label: 'Auto', icon: <Monitor size={14} /> },
    { id: Theme.LIGHT, label: 'Light', icon: <Sun size={14} /> },
    { id: Theme.DARK, label: 'Dark', icon: <Moon size={14} /> }
  ];

  const soundProfiles = [
    { id: SoundProfile.CYBER, label: 'Cyber' },
    { id: SoundProfile.MINIMAL, label: 'Simple' },
    { id: SoundProfile.TECH, label: 'Alert' },
    { id: SoundProfile.CHIME, label: 'Chime' },
    { id: SoundProfile.SILENT, label: 'Off' }
  ];

  const setSoundProfile = (profile: SoundProfile) => {
    triggerHaptic('light');
    dispatch({ type: 'SET_VAULT', vault: { soundProfile: profile } });
    playSignalSound(profile);
  };

  const isBlocked = browserPermission === 'denied';
  const isPinFormValid = currentPin.length === 4 && newPin.length === 4 && newPin === confirmNewPin;
  const activeSync = isSyncing || isBackgroundSyncing;

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-3xl pb-40 pt-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Top Progress Bar (Consistent with Dashboard) */}
      <div className={`fixed top-0 left-0 right-0 h-0.5 z-[1000] transition-opacity duration-500 ${activeSync ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-theme-primary animate-[shimmer_2s_infinite]" style={{ width: activeSync ? '100%' : '0%' }} />
      </div>

      {/* Background Atmosphere (Consistent with Dashboard) */}
      <div className="fixed inset-0 pointer-events-none opacity-40 -z-10 transition-opacity duration-1000">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.05),transparent_70%)]" />
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        <header className="sticky-header-capsule shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-tight leading-none">Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 font-black text-[8px] mt-1 uppercase tracking-widest leading-none">Account Preferences</p>
            </div>
            <div className="flex items-center gap-1.5 opacity-60">
              {activeSync ? (
                <Cloud size={10} className="text-theme-primary animate-pulse" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
              )}
              <span className="text-[7px] font-black uppercase text-theme-primary tracking-widest leading-none">
                {activeSync ? 'SYNCING' : 'SECURE'}
              </span>
            </div>
          </div>
        </header>

        <div className="px-6 pt-10 space-y-8">
          
          {/* SOUND SETTINGS */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
               <h2 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Signal Chime</h2>
               <div className="flex items-center gap-1">
                  <span className="text-[7px] font-black text-theme-primary uppercase">Digital Tones</span>
                  <div className="w-1 h-1 rounded-full bg-theme-primary animate-pulse" />
               </div>
            </div>
            <div className="bg-theme-card rounded-[2rem] p-1.5 border border-theme grid grid-cols-5 shadow-sm">
              {soundProfiles.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSoundProfile(s.id)} 
                  className={`py-4 rounded-[1.5rem] flex flex-col items-center gap-1.5 transition-all ${state.soundProfile === s.id ? 'bg-theme-primary text-theme-contrast shadow-lg' : 'text-theme-muted hover:text-theme-main'}`}
                >
                  <Volume2 size={14} className={s.id === SoundProfile.SILENT ? 'opacity-30' : ''} />
                  <span className="text-[7px] font-black uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[7px] font-bold text-theme-muted uppercase tracking-widest px-4 leading-relaxed">
              Sounds for the Signal HUD and Focus Mode. Settings save to your secure cloud.
            </p>
          </section>

          {/* DISPLAY SETTINGS */}
          <section>
            <h2 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-4 px-2">Display System</h2>
            <div className="bg-theme-card rounded-[2rem] p-1.5 border border-theme flex shadow-sm">
              {themes.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { triggerHaptic('light'); setTheme(t.id); }} 
                  className={`flex-1 py-4 rounded-[1.5rem] flex flex-col items-center gap-1.5 transition-all ${state.theme === t.id ? 'bg-theme-primary text-theme-contrast shadow-lg' : 'text-theme-muted hover:text-theme-main'}`}
                >
                  {t.icon}
                  <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* PREFERENCES */}
          <section>
            <h2 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-4 px-2">Preferences</h2>
            <div className="bg-theme-card rounded-[2.5rem] border border-theme overflow-hidden shadow-sm">
              <div 
                onClick={handleResetTooltips}
                className="p-5 flex items-center justify-between cursor-pointer active:bg-theme-main/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/5 flex items-center justify-center text-orange-500 border border-orange-500/10">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-theme-main uppercase tracking-tight">System Training</h3>
                    <p className="text-[8px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">Reset all interface tooltips</p>
                  </div>
                </div>
                <RotateCcw size={18} className="text-theme-muted opacity-40" />
              </div>
            </div>
          </section>

          {/* PRIVACY & SECURITY */}
          <section>
            <h2 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-4 px-2">Privacy & Security</h2>
            <div className="bg-theme-card rounded-[2.5rem] divide-y divide-theme border border-theme overflow-hidden shadow-sm">
              
              <div 
                onClick={() => { triggerHaptic('light'); setShowPinUpdate(!showPinUpdate); }}
                className="p-5 flex items-center justify-between cursor-pointer active:bg-theme-main/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-theme-main/5 flex items-center justify-center text-theme-muted border border-theme">
                    <Fingerprint size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-theme-main uppercase tracking-tight">Security PIN</h3>
                    <p className="text-[8px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">Update your 4-digit code</p>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-theme-muted transition-transform duration-300 ${showPinUpdate ? 'rotate-180' : ''}`} />
              </div>

              {showPinUpdate && (
                <div className="p-6 bg-theme-main/5 animate-in slide-in-from-top duration-300 space-y-5">
                  <div className="space-y-4">
                    <input 
                      type="password" maxLength={4} inputMode="numeric" placeholder="CURRENT PIN" value={currentPin}
                      onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-theme-card border border-theme rounded-xl py-4 text-center font-mono text-xl tracking-[0.5em] text-theme-main outline-none focus:border-theme-primary transition-all"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="password" maxLength={4} inputMode="numeric" placeholder="NEW PIN" value={newPin}
                        onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-theme-card border border-theme rounded-xl py-4 text-center font-mono text-xl tracking-[0.5em] text-theme-main outline-none focus:border-theme-primary transition-all"
                      />
                      <input 
                        type="password" maxLength={4} inputMode="numeric" placeholder="CONFIRM" value={confirmNewPin}
                        onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-theme-card border border-theme rounded-xl py-4 text-center font-mono text-xl tracking-[0.5em] text-theme-main outline-none focus:border-theme-primary transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                    onTouchStart={handleStart} onTouchEnd={handleEnd}
                    disabled={!isPinFormValid || isProcessing}
                    className="w-full relative overflow-hidden bg-theme-primary text-theme-contrast py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase shadow-lg disabled:opacity-30 transition-all"
                  >
                    <div className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-75" style={{ width: `${holdProgress}%` }} />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      {holdProgress > 0 ? `SYNCING ${Math.round(holdProgress)}%` : 'Hold to Save PIN'}
                    </span>
                  </button>
                </div>
              )}

              <div 
                onClick={() => { triggerHaptic('light'); setShowAccountId(!showAccountId); }}
                className="p-5 flex items-center justify-between cursor-pointer active:bg-theme-main/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-theme-main/5 flex items-center justify-center text-theme-muted border border-theme">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-theme-main uppercase tracking-tight">Account ID</h3>
                    <p className="text-[8px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">Your unique login ID</p>
                  </div>
                </div>
                {showAccountId ? (
                   <button onClick={(e) => { e.stopPropagation(); copyAccountId(); }} className="p-2 text-theme-primary active:scale-90 transition-transform"><Copy size={16} /></button>
                ) : <ChevronRight size={18} className="text-theme-muted opacity-40" />}
              </div>

              {showAccountId && (
                <div className="p-4 bg-theme-main/5 px-6 animate-in fade-in duration-300">
                  <p className="font-mono text-[10px] text-theme-primary bg-theme-card p-3 rounded-lg border border-theme break-all selectable-data">
                    {state.accountId}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* NOTIFICATIONS & HELP */}
          <section>
            <h2 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-4 px-2">Notifications & Help</h2>
            <div className="bg-theme-card rounded-[2.5rem] divide-y divide-theme border border-theme overflow-hidden shadow-sm">
              <div 
                onClick={() => { triggerHaptic('medium'); toggleNotifications(); }} 
                className={`p-5 cursor-pointer transition-all active:bg-theme-main/5 ${isBlocked ? 'bg-red-500/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isBlocked ? 'bg-red-500/10 text-red-500' : 
                      state.notificationsEnabled ? 'bg-theme-primary/10 text-theme-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {state.notificationsEnabled && !isBlocked ? <Bell size={24} /> : <BellOff size={24} />}
                    </div>
                    <div>
                      <h3 className={`font-black text-xs uppercase ${isBlocked ? 'text-red-500' : 'text-theme-main'}`}>Phone Notifications</h3>
                      <p className={`text-[8px] font-bold uppercase tracking-tight ${isBlocked ? 'text-red-500/70' : 'text-theme-muted'}`}>
                        {isBlocked ? 'Blocked by Browser' : 'Background Sync Alerts'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${state.notificationsEnabled && !isBlocked ? 'bg-theme-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${state.notificationsEnabled && !isBlocked ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </div>
              
              <div onClick={() => setView('CONTACT')} className="p-5 flex items-center justify-between cursor-pointer active:bg-theme-main/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-theme-main/5 flex items-center justify-center text-theme-muted border border-theme">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-theme-main uppercase tracking-tight">Help Center</h3>
                    <p className="text-[8px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">Technical Support</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-theme-muted opacity-40" />
              </div>
            </div>
          </section>

          {/* ACCOUNT ACTIONS */}
          <section className="pt-4 space-y-4">
            <button 
              onClick={() => { triggerHaptic('medium'); if(confirm('Permanently delete all storage and close account?')) deleteAccount(); }} 
              className="w-full bg-red-600/5 text-red-600 p-8 rounded-[2.5rem] border border-red-500/20 flex flex-col items-center gap-3 active:bg-red-600 active:text-white transition-all shadow-sm group"
            >
              <Trash2 size={24} className="group-active:scale-110 transition-transform" />
              <div className="text-center">
                 <h3 className="text-xs font-black uppercase">Close Account</h3>
                 <p className="text-[7px] font-bold uppercase tracking-widest mt-1 opacity-60">Permanent Data Delete</p>
              </div>
            </button>

            <button 
              onClick={() => { triggerHaptic('medium'); signOut(); }}
              className="w-full flex items-center justify-center gap-2 text-theme-muted hover:text-theme-main py-4 transition-colors font-black text-[9px] uppercase tracking-[0.2em]"
            >
              <LogOut size={14} /> Log Out
            </button>
          </section>

          <footer className="text-center pb-20">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-theme-main/5 border border-theme">
                <Shield size={10} className="text-theme-muted" />
                <span className="text-[7px] font-black text-theme-muted uppercase tracking-widest">System v6.9 | Points Update</span>
             </div>
          </footer>

        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
