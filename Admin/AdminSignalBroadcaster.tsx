
import React, { useState, useMemo } from 'react';
import { Megaphone, Database, Tag, MessageSquare, Plus, X } from 'lucide-react';
import { BroadcastType, BroadcastUrgency, Theme } from '../types';
import { triggerHaptic } from '../utils';
import { useApp } from '../store';

interface AdminSignalBroadcasterProps {
  onBroadcast: (b: any) => Promise<void>;
}

export const AdminSignalBroadcaster: React.FC<AdminSignalBroadcasterProps> = ({ onBroadcast }) => {
  const { state } = useApp();
  const [bType, setBType] = useState<BroadcastType>('POD');
  const [bUrgency, setBUrgency] = useState<BroadcastUrgency>('NORMAL');
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bActionLabel, setBActionLabel] = useState('');
  const [bActionUrl, setBActionUrl] = useState('');
  const [bReferralCode, setBReferralCode] = useState('');
  const [surveyOptions, setSurveyOptions] = useState<string[]>(['YES', 'NO']);

  const isDark = useMemo(() => {
    if (state.theme === Theme.SYSTEM) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return state.theme === Theme.DARK;
  }, [state.theme]);

  const inputContrastClass = isDark 
    ? 'bg-black text-white border-white/20 focus:border-white placeholder:text-white/20' 
    : 'bg-white text-black border-black/20 focus:border-black placeholder:text-black/20';

  const handleDispatch = async () => {
    await onBroadcast({
      type: bType, urgency: bUrgency, title: bTitle, message: bMessage, 
      actionLabel: bActionLabel, actionUrl: bActionUrl, referralCode: bReferralCode,
      surveyOptions: bType === 'SURVEY' ? surveyOptions : undefined
    });
    setBTitle(''); setBMessage(''); setBActionLabel(''); setBActionUrl(''); setBReferralCode('');
  };

  const addOption = () => {
    if (surveyOptions.length >= 4) return;
    triggerHaptic('light');
    setSurveyOptions([...surveyOptions, 'OPTION']);
  };

  const removeOption = (idx: number) => {
    if (surveyOptions.length <= 2) return;
    triggerHaptic('light');
    setSurveyOptions(surveyOptions.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, val: string) => {
    const next = [...surveyOptions];
    next[idx] = val.toUpperCase();
    setSurveyOptions(next);
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center gap-2 mb-8">
        <Megaphone className="text-green-500" size={18} />
        <h2 className="text-xs font-black uppercase tracking-widest text-green-400">Ledger Broadcaster</h2>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <select value={bType} onChange={e => setBType(e.target.value as BroadcastType)} className={`border rounded-2xl p-4 text-[9px] font-black uppercase outline-none ${inputContrastClass}`}>
            <option value="BANNER">BANNER</option>
            <option value="POD">GROWTH POD</option>
            <option value="INTERCEPT">CRITICAL INTERCEPT</option>
            <option value="SURVEY">INTELLIGENCE POLL</option>
          </select>
          <select value={bUrgency} onChange={e => setBUrgency(e.target.value as BroadcastUrgency)} className={`border rounded-2xl p-4 text-[9px] font-black uppercase outline-none ${inputContrastClass}`}>
            <option value="NORMAL">NORMAL</option>
            <option value="URGENT">URGENT</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
        <input value={bTitle} onChange={e => setBTitle(e.target.value.toUpperCase())} placeholder="SIGNAL TITLE" className={`w-full border rounded-2xl p-4 text-xs font-black outline-none ${inputContrastClass}`} />
        <textarea value={bMessage} onChange={e => setBMessage(e.target.value)} rows={3} placeholder="SIGNAL PAYLOAD" className={`w-full border rounded-2xl p-4 text-xs outline-none resize-none ${inputContrastClass}`} />
        
        {bType === 'SURVEY' && (
          <div className="bg-slate-950/50 p-6 rounded-3xl border border-blue-500/20 space-y-4 animate-in slide-in-from-top duration-300">
             <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={12} className="text-blue-500" />
                <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Survey Options</h3>
             </div>
             <div className="grid grid-cols-2 gap-2">
                {surveyOptions.map((opt, i) => (
                  <div key={i} className="relative">
                    <input 
                      value={opt} 
                      onChange={e => updateOption(i, e.target.value)} 
                      className={`w-full border rounded-xl p-3 text-[9px] font-black outline-none uppercase pr-8 ${inputContrastClass}`} 
                    />
                    <button onClick={() => removeOption(i)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {surveyOptions.length < 4 && (
                  <button onClick={addOption} className="border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-500 transition-colors">
                    <Plus size={14} />
                  </button>
                )}
             </div>
          </div>
        )}

        <div className="relative">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            value={bReferralCode} 
            onChange={e => setBReferralCode(e.target.value.toUpperCase())} 
            placeholder="REFERRAL CODE (OPTIONAL)" 
            className={`w-full border rounded-2xl py-4 pl-12 pr-4 text-[9px] font-black outline-none uppercase tracking-widest ${inputContrastClass}`} 
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input value={bActionLabel} onChange={e => setBActionLabel(e.target.value.toUpperCase())} placeholder="BUTTON LABEL" className={`border rounded-2xl p-4 text-[9px] font-black outline-none ${inputContrastClass}`} />
          <input value={bActionUrl} onChange={e => setBActionUrl(e.target.value)} placeholder="REDIRECT URL" className={`border rounded-2xl p-4 text-[9px] outline-none ${inputContrastClass}`} />
        </div>
        <button onClick={handleDispatch} className="w-full bg-green-600 text-slate-950 font-black py-5 rounded-[2rem] text-xs uppercase shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
          <Database size={18} /> DISPATCH TO NETWORK
        </button>
      </div>
    </section>
  );
};
