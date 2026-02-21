
import React from 'react';
import { Send, Globe, Zap, Search, AlertTriangle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Tooltip } from '../Tooltip';

interface IdentityStepProps {
  data: {
    name: string;
    setName: (v: string) => void;
    iconUrl: string;
    setIconUrl: (v: string) => void;
    isFetchingIcon: boolean;
    launchMode: 'SMART' | 'TELEGRAM' | 'URL';
    setLaunchMode: (v: 'SMART' | 'TELEGRAM' | 'URL') => void;
    tgHandle: string;
    setTgHandle: (v: string) => void;
    customUrl: string;
    setCustomUrl: (v: string) => void;
    matchedProjectKey: string | null;
    handleApplySmartProfile: () => void;
    isProcessing: boolean;
  }
}

export const IdentityStep: React.FC<IdentityStepProps> = ({ data }) => {
  const {
    name, setName, iconUrl, setIconUrl, isFetchingIcon,
    launchMode, setLaunchMode, tgHandle, setTgHandle, customUrl, setCustomUrl,
    matchedProjectKey, handleApplySmartProfile, isProcessing
  } = data;

  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-8">
      <div className="flex flex-col items-center text-center">
         <div className="relative mb-6">
            <div className="w-24 h-24 bg-[var(--bg-card)] rounded-[2rem] border-2 border-[var(--primary)] flex items-center justify-center overflow-hidden shadow-xl relative z-10">
               {isFetchingIcon ? (
                 <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
               ) : (
                 <img src={iconUrl} className="w-full h-full object-cover" alt="App Icon" />
               )}
            </div>
            <div className="absolute -inset-4 bg-[var(--primary)]/10 blur-xl rounded-full -z-10 animate-pulse" />
         </div>
         
         <Tooltip id="tip_app_identity" position="top">
            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter">Define Identity</h2>
         </Tooltip>
      </div>

      <div className="solid-card rounded-[2.5rem] p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-4">App/Project Name *</label>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
            <input 
              disabled={isProcessing}
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              placeholder="E.G. PI NETWORK"
              className="w-full bg-[var(--bg-main)] border border-[var(--primary)]/20 rounded-2xl py-4 pl-14 pr-6 font-black uppercase text-sm focus:border-[var(--primary)] outline-none transition-all text-[var(--text-main)]"
            />
          </div>
        </div>

        {matchedProjectKey && (
          <button 
            onClick={handleApplySmartProfile}
            className="w-full bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="text-orange-500 animate-pulse" size={18} />
              <div className="text-left">
                <p className="text-[10px] font-black text-orange-600 uppercase leading-none">Smart Match Found</p>
                <p className="text-[8px] font-bold text-orange-500/60 uppercase tracking-widest mt-1">Apply official {matchedProjectKey} settings</p>
              </div>
            </div>
            <CheckCircle2 className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
          </button>
        )}

        <div className="space-y-4">
           <label className="text-[9px] font-black text-theme-muted uppercase tracking-widest ml-4">Launch Engine</label>
           <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setLaunchMode('SMART')} className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${launchMode === 'SMART' ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg' : 'bg-[var(--bg-main)] border-[var(--primary)]/10 text-theme-muted'}`}>Smart Search</button>
              <button onClick={() => setLaunchMode('TELEGRAM')} className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${launchMode === 'TELEGRAM' ? 'bg-[#0088cc] border-[#0088cc] text-white shadow-lg' : 'bg-[var(--bg-main)] border-[var(--primary)]/10 text-theme-muted'}`}>Telegram</button>
              <button onClick={() => setLaunchMode('URL')} className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${launchMode === 'URL' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-[var(--bg-main)] border-[var(--primary)]/10 text-theme-muted'}`}>Direct URL</button>
           </div>

           {launchMode === 'TELEGRAM' && (
             <div className="relative animate-in slide-in-from-top duration-300">
                <Send className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0088cc]" size={16} />
                <input 
                  value={tgHandle}
                  onChange={e => setTgHandle(e.target.value)}
                  placeholder="@BOT_HANDLE"
                  className="w-full bg-[var(--bg-main)] border border-[#0088cc]/30 rounded-2xl py-4 pl-14 pr-6 font-bold text-sm focus:border-[#0088cc] outline-none transition-all text-[var(--text-main)]"
                />
             </div>
           )}

           {launchMode === 'URL' && (
             <div className="relative animate-in slide-in-from-top duration-300">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[var(--bg-main)] border border-slate-300 rounded-2xl py-4 pl-14 pr-6 font-bold text-sm focus:border-slate-900 outline-none transition-all text-[var(--text-main)]"
                />
             </div>
           )}
        </div>
      </div>

      <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2rem] p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
            <AlertTriangle size={60} />
         </div>
         <div className="relative z-10 flex items-start gap-4">
            <AlertTriangle className="text-orange-600 mt-1 shrink-0" size={18} />
            <div className="space-y-1">
               <p className="text-[10px] font-black text-orange-700 uppercase tracking-tight">Security Warning (DYOR)</p>
               <p className="text-[9px] font-bold text-orange-800/60 uppercase leading-relaxed tracking-tight">
                  TokenPod is a tracker. You are responsible for verifying the security of any external project or Telegram bot before connecting data.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
