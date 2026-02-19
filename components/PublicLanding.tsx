import React, { useState, useEffect, useMemo } from 'react';
import { Logo } from './Logo';
import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  History, 
  Globe, 
  Layers,
  Sparkles,
  Check,
  User,
  Fingerprint,
  Tag,
  Info,
  Shield,
  Clock,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  Smartphone,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Users,
  CheckCircle2,
  HelpCircle,
  Network,
  CircleHelp
} from 'lucide-react';
import { DISCOVERY_HUB_APPS, MASTER_UPLINK } from '../constants';
import { triggerHaptic, fetchAppIcon, formatDriveUrl } from '../utils';
import { useHoldToConfirm } from '../hooks/useHoldToConfirm';
import { useApp } from '../store';

interface PublicLandingProps {
  onRegister: (nick: string, pin: string, ref?: string) => void;
  onLogin: () => void;
  onViewGuide: () => void;
  isProcessing?: boolean;
}

interface SignalItem {
  id: string;
  name: string;
  category: string;
  trendScore: number;
  icon: string;
  isCommunity: boolean;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ onRegister, onLogin, onViewGuide, isProcessing }) => {
  const { addToast } = useApp();
  
  // Form State
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [refCode, setRefCode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  
  // Live Signals State
  const [liveSignals, setLiveSignals] = useState<SignalItem[]>([]);
  const [isLoadingSignals, setIsLoadingSignals] = useState(true);
  const [enhancedIcons, setEnhancedIcons] = useState<Record<string, string>>({});

  // Interactive Demo State
  const [demoProgress, setDemoProgress] = useState(0);
  const [isDemoClaimed, setIsDemoClaimed] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoIconIndex, setDemoIconIndex] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  const demoIcons = [
    'https://image2url.com/r2/default/images/1770491023736-6e9ee944-903d-4f53-9db8-9d7945ec8f35.png', 
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/31/45/ae/3145ae77-0c87-5456-00fe-656c1f6f925c/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/200x200ia-75.webp', 
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/91/7a/20/917a206a-9a9f-8557-017e-97621980004c/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png', 
    'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/64/0e/96/640e9603-9112-9c32-1594-555621455219/AppIcon-0-0-1x_U007emarketing-0-6-0-0-85-220.png/512x512bb.png', 
  ];

  // AI & SEO Entity Data
  const entities = [
    "Pi Network", "Bee Network", "Hamster Kombat", "Grass", "Nodle", "Notcoin", "Blum", "TapSwap", "Catizen", "Dogs", "Yescoin"
  ];

  const faqItems = [
    { 
      q: "What is TokenPod?", 
      a: "TokenPod is a professional earning assistant that centralizes Web3 mining cycles and daily rewards into one high-speed dashboard." 
    },
    { 
      q: "Which apps can I track?", 
      a: "You can track Pi Network, Bee Network, Hamster Kombat, Notcoin, Grass, Nodle, and any app with a cycle-based reward system." 
    },
    { 
      q: "Does TokenPod offer or sell cryptocurrency?", 
      a: "No. TokenPod is a tracking and management tool only. We do not sell, offer, or distribute any cryptocurrency." 
    },
    { 
      q: "Is my data secure?", 
      a: "Yes. We use a local-first secure cloud architecture. We never ask for seed phrases, private keys, or emails." 
    },
    { 
      q: "Do I need a PC?", 
      a: "No. TokenPod is a high-performance app designed specifically for mobile hunters." 
    }
  ];

  // 1. Fetch Real Community Data from Database Shards
  useEffect(() => {
    const loadLiveFeed = async () => {
      try {
        const res = await fetch(MASTER_UPLINK, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'FETCH_TRENDING_PUBLIC' })
        });
        const data = await res.json();
        
        if (data.success && data.trendingProjects?.length > 0) {
          const maxCount = Math.max(...data.trendingProjects.map((p: any) => p.count));
          const signals: SignalItem[] = data.trendingProjects.map((p: any, i: number) => ({
            id: `live-${i}`,
            name: p.name,
            category: 'COMMUNITY',
            trendScore: Math.round((p.count / maxCount) * 100),
            icon: p.icon || '',
            isCommunity: true
          }));
          setLiveSignals(signals.slice(0, 5));
        } else {
          const fallback = DISCOVERY_HUB_APPS.slice(0, 5).map(app => ({
            id: app.id,
            name: app.name,
            category: app.category,
            trendScore: app.trendScore,
            icon: app.icon,
            isCommunity: false
          }));
          setLiveSignals(fallback);
        }
      } catch (e) {
        const fallback = DISCOVERY_HUB_APPS.slice(0, 5).map(app => ({
          id: app.id,
          name: app.name,
          category: app.category,
          trendScore: app.trendScore,
          icon: app.icon,
          isCommunity: false
        }));
        setLiveSignals(fallback);
      } finally {
        setIsLoadingSignals(false);
      }
    };

    loadLiveFeed();
  }, []);

  // 2. Resolve High Quality Icons for Live Data
  useEffect(() => {
    if (liveSignals.length === 0) return;

    const resolveIcons = async () => {
      const iconMap: Record<string, string> = {};
      await Promise.all(
        liveSignals.map(async (sig) => {
          if (sig.icon && (sig.icon.includes('.png') || sig.icon.includes('drive.google'))) {
            iconMap[sig.id] = formatDriveUrl(sig.icon);
          } else {
            const official = await fetchAppIcon(sig.name);
            iconMap[sig.id] = official;
          }
        })
      );
      setEnhancedIcons(prev => ({ ...prev, ...iconMap }));
    };
    resolveIcons();
  }, [liveSignals]);

  // Referral Capture
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setRefCode(ref.toUpperCase());
      addToast("Referral Link Detected", "SUCCESS");
      triggerHaptic('medium');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast]);

  useEffect(() => {
    const startTimer = setTimeout(() => setShowDemo(true), 500);
    return () => clearTimeout(startTimer);
  }, []);

  // Demo Loop Animation
  useEffect(() => {
    if (!showDemo || isDemoClaimed || demoProgress >= 100) return;
    const timer = setInterval(() => {
      setDemoProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [showDemo, isDemoClaimed, demoProgress]);

  // Project Morph Logic
  useEffect(() => {
    if (demoProgress > 0 && demoProgress < 100) {
      const morphTimer = setInterval(() => {
        setDemoIconIndex(prev => (prev + 1) % demoIcons.length);
      }, 800);
      return () => clearInterval(morphTimer);
    }
  }, [demoProgress]);

  const handleDemoClaim = () => {
    if (demoProgress < 100) return;
    triggerHaptic('heavy');
    setIsDemoClaimed(true);
    setShowBurst(true);
    
    setTimeout(() => {
      setIsDemoClaimed(false);
      setDemoProgress(0);
      setShowBurst(false);
    }, 2000);
  };

  const getDemoStatusLabel = () => {
    if (isDemoClaimed) return 'SIGNAL SECURED';
    if (demoProgress >= 100) return 'READY TO HARVEST';
    if (demoProgress > 70) return 'SIGNAL ACQUIRED';
    if (demoProgress > 30) return 'CONFIGURING TIMER...';
    return 'SEARCHING APP...';
  };

  const pinsMatch = pin === confirmPin;
  const isFormReady = nickname.length >= 2 && pin.length === 4 && pinsMatch;

  const { holdProgress, handleStart, handleEnd } = useHoldToConfirm(() => {
    if (isFormReady) {
      triggerHaptic('heavy');
      onRegister(nickname, pin, refCode);
    }
  }, 1000);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10">
         <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,33,0.1),transparent_70%)] transition-all duration-[2s] ${demoProgress > 0 && demoProgress < 100 ? 'scale-110 opacity-40 animate-pulse' : 'scale-100 opacity-20'}`} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-8 text-center overflow-hidden">
        <header>
          <div className="flex justify-center mb-10 animate-in zoom-in duration-700">
            <Logo size={90} />
          </div>
          
          <h1 className="text-5xl font-black tracking-tighter mb-6 uppercase leading-[0.9] animate-in slide-in-from-bottom duration-500">
            Stop Missing <br/><span className="text-orange-500">Rewards.</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12 animate-in slide-in-from-bottom duration-700 delay-100">
            The Universal Web3 Earning App Tracker
          </p>
        </header>

        {/* Demo Experience Card */}
        <article className="max-w-xs mx-auto mb-16 animate-in zoom-in duration-500 delay-300">
          <div className={`solid-card rounded-[2.5rem] p-6 border-2 transition-all duration-500 relative ${demoProgress >= 100 ? 'border-orange-500 glow-ready scale-105' : 'border-white/5 opacity-80'}`}>
            
            {showBurst && (
              <div className="absolute inset-0 rounded-[2.5rem] border-4 border-orange-500 animate-[ping_1s_ease-out_infinite] pointer-events-none opacity-50" />
            )}

            {isDemoClaimed && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-orange-500 font-black text-xl animate-[bounce_1s_ease-in-out_infinite]">
                +1P
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 relative">
                {isDemoClaimed ? (
                  <div className="w-full h-full bg-green-500 flex items-center justify-center text-black animate-in zoom-in duration-300">
                    <CheckCircle2 size={24} strokeWidth={3} />
                  </div>
                ) : (
                  <img 
                    key={demoIconIndex}
                    src={demoIcons[demoIconIndex]} 
                    className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in" 
                    alt="App Icon" 
                  />
                )}
              </div>
              <div className="text-left">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Live Speed Test</h3>
                <p className={`text-[10px] font-black uppercase tracking-tight transition-colors duration-300 ${demoProgress >= 100 ? 'text-orange-500 animate-pulse' : 'text-slate-500'}`}>
                  {getDemoStatusLabel()}
                </p>
              </div>
            </div>
            
            <div className="mb-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-300 ${isDemoClaimed ? 'bg-green-500' : 'bg-orange-500 shadow-[0_0_15px_rgba(255,122,33,0.5)]'}`} 
                 style={{ width: `${demoProgress}%` }} 
               />
            </div>

            <button 
              onClick={handleDemoClaim}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${demoProgress >= 100 ? 'bg-orange-500 text-black shadow-xl shadow-orange-500/20 active:scale-95' : 'bg-white/5 text-white/20 pointer-events-none'}`}
            >
              {isDemoClaimed ? 'HARVEST SUCCESS' : demoProgress >= 100 ? 'HARVEST NOW' : `SYNCING... ${Math.round(demoProgress)}%`}
            </button>
          </div>
          <p className="mt-4 text-[8px] font-black text-slate-600 uppercase tracking-widest">Experience the Instant Harvest System</p>
        </article>

        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <button 
            onClick={() => { triggerHaptic('light'); document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl"
          >
            Sign Up <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => { triggerHaptic('light'); onLogin(); }}
            className="w-full bg-white/5 border-2 border-orange-500/50 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/5"
          >
            <History size={16} /> Sign In
          </button>
        </div>
      </section>

      {/* AI OPTIMIZATION: Entity-Rich Directory */}
      <section className="px-6 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-500 mb-2">Supported Ecosystem</h2>
          <p className="text-2xl font-black uppercase tracking-tighter">Smart <span className="text-slate-400">Integrations.</span></p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {entities.map(entity => (
            <span key={entity} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-300 uppercase tracking-tight hover:border-orange-500/50 hover:text-white transition-all cursor-default">
              {entity}
            </span>
          ))}
          <span className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-black text-orange-500 uppercase tracking-tight">+ Universal Support</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <article className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
              <MessageSquare className="mx-auto mb-3 text-blue-400" size={24} />
              <h4 className="text-[10px] font-black uppercase tracking-tight text-white">Telegram Bots</h4>
              <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Notcoin, Hamster, Dogs</p>
           </article>
           <article className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
              <LayoutGrid className="mx-auto mb-3 text-emerald-400" size={24} />
              <h4 className="text-[10px] font-black uppercase tracking-tight text-white">Node Mining</h4>
              <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Grass, Xenea, Nodle</p>
           </article>
        </div>
      </section>

      {/* Live Community Feed */}
      <section className="px-6 mb-24">
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5 shadow-2xl">
          <header className="p-4 bg-white/5 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Global Community Signal Feed</h2>
          </header>
          
          {isLoadingSignals ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-slate-700" size={32} />
              <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Scanning Database...</p>
            </div>
          ) : (
            liveSignals.map((sig) => {
              const iconUrl = enhancedIcons[sig.id];
              return (
                <article key={sig.id} className="p-5 flex items-center gap-5 group hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-xl flex items-center justify-center p-[1px] relative">
                    {!iconUrl ? (
                      <Loader2 size={16} className="text-slate-300 animate-spin" />
                    ) : (
                      <img 
                        src={iconUrl} 
                        alt={`${sig.name} Icon`} 
                        className="w-full h-full object-cover rounded-[0.85rem] transition-all duration-700 group-hover:scale-110" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${sig.name}`;
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black uppercase tracking-tight truncate text-white">{sig.name}</h3>
                      {sig.isCommunity && <Users size={10} className="text-blue-500 opacity-50" />}
                    </div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight line-clamp-1">
                      {sig.category} SIGNAL
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-orange-500 uppercase mb-0.5">ACTIVE</p>
                    <p className="text-[10px] font-black tabular-nums">{sig.trendScore}%</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* AI & User FAQ Section */}
      <section className="px-8 mb-32 bg-white/[0.02] py-20 border-y border-white/5">
        <div className="max-w-md mx-auto">
          <header className="text-center mb-12">
            <CircleHelp className="text-blue-500 mx-auto mb-4" size={32} />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Common Questions</h2>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">App FAQs</p>
          </header>

          <div className="space-y-6">
            {faqItems.map((item, i) => (
              <article key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-[11px] font-black uppercase text-white mb-3 flex items-center gap-3">
                  <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center text-[8px]">Q</span>
                  {item.q}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed border-l-2 border-slate-800 pl-4">
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Manifesto */}
      <section className="px-8 space-y-24 mb-32">
        <article className="text-center">
          <Shield className="text-orange-500 mb-6 mx-auto" size={40} />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Privacy Manifesto</h2>
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
            <div className="grid grid-cols-1 gap-6">
               <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><Check size={20} /></div>
                  <p className="text-[10px] font-black uppercase tracking-tight">Zero Email/Tracking</p>
               </div>
               <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><Check size={20} /></div>
                  <p className="text-[10px] font-black uppercase tracking-tight">No Private Keys Needed</p>
               </div>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed text-left border-t border-white/5 pt-8">
              TokenPod uses a local-first secure cloud. Your data is encrypted and synced only for multi-device support.
            </p>
          </div>
        </article>
      </section>

      {/* Registration Section */}
      <section id="setup" className="px-8 pb-40">
        <header className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tighter mt-6">Create Vault</h2>
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em] mt-2">Start Security</p>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-2xl relative">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-500 ml-4 tracking-widest uppercase">Pick a Nickname</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={nickname} 
                onChange={e => setNickname(e.target.value.toUpperCase())} 
                placeholder="USERNAME" 
                className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-orange-500/30 text-[11px] font-bold text-white transition-all" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-500 ml-4 tracking-widest uppercase">Set 4-Digit PIN</label>
            <div className="relative">
              <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type={showPin ? "text" : "password"} 
                maxLength={4} 
                value={pin} 
                onChange={e => setPin(e.target.value.replace(/\D/g,''))} 
                placeholder="****" 
                className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 pr-14 outline-none focus:border-orange-500/30 text-center text-3xl font-bold tracking-[0.8em] text-orange-500 transition-all" 
              />
              <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {pin.length === 4 && (
            <div className="space-y-3 animate-in slide-in-from-top duration-300">
              <label className={`text-[9px] font-black ml-4 tracking-widest uppercase ${!pinsMatch && confirmPin.length === 4 ? 'text-red-500' : 'text-slate-500'}`}>Confirm PIN</label>
              <div className="relative">
                <input 
                  type={showConfirmPin ? "text" : "password"} 
                  maxLength={4} 
                  value={confirmPin} 
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g,''))} 
                  placeholder="****" 
                  className={`w-full bg-black border rounded-2xl py-5 pr-14 text-center text-3xl font-bold tracking-[0.8em] outline-none transition-all ${!pinsMatch && confirmPin.length === 4 ? 'border-red-500 text-red-500' : 'border-white/10 focus:border-orange-500/30'}`} 
                />
                <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">
                  {showConfirmPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              onMouseDown={handleStart} onMouseUp={handleEnd} onMouseLeave={handleEnd}
              onTouchStart={handleStart} onTouchEnd={handleEnd}
              disabled={!isFormReady || isProcessing}
              className="w-full relative overflow-hidden bg-orange-500 text-black py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-30 transition-all"
            >
              <div className="absolute inset-0 bg-white/30" style={{ width: `${holdProgress}%` }} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isProcessing ? 'SYNCING...' : holdProgress > 0 ? `SECURING ${Math.round(holdProgress)}%` : 'Hold to Sign Up'}
              </span>
            </button>
          </div>
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/90 to-transparent z-[100] flex flex-col items-center">
         <button 
           onClick={() => { triggerHaptic('medium'); onViewGuide(); }}
           className="text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] mb-4 hover:text-white transition-colors"
         >
           View App Guide
         </button>
         <div className="flex items-center gap-4 opacity-30">
            <Network size={12} className="text-slate-600" />
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-600">Version 16.9 Secure Network</span>
         </div>
      </footer>
    </main>
  );
};