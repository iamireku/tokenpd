
import React, { useState, useMemo } from 'react';
import { Megaphone, Layout, Tag, MessageSquare, Plus, X, BarChart3, Bell, ArrowRight, Eye, ShieldAlert, X as XIcon } from 'lucide-react';
import { BroadcastType, BroadcastUrgency, Theme } from '../types';
import { triggerHaptic } from '../utils';
import { useApp } from '../store';

interface AdminMessageCenterProps {
  onBroadcast: (b: any) => Promise<void>;
}

export const AdminSignalBroadcaster: React.FC<AdminMessageCenterProps> = ({ onBroadcast }) => {
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
    if (!bTitle || !bMessage) return;
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
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-orange-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest text-orange-400">Alert Center</h2>
        </div>
        <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[7px] font-black text-orange-500 uppercase tracking-widest">
           Cloud Post Sync Active
        </div>
      </div>

      {/* LIVE PREVIEW SECTION */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 px-2">
            <Eye size={12} className="text-slate-500" />
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Alert Preview</h3>
         </div>
         <div className="bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800 shadow-inner">
            <div className="relative solid-card rounded-[2rem] p-5 border-l-[6px] border-orange-500 bg-white overflow-hidden shadow-2xl">
                <button className="absolute top-4 right-4 p-1 text-slate-400">
                  <XIcon size={14} strokeWidth={3} />
                </button>
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2 py-0.5 rounded-md text-[6px] font-black uppercase border ${bType === 'SURVEY' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : 'bg-orange-500/10 text-orange-500 border-orange-500/30'}`}>
                    {bType === 'SURVEY' ? <BarChart3 size={8} className="inline mr-1" /> : <Bell size={8} className="inline mr-1" />}
                    {bType === 'SURVEY' ? 'Intelligence Poll' : bType === 'INTERCEPT' ? 'Notice' : 'System Alert'}
                  </div>
                </div>
                <h4 className="text-[11px] font-black uppercase text-black mb-1 tracking-tight pr-6">{bTitle || 'ALERT HEADING...'}</h4>
                <p className="text-[10px] font-semibold text-slate-500 uppercase leading-relaxed mb-4 tracking-tight">{bMessage || 'This is how your alert content will look on the dashboard...'}</p>
                
                {bType === 'SURVEY' && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {surveyOptions.map((opt) => (
                      <div key={opt} className="py-2.5 rounded-lg font-black text-[7px] uppercase border-2 bg-slate-50 border-slate-100 text-slate-400 text-center">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-[7px] font-black uppercase tracking-widest">Skip Post</span>
                  {bActionLabel && (
                    <div className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[7px] font-black uppercase tracking-widest shadow-lg">
                      {bActionLabel}
                    </div>
                  )}
                </div>
            </div>
         </div>
      </div>

      <div className="space-y-8">
        {/* SECTION: TYPE & IMPORTANCE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Layout size={12} className="text-slate-500" />
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Type & Priority</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[7px] font-black text-slate-600 uppercase ml-2">Display Style</label>
               <select value={bType} onChange={e => setBType(e.target.value as BroadcastType)} className={`w-full border rounded-2xl p-4 text-[9px] font-black uppercase outline-none ${inputContrastClass}`}>
                <option value="BANNER">Standard Banner</option>
                <option value="POD">App Highlight</option>
                <option value="INTERCEPT">Notice</option>
                <option value="SURVEY">User Poll</option>
              </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[7px] font-black text-slate-600 uppercase ml-2">Importance Level</label>
               <select value={bUrgency} onChange={e => setBUrgency(e.target.value as BroadcastUrgency)} className={`w-full border rounded-2xl p-4 text-[9px] font-black uppercase outline-none ${inputContrastClass}`}>
                <option value="NORMAL">Standard</option>
                <option value="URGENT">Important</option>
                <option value="CRITICAL">High Alert</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION: CONTENT */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Tag size={12} className="text-slate-500" />
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Alert Content</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[7px] font-black text-slate-600 uppercase ml-2">Heading</label>
              <input value={bTitle} onChange={e => setBTitle(e.target.value.toUpperCase())} placeholder="E.G. NEW PROJECT ADDED" className={`w-full border rounded-2xl p-4 text-xs font-black outline-none ${inputContrastClass}`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[7px] font-black text-slate-600 uppercase ml-2">Alert Body</label>
              <textarea value={bMessage} onChange={e => setBMessage(e.target.value)} rows={3} placeholder="Enter the main text for your alert..." className={`w-full border rounded-2xl p-4 text-xs outline-none resize-none ${inputContrastClass}`} />
            </div>
          </div>
        </div>
        
        {bType === 'SURVEY' && (
          <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-blue-500/20 space-y-4 animate-in slide-in-from-top duration-300">
             <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                   <BarChart3 size={12} className="text-blue-500" />
                   <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Poll Options</h3>
                </div>
                <span className="text-[7px] font-black text-slate-600 uppercase">Min 2 / Max 4</span>
             </div>
             <div className="grid grid-cols-2 gap-3">
                {surveyOptions.map((opt, i) => (
                  <div key={i} className="relative group">
                    <input 
                      value={opt} 
                      onChange={e => updateOption(i, e.target.value)} 
                      className={`w-full border rounded-xl p-3 text-[9px] font-black outline-none uppercase pr-8 ${inputContrastClass}`} 
                    />
                    <button onClick={() => removeOption(i)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {surveyOptions.length < 4 && (
                  <button onClick={addOption} className="border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-500 hover:border-blue-500/40 transition-all p-3">
                    <Plus size={16} />
                  </button>
                )}
             </div>
          </div>
        )}

        {/* SECTION: INTERACTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <ArrowRight size={12} className="text-slate-500" />
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interaction (Optional)</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-orange-500 transition-colors" size={14} />
              <input 
                value={bReferralCode} 
                onChange={e => setBReferralCode(e.target.value.toUpperCase())} 
                placeholder="ATTACH REFERRAL CODE..." 
                className={`w-full border rounded-2xl py-4 pl-12 pr-4 text-[9px] font-black outline-none uppercase tracking-widest ${inputContrastClass}`} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[7px] font-black text-slate-600 uppercase ml-2">Button Label</label>
                 <input value={bActionLabel} onChange={e => setBActionLabel(e.target.value.toUpperCase())} placeholder="JOIN NOW" className={`w-full border rounded-2xl p-4 text-[9px] font-black outline-none ${inputContrastClass}`} />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[7px] font-black text-slate-600 uppercase ml-2">Redirect URL</label>
                 <input value={bActionUrl} onChange={e => setBActionUrl(e.target.value)} placeholder="https://..." className={`w-full border rounded-2xl p-4 text-[9px] outline-none ${inputContrastClass}`} />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleDispatch}
          disabled={!bTitle || !bMessage}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-6 rounded-[2rem] text-[11px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 transition-all border-t border-white/20"
        >
          <Plus size={20} /> POST ALERT TO NETWORK
        </button>
      </div>

      <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-start gap-4">
         <ShieldAlert className="text-slate-600 shrink-0 mt-1" size={16} />
         <p className="text-[8px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">
           All alerts are pushed to the Cloud Database and synced with all active user vaults within 30 seconds. Posted alerts cannot be edited after dispatch.
         </p>
      </div>
    </section>
  );
};
