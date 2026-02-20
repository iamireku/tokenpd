import React, { useState, useEffect, useMemo } from 'react';
import { 
  Handshake, 
  Save, 
  Globe, 
  Key, 
  Loader2, 
  AlertCircle, 
  AlertTriangle,
  TrendingUp, 
  Plus, 
  X, 
  Search,
  Users,
  Copy,
  ArrowRight,
  Sparkles,
  FileText,
  Zap,
  BarChart3,
  MousePointer2,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../store';
import { PartnerManifestEntry } from '../types';
import { triggerHaptic } from '../utils';

export const AdminPartnerManifest: React.FC = () => {
  const { state, adminKey, adminUpdatePartnerManifest, addToast } = useApp();
  const [manifest, setManifest] = useState<PartnerManifestEntry[]>(state.partnerManifest || []);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (state.partnerManifest) {
      setManifest(state.partnerManifest);
    }
  }, [state.partnerManifest]);

  const handleUpdateEntry = (appId: string, field: keyof PartnerManifestEntry, value: any) => {
    setManifest(prev => {
      const existing = prev.find(e => e.appId === appId);
      if (existing) {
        return prev.map(e => e.appId === appId ? { ...e, [field]: value } : e);
      }
      return [...prev, { appId, code: '', url: '', isFeatured: false, description: '', [field]: value }];
    });
  };

  const handleRemoveEntry = (appId: string) => {
    triggerHaptic('medium');
    setManifest(prev => prev.filter(e => e.appId !== appId));
  };

  const handleSave = async () => {
    if (!adminKey) return;
    setIsSaving(true);
    triggerHaptic('heavy');
    const success = await adminUpdatePartnerManifest(adminKey, manifest);
    if (success) {
      addToast("Partner Manifest Saved", "SUCCESS");
    } else {
      addToast("Failed to Save Manifest", "ERROR");
    }
    setIsSaving(false);
  };

  const filteredManifest = useMemo(() => {
    return manifest
      .filter(e => e.appId.toUpperCase().includes(searchTerm.toUpperCase()))
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.appId.localeCompare(b.appId);
      });
  }, [manifest, searchTerm]);

  const featuredEntry = useMemo(() => manifest.find(e => e.isFeatured), [manifest]);

  const suggestions = useMemo(() => {
    const trending = (state as any).lastAdminStats?.trendingProjects || [];
    return trending
      .filter((t: any) => !manifest.some(m => m.appId.toUpperCase() === t.name.toUpperCase()))
      .sort((a: any, b: any) => b.count - a.count);
  }, [(state as any).lastAdminStats?.trendingProjects, manifest]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    addToast("Value Copied", "INFO");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-orange-500/20 shadow-2xl">
         <div className="flex items-center gap-3 px-2">
            <Handshake className="text-orange-500" size={20} />
            <div>
               <h2 className="text-[11px] font-black uppercase text-white tracking-widest">Partner Manifest</h2>
               <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">{manifest.length} ACTIVE SIGNALS</p>
            </div>
         </div>
         <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all border-t border-white/20"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Push Manifest
          </button>
      </div>

      {/* PARTNER PERFORMANCE SNAPSHOT */}
      {featuredEntry?.performance && (
        <section className="bg-slate-950 border border-orange-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(249,115,22,0.1)] space-y-8 animate-in zoom-in duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
            <BarChart3 size={200} className="text-orange-500" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-black shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Signal Performance</h3>
                <p className="text-[7px] font-bold text-orange-500 uppercase tracking-tighter">Live Accountability Snapshot: {featuredEntry.appId}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[7px] font-black text-orange-500 uppercase">Verified Intelligence</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col items-center text-center">
              <Zap size={18} className="text-orange-500 mb-2" />
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Daily Ignitions</span>
              <span className="text-xl font-black tabular-nums text-white mt-1">{featuredEntry.performance.ignitions.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col items-center text-center">
              <MousePointer2 size={18} className="text-blue-500 mb-2" />
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">External Handshakes</span>
              <span className="text-xl font-black tabular-nums text-white mt-1">{featuredEntry.performance.handshakes.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col items-center text-center">
              <Users size={18} className="text-emerald-500 mb-2" />
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Active Pods</span>
              <span className="text-xl font-black tabular-nums text-white mt-1">{featuredEntry.performance.activePods.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col items-center text-center">
              <Sparkles size={18} className="text-yellow-500 mb-2" />
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Sentiment Score</span>
              <span className="text-xl font-black tabular-nums text-white mt-1">{featuredEntry.performance.sentiment}%</span>
            </div>
          </div>

          <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
            <p className="text-[8px] font-bold text-orange-200/60 uppercase text-center leading-relaxed tracking-widest">
              Zero-Tracking Policy Active. Metrics are aggregated daily counters. No hunter identities are recorded or transmitted to partners.
            </p>
          </div>
        </section>
      )}

      <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-10">
        
        {suggestions.length > 0 && (
          <div className="space-y-5">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                   <TrendingUp size={14} className="text-blue-500" />
                   <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unmapped Trending Signals</h3>
                </div>
                <span className="text-[7px] font-black text-slate-600 uppercase">Priority Order</span>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((s: any) => (
                  <button 
                    key={s.name}
                    onClick={() => { triggerHaptic('light'); handleUpdateEntry(s.name, 'code', ''); }}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:border-orange-500/40 hover:bg-slate-900 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Plus size={16} />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-white uppercase truncate w-24">{s.name}</p>
                          <div className="flex items-center gap-1">
                             <Users size={8} className="text-slate-600" />
                             <p className="text-[7px] font-black text-slate-600 uppercase">{s.count} Hunters</p>
                          </div>
                       </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-800 group-hover:text-orange-500 transition-colors" />
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={16} />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="FILTER BY APP NAME..."
            className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] py-5 pl-16 pr-8 text-[11px] font-black outline-none focus:border-orange-500/50 text-white placeholder:text-slate-700 transition-all shadow-inner uppercase tracking-widest"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
             <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Signal Registry</h3>
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                   <span className="text-[7px] font-black text-slate-400 uppercase">Spotlight Active</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredManifest.map(entry => {
              const isPending = !entry.code || !entry.url;
              return (
                <div 
                  key={entry.appId} 
                  className={`bg-slate-950/50 border-2 rounded-[2rem] p-6 space-y-6 transition-all duration-300 ${
                    entry.isFeatured ? 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_30px_rgba(249,115,22,0.05)]' : isPending ? 'border-orange-500/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                        entry.isFeatured ? 'bg-orange-500 text-black border-orange-500' : isPending ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}>
                        {entry.isFeatured ? <Sparkles size={24} fill="currentColor" /> : isPending ? <AlertTriangle size={24} /> : <Handshake size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{entry.appId}</h4>
                           {entry.isFeatured && <span className="bg-orange-500 text-black px-2 py-0.5 rounded text-[6px] font-black uppercase shadow-lg">Spotlight</span>}
                        </div>
                        <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Partner Management Hub</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { triggerHaptic('medium'); handleUpdateEntry(entry.appId, 'isFeatured', !entry.isFeatured); }}
                        className={`px-4 py-2 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all border ${
                          entry.isFeatured ? 'bg-orange-500 border-orange-500 text-black' : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}
                      >
                        {entry.isFeatured ? 'Featured On' : 'Set Spotlight'}
                      </button>
                      <button 
                        onClick={() => handleRemoveEntry(entry.appId)} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                         <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Referral Code</label>
                         {entry.code && <button onClick={() => copyToClipboard(entry.code)} className="text-slate-700 hover:text-white"><Copy size={10} /></button>}
                      </div>
                      <div className="relative">
                        <Key className={`absolute left-4 top-1/2 -translate-y-1/2 ${entry.code ? 'text-orange-500' : 'text-slate-700'}`} size={14} />
                        <input 
                          type="text"
                          value={entry.code}
                          onChange={e => handleUpdateEntry(entry.appId, 'code', e.target.value.toUpperCase())}
                          placeholder="ASSIGN CODE..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-orange-400 placeholder:text-slate-800 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Target URL</label>
                        {entry.url && <button onClick={() => copyToClipboard(entry.url)} className="text-slate-700 hover:text-white"><Copy size={10} /></button>}
                      </div>
                      <div className="relative">
                        <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 ${entry.url ? 'text-blue-500' : 'text-slate-700'}`} size={14} />
                        <input 
                          type="text"
                          value={entry.url}
                          onChange={e => handleUpdateEntry(entry.appId, 'url', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-[10px] font-mono outline-none focus:border-blue-500/30 text-white placeholder:text-slate-800 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[7px] font-black text-slate-500 uppercase ml-2 tracking-widest flex items-center gap-1"><FileText size={8} /> Spotlight Description</label>
                     <textarea 
                        value={entry.description || ''}
                        onChange={e => handleUpdateEntry(entry.appId, 'description', e.target.value)}
                        placeholder="Short catchy hook for the Growth Lab..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-[10px] outline-none text-slate-300 min-h-[50px] resize-none focus:border-orange-500/30 transition-all" 
                     />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredManifest.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed border-slate-800/40 rounded-[2rem] opacity-30">
               <AlertCircle className="mx-auto mb-4" size={40} />
               <p className="text-[9px] font-black uppercase tracking-[0.4em]">No external codes matched search</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-center pt-10">
         <div className="bg-slate-900 border border-slate-800 px-6 py-2 rounded-full flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">
              Sharded Ledger Protocol V16.9 | Administrative Uplink Stable
            </p>
         </div>
      </div>
    </div>
  );
};