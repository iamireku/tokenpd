
import React from 'react';
import { Globe, Crown, Trophy, Zap, ShieldAlert, Clock } from 'lucide-react';
import { AdminStats } from '../types';

interface AdminStatsGridProps {
  stats: AdminStats | null;
  lastUpdated?: Date | null;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({ stats, lastUpdated }) => {
  const integrity = stats?.integrityScore ?? 100;
  const integrityColor = integrity > 90 ? 'text-green-500' : integrity > 70 ? 'text-orange-500' : 'text-red-500';

  const timeString = lastUpdated ? lastUpdated.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...';

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <Globe className="text-blue-500 mb-2" size={20} />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Users</span>
          <span className="text-2xl font-black tabular-nums text-orange-500">{stats?.totalUsers ?? '...'}</span>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <Crown className="text-yellow-500 mb-2" size={20} />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Visionaries</span>
          <span className="text-2xl font-black tabular-nums text-yellow-500">{stats?.premiumUsers ?? '0'}</span>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
          <Trophy className="text-orange-500 mb-2" size={20} />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Global P</span>
          <span className="text-2xl font-black tabular-nums text-orange-500">{stats?.totalPoints?.toLocaleString() ?? '...'}</span>
        </div>
        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
          <Zap className="text-green-500 mb-2" size={20} />
          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">24H Active</span>
          <span className="text-2xl font-black tabular-nums text-orange-500">{stats?.activeLast24h ?? '...'}</span>
          {stats?.flaggedAnomaliesCount ? stats.flaggedAnomaliesCount > 0 && (
             <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 px-1.5 py-0.5 rounded text-[6px] font-black animate-pulse">
                <ShieldAlert size={8} /> {stats.flaggedAnomaliesCount}
             </div>
          ) : null}
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800">
         <div className="flex items-center justify-between mb-4">
            <div>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Network Integrity</span>
               <div className="flex items-baseline gap-2">
                 <span className={`text-3xl font-black tabular-nums ${integrityColor}`}>{integrity}%</span>
                 <span className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter">System Trust</span>
               </div>
            </div>
            <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
               <div 
                 className={`h-full transition-all duration-1000 ${integrity > 70 ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} 
                 style={{ width: `${integrity}%` }} 
               />
            </div>
         </div>

         <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
               <Clock size={12} className="text-slate-500" />
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">DATABASE SYNC:</span>
            </div>
            <span className="text-[10px] font-mono font-black text-green-500/80 tabular-nums">
               {timeString}
            </span>
         </div>
      </div>
    </section>
  );
};
