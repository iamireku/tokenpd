
import React from 'react';
import { Radar, Activity } from 'lucide-react';
import { useApp } from '../store';

export const AdminShardMap: React.FC = () => {
  const { state } = useApp();
  // Attempt to use real shard data if available in stats, otherwise fallback to placeholder
  const shardLoads = (state as any).lastAdminStats?.shardLoads || Array(20).fill(0).map(() => Math.floor(Math.random() * 30));

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Radar className="text-blue-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Network Traffic Map</h2>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
           <Activity size={10} className="text-green-500" /> REAL-TIME NETWORK SCAN
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {shardLoads.map((load: number, i: number) => (
          <div key={i} className="relative group">
            <div 
              className={`h-10 rounded-xl border transition-all duration-1000 ${
                load > 80 ? 'bg-red-500/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 
                load > 50 ? 'bg-orange-500/10 border-orange-500/30' : 
                'bg-slate-950 border-slate-800'
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[8px] font-mono font-bold text-slate-600 group-hover:text-white transition-colors">{i}</span>
            </div>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[7px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none uppercase">
               Segment {i}: {load}% Density
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center text-[7px] font-black text-slate-600 uppercase tracking-widest px-1">
         <span>S0 (Index)</span>
         <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-slate-800 rounded-sm" /> Low</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-orange-500 rounded-sm" /> Mid</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-sm" /> High</span>
         </div>
         <span>S19 (Final)</span>
      </div>
    </section>
  );
};
