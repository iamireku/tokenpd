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
  BarChart3
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state, setView, dismissMessage, isSyncing, claimDailyBonus, lastBonusAt, triggerSecretTap, isProcessing, submitVote, addToast } = useApp();
  const [now, setNow] = useState(Date.now());
  const [isScrolled, setIsScrolled] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-50/80 pb-40 pt-6">
      <div className="max-w-lg mx-auto">
        <header className={`sticky-header-capsule ${isScrolled ? 'header-scrolled' : ''}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div onClick={triggerSecretTap} className="cursor-pointer">
                <Logo size={42} strokeColor="var(--primary)" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{state.nickname || 'ACCOUNT'}</h1>
                  {hasPremiumBenefits(state.isPremium, state.rank) && <Crown size={12} className="text-orange-500 fill-orange-500" />}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {isSyncing ? <RefreshCw size={8} className="text-theme-primary animate-spin" /> : <div className="w-2 h-2 rounded-full bg-theme-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" />}
                  <span className="text-[7px] font-black uppercase text-theme-primary tracking-widest leading-none">{isSyncing ? 'SYNCING...' : 'SYNCED'}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setView('ECONOMY')} className="px-4 py-2 bg-theme-card rounded-2xl border border-theme shadow-sm active:scale-95 transition-all">
              <span className="text-theme-primary font-black text-sm block leading-none tabular-nums"><RollingNumber value={state.points} /> P</span>
              <span className="text-[6px] font-black text-theme-muted uppercase tracking-widest mt-0.5">CREDITS</span>
            </button>
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
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-primary">User Training</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">How TokenPod App Works</h2>
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

          {/* Standard Daily Bonus Banner (Restored State) */}
          {canClaimBonus && (
            <section className="mb-10 animate-in slide-in-from-top duration-500">
              <div className="relative solid-card rounded-[2.5rem] p-6 border-l-[8px] border-orange-500 shadow-2xl bg-theme-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="px-3 py-1 rounded-full text-[7px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/30">
                    <Zap size={10} className="inline mr-1" fill="currentColor" /> Daily Yield
                  </div>
                </div>
                <h4 className="text-[12px] font-black uppercase text-theme-main mb-1 tracking-tight">Loyalty Yield Ready</h4>
                <p className="text-[12px] font-semibold text-theme-muted uppercase leading-relaxed mb-6 tracking-tight">
                  Your daily 24h participation reward is available for collection.
                </p>
                <button 
                  onClick={handleClaimBonus}
                  disabled={isProcessing}
                  className="w-full bg-orange-500 text-black py-4 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : 'Claim Bonus Points'}
                </button>
              </div>
            </section>
          )}

          {currentMessage && (
            <div className="relative mb-10 group animate-in slide-in-from-top duration-500">
              {/* Animated Outline (Snake Border) */}
              <div className="absolute -inset-[2px] rounded-[2.6rem] overflow-hidden pointer-events-none opacity-80">
                <div className={`absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,var(--primary)_360deg)] animate-[spin_4s_linear_infinite] ${currentMessage.urgency === 'CRITICAL' ? 'bg-red-500' : ''}`} />
              </div>

              <div className="relative solid-card rounded-[2.5rem] p-6 border-l-[8px] border-theme-primary shadow-2xl bg-theme-card overflow-hidden">
                {/* Corner Dismiss Button */}
                <button 
                  onClick={() => { triggerHaptic('light'); dismissMessage(currentMessage.id); }}
                  className="absolute top-4 right-4 p-2 text-theme-muted hover:text-theme-primary transition-colors z-20 active:scale-90"
                  aria-label="Dismiss message"
                >
                  <X size={18} strokeWidth={3} />
                </button>

                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase border ${currentMessage.type === 'SURVEY' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : 'bg-theme-primary/10 text-theme-primary border-theme-primary/30'}`}>
                    {currentMessage.type === 'SURVEY' ? <BarChart3 size={10} className="inline mr-1" /> : <MessageSquare size={10} className="inline mr-1" />}
                    {currentMessage.type === 'SURVEY' ? 'Intelligence Poll' : 'System Bulletin'}
                  </div>
                </div>
                <h4 className="text-[12px] font-black uppercase text-theme-main mb-1 tracking-tight pr-8">{currentMessage.title}</h4>
                <p className="text-[12px] font-semibold text-theme-muted uppercase leading-relaxed mb-6 tracking-tight">{currentMessage.message}</p>
                
                {/* SURVEY OPTIONS RENDERING */}
                {currentMessage.type === 'SURVEY' && currentMessage.surveyOptions && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {currentMessage.surveyOptions.map((option) => (
                      <button 
                        key={option}
                        disabled={isProcessing || !!votingId}
                        onClick={() => handleSurveyVote(currentMessage.id, option)}
                        className={`py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 ${
                          votingId === option 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-theme-main/5 border-theme-muted/10 text-theme-main hover:border-blue-500/50'
                        } active:scale-95 disabled:opacity-50`}
                      >
                        {votingId === option ? <RefreshCw size={12} className="animate-spin" /> : null}
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={() => dismissMessage(currentMessage.id)} className="text-theme-muted hover:text-theme-main text-[8px] font-black uppercase tracking-widest transition-colors">
                    {currentMessage.type === 'SURVEY' ? 'Skip Participation' : 'Clear Notification'}
                  </button>
                  {currentMessage.type !== 'SURVEY' && currentMessage.actionLabel && currentMessage.actionUrl && (
                    <button 
                      onClick={() => window.open(currentMessage.actionUrl, '_blank')}
                      className="px-4 py-2 bg-theme-primary text-theme-contrast rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-theme-primary/20 active:scale-95 transition-transform"
                    >
                      {currentMessage.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <PerformanceStats />

          {readyApps.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-theme-primary" />
                  <h2 className="text-[11px] font-black uppercase text-theme-primary tracking-widest">READY NOW</h2>
                </div>
                <button 
                  onClick={() => { triggerHaptic('medium'); setView('FOCUS'); }} 
                  className="bg-[var(--primary-soft)] text-theme-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  FOCUS MODE <ChevronRight size={10} strokeWidth={3} />
                </button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar px-2">
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
    </div>
  );
};