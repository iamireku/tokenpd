
import React from 'react';
import { 
  ChevronLeft, 
  BookOpen, 
  Zap, 
  RotateCcw, 
  Link2, 
  Target, 
  Clock, 
  Calendar, 
  LayoutGrid, 
  Trophy, 
  AlertTriangle,
  Info,
  Activity,
  ShieldAlert,
  GraduationCap,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useApp } from '../store';
import { triggerHaptic } from '../utils';

export const ProtocolAcademy: React.FC = () => {
  const { state, setView } = useApp();

  const handleBack = () => {
    triggerHaptic('light');
    if (!state.isInitialized) {
      setView('DASHBOARD');
    } else {
      setView('SETTINGS');
    }
  };

  const StepCard = ({ number, title, desc, icon: Icon, color = "text-[var(--primary)]" }: any) => (
    <div className="solid-card rounded-[2.5rem] p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center font-black text-[var(--primary)] text-sm">{number}</div>
          <h3 className="font-black tracking-tight text-[var(--text-main)] text-sm">{title}</h3>
        </div>
        <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="pb-40 pt-6 min-h-screen bg-slate-50/80 dark:bg-transparent relative animate-in fade-in slide-in-from-right duration-300 overflow-x-hidden">
      <div className="max-w-lg mx-auto">
        <header className="sticky-header-capsule border-[var(--primary)] shadow-xl">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 bg-[var(--bg-card)] rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] active:scale-90 transition-all"><ChevronLeft size={24} strokeWidth={3} /></button>
            <div>
              <h1 className="text-sm font-black tracking-tight text-[var(--text-main)] leading-none">App Guide</h1>
              <p className="text-[var(--primary)] text-[8px] font-black uppercase tracking-[0.2em] mt-1">Tutorial Hub</p>
            </div>
          </div>
        </header>

        <div className="px-6 pt-10 space-y-12">
          {/* Intro Section */}
          <section className="text-center space-y-4">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--primary)]">
              <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter">How TokenPod Works</h2>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-8">A simple guide to earning rewards</p>
          </section>

          {/* The Lifecycle */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] px-2">The 4 Simple Steps</h2>
            <div className="grid grid-cols-1 gap-4">
              <StepCard 
                number="01" 
                title="App Setup" 
                desc="Enter the app name and pick a timer. You can track multiple tasks (like Mining and a Node) inside one single dashboard entry."
                icon={LayoutGrid}
              />
              <StepCard 
                number="02" 
                title="Timer Tracking" 
                desc="Green means the app is growing. Pulsing Orange means it's ready in 5 minutes. Solid Orange means it's time to claim."
                icon={Target}
              />
              <StepCard 
                number="03" 
                title="Claiming Points" 
                desc="Tap Claim to earn points and instantly open your app. Only the timers that are ready will reset."
                icon={Zap}
              />
              <StepCard 
                number="04" 
                title="Fixing Drift" 
                desc="If your other app shows a different time, use Sync to enter the remaining minutes and fix the TokenPod timer."
                icon={Link2}
              />
            </div>
          </section>

          {/* THE RESEARCH PROTOCOL (New Card) */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 px-2">Safety Protocol</h2>
            <div className="bg-slate-900 border-2 border-orange-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Search size={140} className="text-orange-500" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                      <Search size={24} />
                    </div>
                    <h3 className="font-black tracking-tight text-white text-sm uppercase">The Research Protocol</h3>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 tracking-tight leading-relaxed mb-4">
                    Not every signal is safe. TokenPod is a utility for tracking time, not for auditing project security.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={14} className="text-theme-primary shrink-0" />
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-tight">Verified Signals are vetted by our team.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShieldAlert size={14} className="text-orange-500 shrink-0" />
                      <p className="text-[10px] font-black text-slate-200 uppercase tracking-tight">External signals require full DYOR.</p>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* THE GOLDEN RULE & FAILED EXTERNAL CLAIMS */}
          <section className="space-y-4">
            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-black shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                  <ShieldAlert size={120} />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={20} fill="black" />
                    <h3 className="font-black uppercase text-xs tracking-widest">The Golden Rule</h3>
                 </div>
                 <p className="text-sm font-black mb-3">
                   Always claim via TokenPod.
                 </p>
                 <p className="text-[11px] font-bold leading-relaxed opacity-90">
                   Opening your reward app directly causes <span className="font-black underline">Timer Drift</span>. If you claim manually, your TokenPod countdown will mismatch. You must use the <span className="font-black italic">Sync</span> feature to fix it.
                 </p>
               </div>
            </div>

            <div className="solid-card rounded-[2.5rem] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <Activity size={120} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Activity size={20} />
                    </div>
                    <h3 className="font-black tracking-tight text-[var(--text-main)] text-sm">Failed External Claims</h3>
                  </div>
                  <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-tight leading-relaxed">
                    If a claim fails in the external app after you pressed claim, immediately <span className="text-[var(--primary)] font-black">Reset</span> or <span className="text-[var(--primary)] font-black">Sync</span> the time on TokenPod to keep your dashboard accurate.
                  </p>
               </div>
            </div>
          </section>

          {/* Engine Types */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] px-2">Timer Types</h2>
            <div className="bg-[var(--bg-card)] rounded-[3rem] border border-[var(--primary)]/20 p-8 space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0"><Clock size={24} /></div>
                <div>
                  <h4 className="text-[11px] font-black text-[var(--text-main)] mb-1">Countdown</h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-tight leading-relaxed">The timer starts again from zero only after you claim your points. Good for flexible apps.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0"><LayoutGrid size={24} /></div>
                <div>
                  <h4 className="text-[11px] font-black text-[var(--text-main)] mb-1">Scheduled Blocks</h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-tight leading-relaxed">The day is split into fixed blocks (like every 4h). It doesn't matter when you claim, the next window stays the same.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shrink-0"><Calendar size={24} /></div>
                <div>
                  <h4 className="text-[11px] font-black text-[var(--text-main)] mb-1">Once a Day</h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-tight leading-relaxed">Simple daily reset at midnight (00:00). Best for apps with one check-in a day.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Economy Warning */}
          <section className="bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] p-8">
             <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-orange-500" size={20} />
                <h3 className="text-[11px] font-black uppercase text-orange-600 tracking-widest">Monthly Point Reset</h3>
             </div>
             <p className="text-[10px] font-bold text-orange-800/80 tracking-tight leading-relaxed">
               TokenPod is an active app. At the start of every month, points drop by 10%. Spend your points in the Growth Lab to upgrade your rank and keep your status.
             </p>
          </section>

          {/* Ranks */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] px-2">Account Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="solid-card p-6 rounded-[2rem] text-center border-slate-800">
                 <span className="text-[8px] font-black text-slate-500 block mb-1 uppercase">0 - 99P</span>
                 <h4 className="text-[11px] font-black">Member</h4>
              </div>
              <div className="solid-card p-6 rounded-[2rem] text-center border-blue-500/30">
                 <span className="text-[8px] font-black text-blue-500 block mb-1 uppercase">100 - 499P</span>
                 <h4 className="text-[11px] font-black text-blue-500">Pro</h4>
              </div>
              <div className="solid-card p-6 rounded-[2rem] text-center border-purple-500/30">
                 <span className="text-[8px] font-black text-purple-500 block mb-1 uppercase">500 - 999P</span>
                 <h4 className="text-[11px] font-black text-purple-500">Elite</h4>
              </div>
              <div className="solid-card p-6 rounded-[2rem] text-center border-orange-500/50 bg-orange-500/5">
                 <span className="text-[8px] font-black text-orange-500 block mb-1 uppercase">1000P+</span>
                 <h4 className="text-[11px] font-black text-orange-500">Visionary</h4>
              </div>
            </div>
            <p className="text-[9px] font-black text-center text-[var(--text-muted)] uppercase tracking-widest py-4">Visionaries earn 2x points on all claims</p>
          </section>

          <button 
            onClick={handleBack}
            className="w-full bg-[var(--primary)] text-[var(--primary-contrast)] py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
          >
            Return to {state.isInitialized ? 'Settings' : 'Landing'}
          </button>
        </div>
      </div>
    </div>
  );
};
