
import React from 'react';
import { ShieldCheck, ChevronUp, ChevronDown, Fingerprint } from 'lucide-react';
import { triggerHaptic } from '../utils';

interface AdminSecuritySettingsProps {
  currentTaps: number;
  onUpdateTaps: (val: number) => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({ currentTaps, onUpdateTaps }) => {
  const adjust = (delta: number) => {
    triggerHaptic('light');
    const next = Math.max(3, Math.min(20, currentTaps + delta));
    onUpdateTaps(next);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center gap-2 mb-8">
        <ShieldCheck className="text-purple-500" size={18} />
        <h2 className="text-xs font-black uppercase tracking-widest text-purple-400">Security Gate</h2>
      </div>
      
      <div className="flex items-center justify-between p-6 bg-slate-950 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
            <Fingerprint size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Secret Tap Threshold</h4>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Required taps to open Auth Terminal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => adjust(-1)}
            className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 active:scale-90 transition-transform"
          >
            <ChevronDown size={16} />
          </button>
          <span className="text-xl font-black text-purple-500 tabular-nums min-w-[1.5rem] text-center">{currentTaps}</span>
          <button 
            onClick={() => adjust(1)}
            className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 active:scale-90 transition-transform"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
