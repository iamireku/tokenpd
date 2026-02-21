
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store';
import { Tooltip } from './Tooltip';
import { 
  Zap, 
  Sparkles, 
  Radar, 
  Coins, 
  Check, 
  Loader2, 
  ChevronDown,
  TrendingUp,
  UserPlus,
  ShieldAlert,
  ArrowRight,
  Ticket,
  ShieldCheck
} from 'lucide-react';
import { triggerHaptic, hasPremiumBenefits, fetchAppIcon } from '../utils';

export const GrowthLab: React.FC = () => {
  const { state, setView, igniteSpark, logPartnerHandshake, lastSparkAt, rechargeSpark, redeemCode, addToast, triggerLaunch, isProcessing, setPrefillApp } = useApp();
  
  const [enhancedIcons, setEnhancedIcons] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState<'NONE' | 'CODE' | 'LINK' | string>('NONE');
  const [promoInput, setPromoInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReferralExpanded, setIsReferralExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  const SPARK_COOLDOWN = 86400000;
  const canSpark = !lastSparkAt || (Date.now() - lastSparkAt > SPARK_COOLDOWN);
  const hasBenefits = hasPremiumBenefits(state.isPremium, state.rank);

  const featuredPartner = useMemo(() => {
    return state.partnerManifest?.find(p => p.isFeatured);
  }, [state.partnerManifest]);

  useEffect(() => {
    const projects = [...(state.trendingProjects || [])];
    if (featuredPartner) {
        projects.push({ name: featuredPartner.appId, count: 0 });
    }
    
    if (projects.length === 0) return;

    const resolveIcons = async () => {
      const iconMap: Record<string, string> = {};
      await Promise.all(
        projects.map(async (project) => {
          const official = await fetchAppIcon(project.name);
          iconMap[project.name] = official;
        })
      );
      setEnhancedIcons(prev => ({ ...prev, ...iconMap }));
    };
    resolveIcons();
  }, [state.trendingProjects, featuredPartner]);

  const topTrending = useMemo(() => {
    const backendStats = state.trendingProjects || [];
    if (backendStats.length === 0) return [];
    
    const maxCount = Math.max(...backendStats.map(p => p.count), 1);

    // Changed slice(0, 8) to slice(0, 5) per user request
    return backendStats.slice(0, 5).map((project, index) => {
      const trendScore = Math.round((project.count / maxCount) * 100);
      const isAlreadyTracked = state.apps.some(a => a.name.toUpperCase() === project.name.toUpperCase());
      const partnerEntry = state.partnerManifest?.find(e => e.appId.toUpperCase() === project.name.toUpperCase());

      return {
        id: `trend-${index}`,
        name: project.name,
        icon: enhancedIcons[project.name] || project.icon || `https://api.dicebear.com/7.x/identicon/svg?seed=${project.name}`,
        activeUsers: `${Math.floor(project.count * 1.5)}K+`,
        trendScore,
        rank: index + 1,
        isAlreadyTracked,
        partnerEntry
      };
    });
  }, [state.trendingProjects, state.apps, enhancedIcons, state.partnerManifest]);

  const handleCopyCode = () => {
    triggerHaptic('medium');
    navigator.clipboard.writeText(state.referralCode);
    setCopyStatus('CODE');
    setTimeout(() => setCopyStatus('NONE'), 2000);
    addToast("Code Copies", "SUCCESS");
  };

  const handleCopyLink = () => {
    triggerHaptic('medium');
    const link = `${window.location.origin}?ref=${state.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopyStatus('LINK');
    setTimeout(() => setCopyStatus('NONE'), 2000);
    addToast("Referral Link Copied", "SUCCESS");
  };

  const handleShare = async () => {
    triggerHaptic('heavy');
    const link = `${window.location.origin}?ref=${state.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TokenPod Account Invite',
          text: `Use my code ${state.referralCode} to join TokenPod and claim a 50P starting bonus!`,
          url: link,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleJoinWithFounder = (appId: string, code: string, url: string) => {
    triggerHaptic('heavy');
    navigator.clipboard.writeText(code);
    addToast("Founder Code Copied", "SUCCESS");
    setCopyStatus(appId);
    setTimeout(() => setCopyStatus('NONE'), 2000);
    
    // Log handshake for partner accountability
    logPartnerHandshake(appId);
    
    window.open(url, '_blank');
  };

  const handleRedeemPromo = async () => {
    if (promoInput.length < 3) {
      addToast('Please enter a valid activation code.', "ERROR");
      return;
    }
    triggerHaptic('heavy');
    const { success } = await redeemCode(promoInput.toUpperCase());
    if (success) {
      setPromoInput('');
    }
  };

  const handleStartAd = () => {
    if (isProcessing) return;
    if (hasBenefits) {
      triggerHaptic('heavy');
      rechargeSpark();
      return;
    }
    setIsWatchingAd(true);
    setAdProgress(0);
    let current = 0;
    const duration = 5000;
    const steps = duration / 50;
    const timer = setInterval(() => {
      current++;
      setAdProgress((current / steps) * 100);
      if (current >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsWatchingAd(false);
          rechargeSpark();
        }, 500);
      }
    }, 50);
  };

  const handleTrackProject = (project: any) => {
    triggerHaptic('medium');
    addToast(`Initializing ${project.name} Pod`, "SUCCESS");
    setPrefillApp({ name: project.name, icon: project.icon });
    setView('CREATE');
  };

  const handleIgniteSpotlight = async () => {
    if (!featuredPartner) return;
    triggerHaptic('heavy');
    triggerLaunch(featuredPartner.appId, featuredPartner.url);
    // passing appId will trigger IGNITION and HANDSHAKE counters in backend
    await igniteSpark(featuredPartner.appId);
  };

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-3xl pb-40 pt-6 overflow-x-hidden transition-colors duration-500">
      <div className="max-w-lg mx-auto relative">
        <header className={`sticky-header-capsule ${isScrolled ? 'header-scrolled' : ''}`}>
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase leading-none">Growth Lab</h1>
              <p className="text-theme-muted font-black text-[8px] tracking-[0.2em] uppercase mt-1">Smart Hub</p>
            </div>
            <button 
              disabled={isProcessing}
              onClick={() => setView('ECONOMY')}
              className="flex items-center gap-2 px-4 py-2 bg-theme-card rounded-2xl border border-theme shadow-sm active:scale-95 transition-all disabled:opacity-30"
            >
              <div className="text-right">
                <span className="text-theme-primary font-black text-xs tracking-tighter block leading-none tabular-nums">{state.points} P</span>
                <span className="text-[6px] font-black text-theme-muted uppercase tracking-widest">Balance</span>
              </div>
              <Coins size={14} className="text-theme-primary" />
            </button>
          </div>
        </header>

        <div className="px-6 pt-10">
          <section className="mb-8">
            <div className="bg-slate-900 border-2 border-orange-500/20 rounded-[2.5rem] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-[2s]">
                  <ShieldAlert size={100} className="text-orange-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert size={16} className="text-orange-500" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Smart Registry</h2>
                  </div>
                  <p className="text-[11px] font-bold text-slate-300 uppercase leading-relaxed">
                    TokenPod is a tracking utility. All projects discovered here are external community signals. Always perform your own research before sharing data.
                  </p>
                </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="solid-card rounded-[2.5rem] overflow-hidden border-2 border-theme-primary/10 transition-all duration-300">
                <div 
                  onClick={() => setIsReferralExpanded(!isReferralExpanded)}
                  className="p-6 flex items-center justify-between cursor-pointer active:bg-theme-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-theme-primary/10 flex items-center justify-center text-theme-primary border border-theme-primary/20">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-theme-main uppercase tracking-tight">Referral</h3>
                      <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest mt-1">Invite Friends & Claim 50P</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full bg-theme-main/50 transition-transform duration-300 ${isReferralExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} className="text-theme-muted" />
                  </div>
                </div>

                {isReferralExpanded && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top duration-300">
                    <div className="bg-theme-main/30 border border-theme-primary/10 rounded-2xl p-5 text-center mb-4">
                      <p className="text-[7px] font-black text-theme-muted uppercase tracking-[0.3em] mb-2">Your Code</p>
                      <p className="text-2xl font-black text-theme-primary tracking-[0.2em] selectable-data">{state.referralCode}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleCopyCode} className="bg-theme-card border border-theme text-theme-main py-4 rounded-xl font-black text-[9px] uppercase active:scale-95 transition-all">
                        {copyStatus === 'CODE' ? 'COPIED' : 'COPY CODE'}
                      </button>
                      <button onClick={handleShare} className="bg-theme-primary text-theme-contrast py-4 rounded-xl font-black text-[9px] uppercase active:scale-95 transition-all shadow-lg">
                        SHARE LINK
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* SPARK SECTION: MORPHS IF PARTNER IS FEATURED */}
          <div className="mb-8">
            <Tooltip id="tip_daily_spark" position="top">
              {featuredPartner ? (
                <div className="bg-slate-950 p-1.5 rounded-[3rem] border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] group animate-in zoom-in duration-500 overflow-hidden relative w-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_70%)] animate-pulse" />
                  
                  <div className="relative solid-card p-8 rounded-[2.8rem] border-none flex flex-col items-center text-center overflow-hidden">
                     <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-orange-500 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                           <Sparkles size={10} className="text-black" fill="currentColor" />
                           <span className="text-[8px] font-black text-black uppercase tracking-widest">Spotlight Signal</span>
                        </div>
                     </div>

                     <div className="mt-6 mb-6 relative">
                        <div className="w-24 h-24 bg-white rounded-[2rem] overflow-hidden shadow-2xl relative z-10 p-[1px] border-2 border-orange-500/20 group-hover:scale-105 transition-transform duration-500">
                           <img src={enhancedIcons[featuredPartner.appId]} className="w-full h-full object-cover rounded-[1.85rem]" alt="" onError={(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${featuredPartner.appId}`} />
                        </div>
                        <div className="absolute -inset-4 bg-orange-500/20 blur-2xl -z-10 rounded-full animate-pulse" />
                        <div className="absolute -bottom-2 -right-2 bg-theme-primary w-8 h-8 rounded-full flex items-center justify-center border-2 border-white text-white shadow-lg">
                           <ShieldCheck size={18} />
                        </div>
                     </div>

                     <h2 className="text-xl font-black text-theme-main uppercase tracking-tighter mb-2">{featuredPartner.appId}</h2>
                     <p className="text-[11px] font-bold text-theme-muted uppercase tracking-tight mb-8 leading-relaxed max-w-[200px]">
                        {featuredPartner.description || 'Verified Network Partner. Connect to claim your Daily Spark yield.'}
                     </p>

                     <button 
                      onClick={handleIgniteSpotlight}
                      disabled={!canSpark || isProcessing}
                      className={`w-full py-6 rounded-2xl font-black text-xs tracking-widest transition-all uppercase shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] ${
                        canSpark && !isProcessing 
                          ? 'bg-orange-500 text-black shadow-orange-500/30' 
                          : 'bg-slate-900 text-slate-500'
                      }`}
                     >
                       {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill={canSpark ? "black" : "none"} />}
                       {canSpark ? `Activate spotlight yield (+${hasBenefits ? '6' : '3'}P)` : 'Spotlight Recharging...'}
                     </button>

                     {!canSpark && (
                      <button onClick={handleStartAd} className="w-full mt-3 bg-slate-950 text-slate-400 py-4 rounded-xl font-black text-[9px] uppercase border border-white/5 active:scale-95 transition-all">
                        {hasBenefits ? 'Instant Spotlight Recharge' : 'Watch Ad to Recharge'}
                      </button>
                     )}
                  </div>
                </div>
              ) : (
                <div className="solid-card p-8 rounded-[3rem] border-theme-primary/10 flex flex-col items-center text-center w-full">
                  <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-6 shadow-xl ${canSpark ? 'bg-theme-primary border-theme-primary/20' : 'bg-slate-800 border-slate-700'}`}>
                    <Zap className={canSpark ? 'text-theme-contrast' : 'text-slate-500'} size={32} />
                  </div>
                  <h2 className="text-xl font-black text-theme-main uppercase tracking-tight mb-2">Daily Spark</h2>
                  <p className="text-[11px] font-bold text-theme-muted uppercase tracking-widest mb-6">Boost daily points (+{hasBenefits ? '6' : '3'} P)</p>
                  <button onClick={() => igniteSpark()} disabled={!canSpark || isProcessing} className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all uppercase shadow-xl ${canSpark && !isProcessing ? 'bg-theme-primary text-theme-contrast' : 'bg-slate-900 text-slate-500'}`}>
                    {isProcessing ? 'SYNCING...' : canSpark ? 'ACTIVATE NOW' : 'RECHARGING...'}
                  </button>
                  {!canSpark && (
                    <button onClick={handleStartAd} className="w-full mt-3 bg-slate-950 text-slate-300 py-4 rounded-2xl font-black text-[10px] uppercase border border-white/5 active:scale-95 transition-all">
                      {hasBenefits ? 'Instant Recharge' : 'Watch Ad to Recharge'}
                    </button>
                  )}
                </div>
              )}
            </Tooltip>
          </div>

          <section className="mb-8 px-2">
            <div className="flex items-center gap-3 mb-6">
              <Tooltip id="tip_global_pulse" position="right">
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-theme-primary" />
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-theme-muted">Global Trends</h2>
                </div>
              </Tooltip>
            </div>
            <div className="bg-theme-card rounded-[2.5rem] border border-theme overflow-hidden divide-y divide-white/5 shadow-2xl">
              {topTrending.map((app) => (
                <div key={app.name} className="p-5 flex flex-col gap-4 group hover:bg-theme-primary/5 transition-all">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden shrink-0 shadow-xl flex items-center justify-center p-[1px]">
                      <img src={app.icon} alt={app.name} className="w-full h-full object-cover rounded-[0.85rem]" onError={(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${app.name}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[11px] font-black uppercase tracking-tight text-theme-main truncate">{app.name}</h4>
                        {app.partnerEntry?.isFeatured && <Sparkles size={10} className="text-orange-500 animate-pulse" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                         <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                           <div className="h-full bg-theme-primary" style={{ width: `${app.trendScore}%` }} />
                         </div>
                         <span className="text-[8px] font-black text-theme-primary">{app.trendScore}%</span>
                      </div>
                      {app.partnerEntry && !app.isAlreadyTracked && (
                        <button onClick={() => handleJoinWithFounder(app.name, app.partnerEntry!.code, app.partnerEntry!.url)} className="w-full mb-3 bg-theme-main border-2 border-orange-500/30 text-orange-500 py-2 rounded-xl font-black text-[8px] uppercase active:scale-95 transition-all">
                          {copyStatus === app.name ? 'CODE COPIED!' : 'JOIN WITH FOUNDER CODE'}
                        </button>
                      )}
                      <div className="flex items-center justify-between">
                         <span className="text-[7px] font-black text-theme-muted uppercase">{app.activeUsers} Active Hunters</span>
                         {app.isAlreadyTracked ? <Check size={10} className="text-green-500" /> : <button onClick={() => handleTrackProject(app)} className="text-theme-primary text-[7px] font-black uppercase hover:underline">+ Track Task</button>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {topTrending.length === 0 && (
                <div className="p-12 text-center opacity-30">
                  <Radar size={40} className="mx-auto mb-4 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Scanning network segments...</p>
                </div>
              )}
            </div>
          </section>

          <section className="mb-8 solid-card p-8 rounded-[3rem] relative overflow-hidden bg-gradient-to-br from-[var(--bg-card)] to-[var(--primary)]/5">
            <Ticket size={180} className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none" />
            <h3 className="text-xl font-black text-theme-main uppercase mb-2">Redeem Codes</h3>
            <p className="text-[10px] font-bold text-theme-muted uppercase mb-6 leading-relaxed">Enter a code to unlock points, rank boosts, or premium status.</p>
            <div className="space-y-4">
              <input type="text" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="ENTER CODE..." className="w-full bg-black/40 border-2 border-theme rounded-2xl py-5 px-6 font-mono text-sm tracking-widest text-theme-main outline-none focus:border-theme-primary/40 uppercase" />
              <button onClick={handleRedeemPromo} disabled={!promoInput || isProcessing} className="w-full bg-theme-primary text-theme-contrast py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30">
                ACTIVATE NOW <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
