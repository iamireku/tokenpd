import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, UserX, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../utils';
import { useApp } from '../store';
import { Theme } from '../types';

interface AdminVaultSearchProps {
  onLookup: (id: string) => Promise<any>;
  onInject: (id: string, amount: number) => Promise<boolean>;
  onTerminate: (id: string) => Promise<boolean>;
}

export const AdminVaultSearch: React.FC<AdminVaultSearchProps> = ({ onLookup, onInject, onTerminate }) => {
  const { state } = useApp();
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [injectAmount, setInjectAmount] = useState(0);

  const isDark = useMemo(() => {
    if (state.theme === Theme.SYSTEM) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return state.theme === Theme.DARK;
  }, [state.theme]);

  const inputContrastClass = isDark 
    ? 'bg-black text-white border-white/20 focus:border-white placeholder:text-white/20' 
    : 'bg-white text-black border-black/20 focus:border-black placeholder:text-black/20';

  const handleSearch = async () => {
    if (!lookupId) return;
    const res = await onLookup(lookupId.trim());
    if (res && res.success) setLookupResult(res);
    else setLookupResult(null);
  };

  const handleApplyInject = async () => {
    if (!lookupResult) return;
    if (await onInject(lookupResult.accountId, injectAmount)) {
      setLookupResult((prev: any) => ({ ...prev, points: prev.points + injectAmount }));
      setInjectAmount(0);
    }
  };

  const handleTerminateAction = async () => {
    if (!lookupResult) return;
    triggerHaptic('heavy');
    if (await onTerminate(lookupResult.accountId)) {
      setLookupResult(null);
      setLookupId('');
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center gap-2 mb-8">
        <Search className="text-blue-500" size={18} />
        <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Account Management</h2>
      </div>
      <div className="flex gap-2 mb-6">
        <input 
          value={lookupId} 
          onChange={e => setLookupId(e.target.value)} 
          placeholder="SEARCH ACCOUNT ID (a_...) or NICKNAME" 
          className={`flex-1 border rounded-2xl p-4 text-[10px] font-mono outline-none ${inputContrastClass}`} 
        />
        <button onClick={handleSearch} className="bg-blue-600 px-6 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
          <Search size={16} className="text-white" />
        </button>
      </div>

      {lookupResult && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 animate-in zoom-in duration-300">
           <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black uppercase text-white">{lookupResult.nickname}</h3>
                <p className="text-[9px] font-mono text-slate-500 selectable-data">{lookupResult.accountId}</p>
              </div>
              <div className="text-right">
                <span className="text-blue-500 font-black text-xl">{lookupResult.points} P</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-[7px] text-slate-500 font-black uppercase">Invites</p>
                <p className="font-black text-sm text-white">{lookupResult.referrals || 0}</p>
             </div>
             <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
                <p className="text-[7px] text-slate-500 font-black uppercase">Rank</p>
                <p className="font-black text-[9px] text-yellow-500 uppercase">{lookupResult.isPremium ? 'VISIONARY' : 'MEMBER'}</p>
             </div>
           </div>

           {/* Activity Participation History */}
           {lookupResult.votedSurveys && lookupResult.votedSurveys.length > 0 && (
             <div className="mb-6 bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
                <div className="flex items-center gap-2 mb-2">
                   <MessageSquare size={10} className="text-blue-400" />
                   <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Poll Participation History</span>
                </div>
                <div className="flex flex-wrap gap-2">
                   {lookupResult.votedSurveys.map((sId: string, idx: number) => (
                      <span key={idx} className="bg-slate-900 px-2 py-1 rounded text-[6px] font-mono text-slate-400 border border-slate-800">
                         {sId.slice(0, 10)}...
                      </span>
                   ))}
                </div>
             </div>
           )}

           <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={injectAmount || ''} 
                  onChange={e => setInjectAmount(Number(e.target.value))} 
                  placeholder="POINT AMOUNT" 
                  className={`flex-1 border rounded-2xl p-3 text-xs outline-none ${inputContrastClass}`} 
                />
                <button onClick={handleApplyInject} className="bg-green-600 px-6 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 text-slate-900">
                  <PlusCircle size={14} /> Inject
                </button>
              </div>
              
              <button 
                onClick={handleTerminateAction}
                className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
              >
                <UserX size={16} /> Force Session Logout
              </button>
           </div>
        </div>
      )}
    </section>
  );
};