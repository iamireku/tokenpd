import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { 
  triggerHaptic, 
  hasPremiumBenefits,
  playFeedbackSound
} from '../utils';
import { AppCard } from './PodCard';
import { QuickAddCard } from './QuickAddCard';
import { InstallPrompt } from './InstallPrompt';
import { PerformanceStats } from './PerformanceStats';
import { Logo } from './Logo';
import { RollingNumber } from '../App';
import { Tooltip } from './Tooltip';
import { 
  Crown, 
  RefreshCw, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  X,
  CheckCircle2,
  BarChart3,
  Cloud,
  MonitorPlay,
  Terminal as TerminalIcon,
  ShieldAlert,
  Database,
  // Fix: consolidated ExternalLink import at the top to resolve the scope error
  ExternalLink
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, setView, dismissMessage, isSyncing, isBackgroundSyncing, claimDailyBonus, lastBonusAt, triggerSecretTap, isProcessing, submitVote, addToast, setPipActive, isPipActive } = useApp();
  const [now, setNow] = useState(Date.now());
  const [isScrolled, setIsScrolled] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  const canUsePip = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  useEffect(() => {
    const heartbeat = setInterval(() => setNow(Date.now()), 1000);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => { clearInterval(heartbeat); window.removeEventListener('scroll', handleScroll); };
  }, []);

  const readyApps = useMemo(() => state.apps.filter(app => state.tasks.some(t => t.appId === app.id && t.nextDueAt <= now)), [state.apps, state.tasks, now]);
  
  const sortedApps = useMemo(() => [...state.apps].sort((a, b) => {
    const aMin = Math.min(...state.tasks.filter(t => t.appId === a.id).map(t => t.nextDueAt));
    const bMin = Math.min(...state.tasks.filter(t => t.appId === b.id).map(t => t.nextDueAt));
    return aMin - bMin;
  }), [state.apps, state.tasks]);

  const unreadMessages = state.messages.filter(m => !m.isRead).sort((a, b) => b.createdAt - a.createdAt);
  const currentMessage = unreadMessages[0];

  const canClaimBonus = !lastBonusAt || (Date.now() - lastBonusAt > 86400000);

  const isNewUser = state.apps.length === 0;

  const handleClaimBonus = async () => {
    triggerHaptic('success');
    playFeedbackSound('harvest');
    await claimDailyBonus();
  };

  const handleSurveyVote = async (messageId: string, option: string) => {
    if (isProcessing || votingId) return;
    setVotingId(option);
    triggerHaptic('medium');
    
    const success = await submitVote(messageId, option);
    if (success) {
      addToast("Vote Recorded", "SUCCESS");
      playFeedbackSound('uplink');
      dismissMessage(messageId);
    }
    setVotingId(null);
  };

  const activeSync = isSyncing || isBackgroundSyncing;

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-3xl pb-40 pt-6 transition-colors duration-500">
      {/* Background Top Progress Bar */}
      <div className={`fixed top-0 left-0 right-0 h-0.5 z-[1000] transition-opacity duration-500 ${activeSync ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-theme-primary animate-[shimmer_2s_infinite]" style={{ width: activeSync ? '100%' : '0%' }} />
      </div>

      <div className="max-w-lg mx-auto">
        <header className={`sticky-header-capsule ${isScrolled ? 'header-scrolled' : ''}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div onClick={triggerSecretTap} className="cursor-pointer">
                <Logo size={42} strokeColor="var(--primary)" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight leading-none">{state.nickname || 'ACCOUNT'}</h1>
                  {hasPremiumBenefits(state.isPremium, state.rank) && <Crown size={12} className="text-orange-500 fill-orange-500" />}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {activeSync ? (
                    <Cloud size={10} className="text-theme-primary animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-theme-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" />
                  )}
                  <span className="text-[7px] font-black uppercase text-theme-primary tracking-widest leading-none">
                    {activeSync ? 'SYNCING...' : 'VAULT SYNCED'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip id="tip_account_rank" position="bottom">
                <button onClick={() => setView('ECONOMY')} className="px-4 py-2 bg-theme-card rounded-2xl border border-theme shadow-sm active:scale-95 transition-all">
                  <span className="text-theme-primary font-black text-sm block leading-none tabular-nums"><RollingNumber value={state.points} /> P</span>
                  <span className="text-[6px] font-black text-theme-muted uppercase tracking-widest mt-0.5">CREDITS</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </header>

        <div className="px-6 pt-10">
          <InstallPrompt />

          {isNewUser && (
            <section className="mb-10 animate-in slide-in-from-top duration-700">
               <div className="solid-card rounded-[3rem] p-8 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-theme-primary/10 flex items-center justify-center text-theme-primary">
                         <Sparkles size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-primary">App Training</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-slate-50 mb-2">How TokenPod App Works</h2>
                    <p className="text-[11px] font-bold text-theme-muted uppercase tracking-tight leading-relaxed mb-8 max-w-[240px]">
                      Learn the 4-stage Pod lifecycle and how to maximize your point velocity.
                    </p>
                    <button 
                      onClick={() => { triggerHaptic('medium'); setView('GUIDE'); }}
                      className="w-full bg-theme-primary text-theme-contrast py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                    >
                      View App Guide <ArrowRight size={16} />
                    </button>
                  </div>
               </div>
            </section>
          )}

          {/* REDESIGNED: Daily Yield "Hardware Chip" */}
          {canClaimBonus && (
            <section className="mb-10 animate-in slide-in-from-top duration-500">
              <div className="relative p-[2px] rounded-[2.5rem] bg-gradient-to-b from-orange-400/30 to-transparent shadow-2xl group active:scale-[0.99] transition-all overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)] animate-pulse" />
                
                <div className="relative solid-card rounded-[2.4rem] p-6 bg-theme-card shadow-[inset_0_4px_12px_rgba(0,0,0,0.03)] border-none">
                  {/* Technical Metadata */}
                  <div className="absolute top-4 right-6 font-mono text-[7px] font-black text-theme-muted/40 tracking-[0.2em]">
                    REF: YLD-24H
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                      {/* Magma Core Icon */}
                      <div className="relative w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden shadow-xl border border-white/5 group-hover:shadow-orange-500/20 transition-all">
                        <div className="absolute inset-1 rounded-full bg-[conic-gradient(from_0deg,transparent,var(--primary))] animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center z-10">
                          <Zap size={20} className="text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_var(--primary)]" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tighter tabular-nums">{state.isPremium ? '6' : '3'}</span>
                          <span className="text-sm font-black text-theme-primary uppercase tracking-widest">Points</span>
                        </div>
                        <p className="text-[8px] font-black text-theme-muted uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1.5">
                           <Database size={8} /> DEPOSIT READY
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                       <span className="text-[7px] font-black text-theme-muted uppercase tracking-widest block mb-1 opacity-60">Loyalty Streak</span>
                       <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <span className="text-[10px] font-black uppercase tracking-tight">ACTIVE</span>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleClaimBonus}
                    disabled={activeSync}
                    className="w-full relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-black py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl group-hover:bg-theme-primary group-hover:text-white transition-all disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {activeSync ? <RefreshCw className="animate-spin" size={14} /> : 'CLAIM'}
                      {!activeSync && <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />}
                    </span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* REDESIGNED: Broadcast Intercept "Technical Module" */}
          {currentMessage && (
            <div className="relative mb-10 group animate-in slide-in-from-top duration-500">
              {/* Asymmetric Technical Intercept Container */}
              <div className="relative p-[1.5px] rounded-[2.5rem] bg-theme-primary/20 overflow-hidden shadow-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)' }}>
                {/* Flowing Trace Border for Urgent/Critical */}
                {currentMessage.urgency !== 'NORMAL' && (
                  <div className={`absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,var(--primary)_360deg)] animate-[spin_4s_linear_infinite] ${currentMessage.urgency === 'CRITICAL' ? 'bg-red-500' : ''}`} />
                )}

                <div className="relative bg-white dark:bg-slate-950 p-7 space-y-6">
                  {/* Card Metadata Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentMessage.type === 'SURVEY' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                         {currentMessage.type === 'SURVEY' ? <BarChart3 size={16} /> : <TerminalIcon size={16} />}
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-theme-muted uppercase tracking-[0.2em] block">NETWORK_INTERCEPT</span>
                        <span className={`text-[7px] font-black uppercase tracking-widest ${currentMessage.urgency === 'CRITICAL' ? 'text-red-500' : 'text-theme-primary'}`}>
                          LEVEL: {currentMessage.urgency}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[7px] font-black text-theme-muted/30 tracking-widest">REF: SYS-{currentMessage.id.slice(-4).toUpperCase()}</span>
                      <button 
                        onClick={() => { triggerHaptic('light'); dismissMessage(currentMessage.id); }}
                        className="text-theme-muted/40 hover:text-theme-primary transition-colors active:scale-90"
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  {/* Content Body with Typewriter Feel */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-tight leading-snug animate-[scan-in_0.3s_ease-out]">
                      {currentMessage.title}
                    </h4>
                    <p className="text-[11px] font-bold text-theme-muted uppercase leading-relaxed tracking-tight opacity-80">
                      {currentMessage.message}
                    </p>
                  </div>
                  
                  {/* REDESIGNED SURVEY: Choice Pills */}
                  {currentMessage.type === 'SURVEY' && currentMessage.surveyOptions && (
                    <div className="grid grid-cols-2 gap-3">
                      {currentMessage.surveyOptions.map((option) => (
                        <button 
                          key={option}
                          disabled={activeSync || !!votingId}
                          onClick={() => handleSurveyVote(currentMessage.id, option)}
                          className={`group py-4 px-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 overflow-hidden relative ${
                            votingId === option 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'bg-theme-main/5 border-theme-muted/10 text-theme-main hover:border-blue-500/50 hover:bg-blue-500/5'
                          } active:scale-95 disabled:opacity-50`}
                        >
                          {votingId === option ? <RefreshCw size={12} className="animate-spin" /> : null}
                          <span className="relative z-10">{option}</span>
                          <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <button onClick={() => dismissMessage(currentMessage.id)} className="text-theme-muted/50 hover:text-theme-main text-[8px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 group">
                      <CheckCircle2 size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" /> Clear Signal
                    </button>
                    {currentMessage.type !== 'SURVEY' && currentMessage.actionLabel && currentMessage.actionUrl && (
                      <button 
                        onClick={() => window.open(currentMessage.actionUrl, '_blank')}
                        className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center gap-2 border-b-2 border-white/10"
                      >
                        {currentMessage.actionLabel} <ExternalLink size={12} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <PerformanceStats />

          {readyApps.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-theme-primary shadow-[0_0_8px_var(--primary)]" />
                  <h2 className="text-[11px] font-black uppercase text-theme-primary tracking-widest">READY NOW</h2>
                </div>
                
                <div className="flex items-center gap-3">
                  {canUsePip && !isPipActive && (
                    <Tooltip id="tip_signal_hud" position="left">
                      <button 
                        onClick={() => { triggerHaptic('light'); setPipActive(true); }}
                        className="p-1.5 text-slate-400 hover:text-theme-primary transition-colors active:scale-90"
                        title="Signal HUD Overlay"
                      >
                        <MonitorPlay size={20} />
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip id="tip_focus_mode" position="left">
                    <button 
                      onClick={() => { triggerHaptic('medium'); setView('FOCUS'); }} 
                      className="bg-[var(--primary-soft)] text-theme-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all shadow-sm border border-theme-primary/10"
                    >
                      FOCUS MODE <ChevronRight size={10} strokeWidth={3} />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="flex gap-6 overflow-x-auto hide-scrollbar px-2">
                {readyApps.map((app, idx) => (
                  <AppCard 
                    key={app.id} 
                    app={app} 
                    variant="compact" 
                    index={idx} 
                    total={readyApps.length} 
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-6 px-4">
              <h2 className="text-[11px] font-black uppercase text-theme-muted tracking-widest">GROWTH FEED</h2>
              <span className="text-[8px] font-black text-theme-muted opacity-40 uppercase tracking-widest">{state.apps.length} STREAMS ACTIVE</span>
            </div>
            <div className="space-y-5">
              {sortedApps.map(app => (
                <AppCard 
                  key={app.id} 
                  app={app} 
                />
              ))}
              <QuickAddCard />
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scan-in {
          0% { opacity: 0; transform: translateX(-4px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .glow-ready {
          box-shadow: 0 0 40px -10px rgba(var(--primary-rgb), 0.3);
        }
      `}</style>
    </div>
  );
};
