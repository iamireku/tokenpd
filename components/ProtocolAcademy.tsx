
import React from 'react';
import { 
  ChevronLeft, 
  BookOpen, 
  Zap, 
  Link2, 
  Target, 
  LayoutGrid, 
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  Share,
  PlusSquare,
  Coins
} from 'lucide-react';
import { useApp } from '../store';
import { triggerHaptic } from '../utils';

export const ProtocolAcademy: React.FC = () => {
  const { state, setView } = useApp();

  const handleBack = () => {
    triggerHaptic('light');
    if (state.previousView) {
      setView(state.previousView);
    } else {
      if (!state.isInitialized) {
        setView('DASHBOARD');
      } else {
        setView('SETTINGS');
      }
    }
  };

  const getPreviousViewLabel = () => {
    const pv = state.previousView;
    if (!pv) return state.isInitialized ? 'Settings' : 'Landing';
    
    switch(pv) {
      case 'DASHBOARD': return state.isInitialized ? 'Dashboard' : 'Landing';
      case 'SETTINGS': return 'Settings';
      case 'LAB': return 'Growth Lab';
      case 'CREATE': return 'Pod Setup';
      case 'ECONOMY': return 'Points Hub';
      case 'CONTACT': return 'Support';
      case 'FOCUS': return 'Focus Mode';
      default: return 'Previous Screen';
    }
  };

  const StepCard = ({ number, title, desc, icon: Icon }: any) => (
    <div className="solid-card rounded-[2.5rem] p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center font-black text-[var(--primary)] text-sm">{number}</div>
          <h3 className="font-black tracking-tight text-theme-main text-sm">{title}</h3>
        </div>
        <p className="text-[11px] font-bold text-theme-muted tracking-tight leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-3xl pb-40 pt-6 relative animate-in fade-in slide-in-from-right duration-300 overflow-x-hidden transition-colors duration-500">
      <div className="max-w-lg mx-auto">
        <header className="sticky-header-capsule border-[var(--primary)] shadow-xl">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 bg-[var(--bg-card)] rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] active:scale-90 transition-all"><ChevronLeft size={24} strokeWidth={3} /></button>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-50 leading-none">App Guide</h1>
              <p className="text-[var(--primary)] text-[8px] font-black uppercase tracking-[0.2em] mt-1">Tutorial Hub</p>
            </div>
          </div>
        </header>

        <div className="px-6 pt-10 space-y-12">
          <section className="text-center space-y-4">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--primary)]">
              <BookOpen size={32} />
            </div>
            {/* Updated title to use explicit Contrast Protocol (Slate-50 in dark mode) */}
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tighter uppercase">How TokenPod Works</h2>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-8">A simple guide to earning rewards</p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">Pro Setup</h2>
              <div className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 text-[7px] font-black uppercase tracking-widest animate-pulse">Recommended</div>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group mb-4">
               <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Smartphone size={150} />
               </div>
               <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">Native App Experience</h3>
                  <p className="text-[11px] font-bold opacity-90 leading-relaxed mb-6">
                    TokenPod works best as an installed app. Installing eliminates browser bars, enables faster syncing, and unlocks exclusive rewards.
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                       <Coins size={20} className="mx-auto mb-2 text-yellow-400" />
                       <p className="text-[8px] font-black uppercase">+50P Bonus</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                       <Zap size={20} className="mx-auto mb-2 text-yellow-400" />
                       <p className="text-[8px] font-black uppercase">+5% Speed</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="solid-card rounded-[2.5rem] p-6 border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Smartphone size={20} />
                  </div>
                  <h4 className="font-black text-xs uppercase text-theme-main">Android Setup</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                    <p className="text-[10px] font-bold text-theme-muted uppercase leading-tight">Open <span className="text-theme-main">Chrome Browser</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                    <p className="text-[10px] font-bold text-theme-muted uppercase leading-tight">Tap the <span className="text-theme-main">Menu (3 dots)</span> at the top right</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                    <p className="text-[10px] font-bold text-theme-muted uppercase leading-tight">Select <span className="text-theme-main">"Install App"</span></p>
                  </div>
                </div>
              </div>

              <div className="solid-card rounded-[2.5rem] p-6 border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Smartphone size={20} />
                  </div>
                  <h4 className="font-black text-xs uppercase text-theme-main">iOS Setup</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                    <p className="text-[10px] font-bold text-theme-muted uppercase leading-tight">Open <span className="text-theme-main">Safari Browser</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-theme-muted uppercase leading-tight mb-2">Tap the <span className="text-theme-main">Share Button</span></p>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600">
                        <Share size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-theme-muted uppercase leading-tight mb-2">Select <span className="text-theme-main">"Add to Home Screen"</span></p>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900">
                        <PlusSquare size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] px-2">The 4 Simple Steps</h2>
            <div className="grid grid-cols-1 gap-4">
              <StepCard 
                number="01" 
                title="Pod Setup" 
                desc="Enter the app name and pick a timer. You can track multiple tasks (like Mining and a Node) inside one single dashboard entry."
                icon={LayoutGrid}
              />
              <StepCard 
                number="02" 
                title="Timer Tracking" 
                desc="Green means the app is growing. Pulsing Orange means it's ready in 5 minutes. Solid Orange means it's time to harvest."
                icon={Target}
              />
              <StepCard 
                number="03" 
                title="Claiming Rewards" 
                desc="Tap Harvest to instantly open your app. Only the timers that are ready will reset."
                icon={Zap}
              />
              <StepCard 
                number="04" 
                title="Fixing Sync" 
                desc="If your other app shows a different time, use Sync to enter the remaining minutes and fix the TokenPod timer."
                icon={Link2}
              />
            </div>
          </section>

          <section className="bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] p-8">
             <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-orange-500" size={20} />
                <h3 className="text-[11px] font-black uppercase text-orange-600 tracking-widest">Monthly Point Sync</h3>
             </div>
             <p className="text-[10px] font-bold text-orange-800/80 tracking-tight leading-relaxed">
               TokenPod is an active app. At the start of every month, points drop by 10%. Spend your points in the Growth Lab to upgrade your rank.
             </p>
          </section>

          <button 
            onClick={handleBack}
            className="w-full bg-[var(--primary)] text-[var(--primary-contrast)] py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
          >
            Return to {getPreviousViewLabel()}
          </button>
        </div>
      </div>
    </div>
  );
};
