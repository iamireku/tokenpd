
import React, { useState, useMemo } from 'react';
import { Key, PlusCircle, Trash2 } from 'lucide-react';
import { ProtocolRewardType, Theme } from '../types';
import { useApp } from '../store';

interface AdminProtocolGeneratorProps {
  protocols: any[];
  onCreate: (rewardType: ProtocolRewardType, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AdminProtocolGenerator: React.FC<AdminProtocolGeneratorProps> = ({ protocols, onCreate, onDelete }) => {
  const { state } = useApp();
  const [pCode, setPCode] = useState('');
  const [pType, setPType] = useState<ProtocolRewardType>('POINTS');
  const [pVal, setPVal] = useState(0);
  const [pClaims, setPClaims] = useState(10);

  const isDark = useMemo(() => {
    if (state.theme === Theme.SYSTEM) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return state.theme === Theme.DARK;
  }, [state.theme]);

  const inputContrastClass = isDark 
    ? 'bg-black text-white border-white/20 focus:border-white placeholder:text-white/20' 
    : 'bg-white text-black border-black/20 focus:border-black placeholder:text-black/20';

  const handleCreate = async () => {
    await onCreate(pType, { code: pCode.toUpperCase(), rewardValue: pVal, maxClaims: pClaims, currentClaims: 0 });
    setPCode(''); setPVal(0);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center gap-2 mb-8">
        <Key className="text-yellow-500" size={18} />
        <h2 className="text-xs font-black uppercase tracking-widest text-yellow-400">Reward Code Generator</h2>
      </div>
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-2">
          <input value={pCode} onChange={e => setPCode(e.target.value.toUpperCase())} placeholder="REWARD-CODE" className={`border rounded-2xl p-4 text-[10px] font-mono outline-none ${inputContrastClass}`} />
          <select value={pType} onChange={e => setPType(e.target.value as ProtocolRewardType)} className={`border rounded-2xl p-4 text-[9px] font-black uppercase outline-none ${inputContrastClass}`}>
            <option value="POINTS">POINTS</option>
            <option value="PREMIUM">VISIONARY STATUS</option>
            <option value="RANK_ELITE">ELITE BOOST</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`${inputContrastClass} border rounded-2xl p-3 flex flex-col items-center`}>
            <span className="text-[7px] font-black mb-1 opacity-50">REWARD VALUE</span>
            <input type="number" value={pVal} onChange={e => setPVal(Number(e.target.value))} className="bg-transparent text-center font-black w-full outline-none" />
          </div>
          <div className={`${inputContrastClass} border rounded-2xl p-3 flex flex-col items-center`}>
            <span className="text-[7px] font-black mb-1 opacity-50">MAX CLAIMS</span>
            <input type="number" value={pClaims} onChange={e => setPClaims(Number(e.target.value))} className="bg-transparent text-center font-black w-full outline-none" />
          </div>
        </div>
        <button onClick={handleCreate} className="w-full bg-yellow-500 text-slate-950 font-black py-5 rounded-[2rem] text-xs uppercase flex items-center justify-center gap-3">
          <PlusCircle size={18} /> REGISTER REWARD CODE
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">ACTIVE CODE REGISTRY</h3>
        {protocols?.map((p: any) => (
          <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-yellow-500">{p.code}</span>
                <span className="text-[7px] bg-slate-800 px-1.5 py-0.5 rounded-sm font-black text-slate-400">{p.reward}</span>
              </div>
              <p className="text-[8px] text-slate-600 mt-1 font-bold">{p.currentClaims}/{p.maxClaims} CLAIMS</p>
            </div>
            <button onClick={() => onDelete(p.id)} className="text-slate-700 hover:text-red-500 p-2 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {(!protocols || protocols.length === 0) && (
          <div className="text-center py-6 opacity-20">
            <p className="text-[9px] font-black uppercase tracking-widest">Registry Empty</p>
          </div>
        )}
      </div>
    </section>
  );
};
