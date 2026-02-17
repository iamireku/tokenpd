
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store';
import { DISCOVERY_HUB_APPS } from '../constants';
import { 
  Users, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Radar, 
  Lock, 
  Unlock, 
  Coins, 
  Copy, 
  Link as LinkIcon, 
  Check, 
  Share2, 
  Loader2, 
  Key, 
  ChevronDown,
  ExternalLink,
  Target,
  Wifi,
  Signal,
  X,
  Radio,
  TrendingUp,
  BarChart3,
  Eye,
  ScanSearch,
  Tag,
  Crown,
  AlertTriangle,
  Info,
  Shield,
  ThumbsUp,
  GanttChart,
  Ticket,
  ArrowRight,
  Plus,
  RefreshCw,
  Activity,
  Handshake,
  UserPlus,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { triggerHaptic, hasPremiumBenefits, getSmartLaunchUrl, fetchAppIcon, formatDriveUrl } from '../utils';

export const GrowthLab: React.FC = () => {
  const { state, setView, igniteSpark, lastSparkAt, rechargeSpark, unlockDiscovery, unlockAnalytics, redeemCode, claimReferralCode, isSyncing, addToast, triggerLaunch, isProcessing, forceSync, setEditingAppId, setPrefillApp } = useApp();
  
  // State for resolved high-quality community icons
  const [enhancedIcons, setEnhancedIcons] = useState<Record<string, string>>({});
  
  const [copyStatus, setCopyStatus] = useState<'NONE' | 'CODE' | 'LINK'>('NONE');
  const [promoInput, setPromoInput] = useState('');
  const [referrerInput, setReferrerInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReferralExpanded, setIsReferralExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  const canSpark = !lastSparkAt || (Date.now() - lastSparkAt > 86400000);
  const hasBenefits = hasPremiumBenefits(state.isPremium, state.rank);

  // 1. Resolve High Quality Icons for Global Pulse (The Creation Engine System)
  useEffect(() => {
    const projects = state.trendingProjects || [];
    if (projects.length === 0) return;

    const resolveIcons = async () => {
      const iconMap: Record<string, string> = {};
      await Promise.all(
        projects.map(async (project) => {
          // If already resolved or hardcoded in constants, skip fetch
          const localApp = DISCOVERY_HUB_APPS.find(a => a.name.toUpperCase() === project.name.toUpperCase());
          if (localApp) {
            iconMap[project.name] = formatDriveUrl(localApp.icon);
            return;
          }

          // Otherwise, fetch official logo
          const official = await fetchAppIcon(project.name);
          iconMap[project.name] = official;
        })
      );
      setEnhancedIcons(prev => ({ ...prev, ...iconMap }));
    };
    resolveIcons();
  }, [state.trendingProjects]);

  const topTrending = useMemo(() => {
    const backendStats = state.trendingProjects || [];
    if (backendStats.length === 0) return [];
    
    const maxCount = Math.max(...backendStats.map(p => p.count), 1);

    return backendStats.slice(0, 6).map((project, index) => {
      const trendScore = Math.round((project.count / maxCount) * 100);
      const localApp = DISCOVERY_HUB_APPS.find(a => a.name.toUpperCase() === project.name.toUpperCase());
      const isAlreadyTracked = state.apps.some(a => a.name.toUpperCase() === project.name.toUpperCase());
      
      return {
        id: `trend-${index}`,
        name: project.name,
        // Use the enhancedIcon if available, fallback to dicebear
        icon: enhancedIcons[project.name] || project.icon || localApp?.icon || `https://api.dicebear.com/7.x/identicon/svg?seed=${project.name}`,
        activeUsers: localApp?.activeUsers || `${Math.floor(project.count * 1.5)}K+`,
        trendScore,
        isPartner: localApp?.isPartner || false,
        rank: index + 1,
        isAlreadyTracked
      };
    });
  }, [state.trendingProjects, state.apps, enhancedIcons]);

  const handleCopyCode = () => {
    triggerHaptic('medium');
    navigator.clipboard.writeText(state.referralCode);
    setCopyStatus('CODE');
    setTimeout(() => setCopyStatus('NONE'), 2000);
    addToast("Code Copied", "SUCCESS");
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

  const handleClaimReferrer = async () => {
    if (referrerInput.length < 5) {
      addToast('Invalid Referral Code', "ERROR");
      return;
    }
    triggerHaptic('heavy');
    const { success } = await claimReferralCode(referrerInput.toUpperCase());
    if (success) {
      setReferrerInput('');
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
    const interval = 50;
    const steps = duration / interval;

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
    }, interval);
  };

  const handleTrackProject = (project: any) => {
    triggerHaptic('medium');
    addToast(`Initializing ${project.name} Pod`, "SUCCESS");
    setPrefillApp({ name: project.name, icon: project.icon });
    setView('CREATE');
  };

  const toggleReferral = () => {
    triggerHaptic('light');
    setIsReferralExpanded(!isReferralExpanded);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-transparent pb-40 pt-6 overflow-x-hidden">
      <div className="max-w-lg mx-auto relative">
        <header className={`sticky-header-capsule ${isScrolled ? 'header-scrolled' : ''}`}>
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-sm font-black tracking-tight text-theme-main uppercase leading-none">Growth Lab</h1>
              <p className="text-theme-muted font-black text-[8px] tracking-[0.2em] uppercase mt-1">Intelligence Hub</p>
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
          {/* DYOR Protocol Disclaimer Card */}
          <section className="mb-8">
            <div className="bg-slate-900 border-2 border-orange-500/20 rounded-[2.5rem] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-[2s]">
                  <ShieldAlert size={100} className="text-orange-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert size={16} className="text-orange-500" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Signal Intelligence</h2>
                  </div>
                  <p className="text-[11px] font-bold text-slate-300 uppercase leading-relaxed">
                    TokenPod is a tracking utility. Only <span className="text-theme-primary font-black underline">Verified Signals</span> are audited by our team. All other discovery projects are external. Always perform your own research before sharing data.
                  </p>
                </div>
            </div>
          </section>

          {/* Referral (Collapsible Interface) */}
          <section className="mb-8">
            <div className="solid-card rounded-[2.5rem] overflow-hidden border-2 border-theme-primary/10 transition-all duration-300">
                <div 
                  onClick={toggleReferral}
                  className="p-6 flex items-center justify-between cursor-pointer active:bg-theme-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-theme-primary/10 flex items-center justify-center text-theme-primary border border-theme-primary/20">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-theme-main uppercase tracking-tight">Referral </h3>
                      <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest mt-1">Invite Friends & Claim 50P</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full bg-theme-main/50 transition-transform duration-300 ${isReferralExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} className="text-theme-muted" />
                  </div>
                </div>

                {isReferralExpanded && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top duration-300">
                    {/* Big Code Display */}
                    <div className="bg-theme-main/30 border border-theme-primary/10 rounded-2xl p-5 text-center mb-4">
                      <p className="text-[7px] font-black text-theme-muted uppercase tracking-[0.3em] mb-2">Your Unique Code</p>
                      <p className="text-2xl font-black text-theme-primary tracking-[0.2em] selectable-data">{state.referralCode}</p>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopyCode(); }}
                        className="bg-theme-card border border-theme-primary/20 text-theme-main py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        {copyStatus === 'CODE' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {copyStatus === 'CODE' ? 'COPIED' : 'COPY CODE'}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(); }}
                        className="bg-theme-primary text-theme-contrast py-4 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-theme-primary/20"
                      >
                        <Share2 size={14} /> SHARE LINK
                      </button>
                    </div>

                    {/* Claim Incoming Referral */}
                    {!state.referredBy && (
                      <div className="pt-6 border-t border-theme-muted/5">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag size={12} className="text-orange-500" />
                          <h4 className="text-[9px] font-black text-theme-muted uppercase tracking-widest">Incoming Bonus</h4>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={referrerInput}
                            onChange={(e) => setReferrerInput(e.target.value.toUpperCase())}
                            placeholder="PASTE FRIEND'S CODE..."
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-theme-main/50 border border-theme-muted/10 rounded-xl py-3 px-4 text-[10px] font-black text-theme-main outline-none focus:border-theme-primary/30"
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleClaimReferrer(); }}
                            disabled={isProcessing || referrerInput.length < 5}
                            className="bg-orange-500 text-black px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-30"
                          >
                            CLAIM
                          </button>
                        </div>
                      </div>
                    )}

                    {state.referredBy && (
                      <div className="pt-6 border-t border-theme-muted/5 flex items-center justify-center gap-2 text-green-500/60 font-black text-[8px] uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Referral Bonus Applied
                      </div>
                    )}
                  </div>
                )}
            </div>
          </section>

          {/* Daily Spark */}
          <div className="mb-8 solid-card p-8 rounded-[3rem] border-theme-primary/10 flex flex-col items-center text-center relative overflow-hidden group">
            <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-6 shadow-xl transition-all ${canSpark ? 'bg-theme-primary border-theme-primary/20 shadow-theme-primary/40' : 'bg-slate-800 border-slate-700 shadow-none'}`}>
              <Zap className={`${canSpark ? 'text-theme-contrast' : 'text-slate-500'}`} size={32} />
            </div>
            <h2 className="text-xl font-black text-theme-main uppercase tracking-tight mb-2 text-glow">Daily Spark</h2>
            <p className="text-[11px] font-bold text-theme-muted uppercase tracking-widest mb-6 px-4 leading-relaxed">
              Boost your daily points (+{hasBenefits ? '6' : '3'} P)
            </p>
            
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={igniteSpark}
                disabled={!canSpark || isProcessing}
                className={`w-full py-5 rounded-[2rem] font-black text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-3 uppercase shadow-xl ${canSpark && !isProcessing ? 'bg-theme-primary text-theme-contrast hover:opacity-90 shadow-theme-primary/20' : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-white/5'}`}
              >
                {isProcessing ? 'SYNCING...' : canSpark ? 'IGNITE NOW' : 'RECHARGING...'} <Sparkles size={18} />
              </button>

              {!canSpark && (
                <button 
                  disabled={isProcessing}
                  onClick={handleStartAd}
                  className="w-full bg-slate-950 text-slate-300 py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 uppercase hover:bg-black transition-all disabled:opacity-30 disabled:pointer-events-none border border-white/5"
                >
                  <Wifi size={14} className="text-theme-primary" /> {hasBenefits ? 'Instant Recharge' : 'Watch Ad to Recharge'}
                </button>
              )}
            </div>
          </div>

          {/* Global Pulse (Community Trends) */}
          <section className="mb-8 px-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <TrendingUp size={18} className="text-theme-primary" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-theme-muted">Global Pulse</h2>
              </div>
              {isProcessing && <Loader2 size={12} className="animate-spin text-theme-muted" />}
            </div>
            
            <div className="bg-theme-card rounded-[2.5rem] border border-theme overflow-hidden divide-y divide-white/5 shadow-2xl relative">
              {topTrending.map((app, index) => (
                <div key={app.id} className="p-5 flex items-center gap-5 transition-all relative group/item hover:bg-theme-primary/5">
                  <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-xl flex items-center justify-center p-[1px] relative">
                    {!enhancedIcons[app.name] && !app.icon.includes('.png') ? (
                      <Loader2 size={16} className="text-slate-300 animate-spin" />
                    ) : (
                      <img 
                        src={app.icon} 
                        alt={app.name} 
                        className="w-full h-full object-cover rounded-[0.85rem] transition-all duration-700 group-hover/item:scale-110" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${app.name}`;
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[11px] font-black uppercase tracking-tight text-theme-main truncate">{app.name}</h4>
                      {app.isPartner ? (
                        <ShieldCheck size={10} className="text-theme-primary" />
                      ) : (
                        <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          <AlertTriangle size={8} className="text-orange-400" />
                          <span className="text-[6px] font-black text-slate-400 uppercase">DYOR</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-theme-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" style={{ width: `${app.trendScore}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {app.isAlreadyTracked ? (
                      <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                          <Check size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleTrackProject(app)}
                        className="bg-theme-primary text-theme-contrast px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-theme-primary/10 active:scale-90 transition-all flex items-center gap-1.5"
                      >
                        <Plus size={12} /> Track
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {topTrending.length === 0 && (
                <div className="p-10 text-center opacity-30">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em]">Aggregating Intelligence...</p>
                </div>
              )}
            </div>
          </section>

          {/* Verified Signals (Discovery) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <ScanSearch size={18} className="text-theme-primary" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-theme-muted">Verified Signals</h2>
              </div>
            </div>
            <div className="space-y-4">
              {DISCOVERY_HUB_APPS.map(app => {
                const isUnlocked = state.unlockedDiscoveryIds.includes(app.id);
                const isAlreadyTracked = state.apps.some(a => a.name.toUpperCase() === app.name.toUpperCase());
                const iconUrl = formatDriveUrl(app.icon);
                
                return (
                  <div key={app.id} className={`solid-card rounded-[2.5rem] p-6 transition-all duration-500 overflow-hidden relative group ${isUnlocked ? 'border-theme-primary/30 bg-theme-primary/10' : 'bg-theme-card'}`}>
                    <div className="flex items-start gap-5 relative z-10">
                      <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-xl flex items-center justify-center p-[1px] relative group-hover:scale-105 transition-transform">
                        <img 
                          src={iconUrl} 
                          alt={app.name} 
                          className="w-full h-full object-cover rounded-[1.1rem]" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${app.name}`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-black text-theme-main uppercase tracking-tight truncate">{app.name}</h4>
                          {app.isPartner && (
                            <div className="flex items-center gap-1 bg-theme-primary/10 px-2 py-0.5 rounded-full border border-theme-primary/20">
                              <ShieldCheck size={10} className="text-theme-primary" />
                              <span className="text-[7px] font-black text-theme-primary uppercase">PARTNER</span>
                            </div>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest border ${app.category === 'NODE' ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-theme-primary text-theme-primary bg-theme-primary/10'}`}>
                            {app.category}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-theme-muted uppercase tracking-tight leading-relaxed mb-4 line-clamp-2">{app.description}</p>
                        
                        {isUnlocked ? (
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                {isAlreadyTracked ? (
                                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1"><Check size={10} /> In Dashboard</span>
                                ) : (
                                  <button 
                                    onClick={() => handleTrackProject(app)}
                                    className="text-[8px] font-black text-theme-primary uppercase tracking-widest flex items-center gap-1"
                                  >
                                    <Plus size={10} /> Add to Feed
                                  </button>
                                )}
                            </div>
                            <button 
                              disabled={isProcessing}
                              onClick={() => triggerLaunch(app.name, app.officialUrl)} 
                              className="text-theme-primary text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                            >
                              Visit Site <ExternalLink size={10} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            disabled={isProcessing}
                            onClick={() => unlockDiscovery(app.id, app.cost)}
                            className="w-full bg-theme-primary text-theme-contrast py-4 rounded-2xl font-black text-[9px] tracking-widest uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all shadow-theme-primary/20"
                          >
                            <Lock size={14} /> Unlock Tracking ({app.cost}P)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bonus Codes (Protocol Activation) */}
          <section className="mb-8 solid-card p-8 rounded-[3rem] group overflow-hidden relative border-theme-primary/10 bg-gradient-to-br from-[var(--bg-card)] to-[var(--primary)]/5">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <Ticket size={180} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={14} className="text-theme-primary" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Rewards & Bonuses</h2>
              </div>
              <h3 className="text-xl font-black text-theme-main tracking-tighter uppercase mb-2">Redeem Codes</h3>
              <p className="text-[10px] font-bold text-theme-muted uppercase tracking-tight leading-relaxed mb-6">
                  Enter a code to unlock points, rank boosts, or premium status.
              </p>
              
              <div className="space-y-4">
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                    <input 
                      type="text" 
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE..."
                      disabled={isProcessing}
                      className="w-full bg-black/40 border-2 border-theme rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-theme-primary/40 font-mono text-sm tracking-widest text-theme-main uppercase transition-all placeholder:text-theme-muted/30"
                    />
                  </div>
                  <button 
                    onClick={handleRedeemPromo}
                    disabled={!promoInput || isProcessing}
                    className="w-full bg-theme-primary text-theme-contrast py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-xl shadow-theme-primary/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {isProcessing ? 'Processing...' : 'ACTIVATE NOW'} <ArrowRight size={16} />
                  </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
