import React, { useState } from 'react';
import { TrendingUp, RefreshCw, BarChart3, Radio, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../utils';

interface TrendingProject {
  name: string;
  count: number;
  icon?: string;
}

interface AdminTrendingControlProps {
  trending: TrendingProject[];
  onTriggerUpdate: () => Promise<void>;
  isProcessing?: boolean;
}

export const AdminTrendingControl: React.FC<AdminTrendingControlProps> = ({ 
  trending, 
  onTriggerUpdate,
  isProcessing = false
}) => {
  const [localUpdating, setLocalUpdating] = useState(false);

  const handleUpdate = async () => {
    triggerHaptic('heavy');
    setLocalUpdating(true);
    await onTriggerUpdate();
    setLocalUpdating(false);
  };

  const maxCount = trending.length > 0 ? Math.max(...trending.map(t => t.count)) : 1;

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <Radio size={180} className="text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-blue-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Trending Aggregator</h2>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={localUpdating || isProcessing}
          className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border border-blue-600/20 flex items-center gap-2 transition-all"
        >
          {localUpdating ? <RefreshCw size={10} className="animate-spin" /> : <BarChart3 size={10} />}
          FORCE NETWORK SCAN
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-slate-950/50 rounded-3xl border border-slate-800 divide-y divide-slate-800/50 overflow-hidden">
          {trending.length > 0 ? trending.map((app, i) => (
            <div key={app.name} className="p-4 flex items-center gap-4 group/item hover:bg-slate-900/50 transition-colors">
              <div className="w-6 text-center">
                <span className="text-[10px] font-black italic text-slate-600">#{i + 1}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                <img src={app.icon || `https://api.dicebear.com/7.x/identicon/svg?seed=${app.name}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[11px] font-black uppercase tracking-tight text-white truncate">{app.name}</h4>
                  <ShieldCheck size={10} className="text-blue-500 opacity-50" />
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${(app.count / maxCount) * 100}%` }} 
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">TALLY</p>
                <p className="text-[10px] font-mono font-black text-blue-400 tabular-nums">{app.count}</p>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-slate-700">
               <p className="text-[9px] font-black uppercase tracking-[0.3em]">Awaiting Snapshot Data...</p>
            </div>
          )}
        </div>

        <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest text-center px-4 leading-relaxed">
          Aggregates app frequency across all 20 sharded ledgers. Snapshots are cached globally for user dashboards.
        </p>
      </div>
    </section>
  );
};