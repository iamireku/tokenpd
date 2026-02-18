
import React, { useState, useEffect, useMemo } from 'react';
import { Handshake, Save, Globe, Key, Loader2, AlertCircle, TrendingUp, Plus, X, Search } from 'lucide-react';
import { useApp } from '../store';
import { DISCOVERY_HUB_APPS } from '../constants';
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

  const handleUpdateEntry = (appId: string, field: 'code' | 'url', value: string) => {
    setManifest(prev => {
      const existing = prev.find(e => e.appId === appId);
      if (existing) {
        return prev.map(e => e.appId === appId ? { ...e, [field]: value } : e);
      }
      return [...prev, { appId, code: field === 'code' ? value : '', url: field === 'url' ? value : '' }];
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

  // Identify trending projects that don't have a code yet
  const suggestions = useMemo(() => {
    const trending = state.lastAdminStats?.trendingProjects || [];
    return trending.filter(t => 
      !manifest.some(m => m.appId === t.name) && 
      !DISCOVERY_HUB_APPS.some(d => d.name === t.name)
    );
  }, [state.lastAdminStats?.trendingProjects, manifest]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="text-orange-500" size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-400">Partner Hub</h2>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Push Manifest
          </button>
        </div>

        <div className="p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
          <AlertCircle size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-orange-200/60 uppercase tracking-tight leading-relaxed">
            Configure global referral links. Verified Signals and Community Pulsars will prioritize these codes for all users.
          </p>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-4 bg-slate-950/40 p-4 rounded-3xl border border-slate-800/50">
             <div className="flex items-center gap-2 px-2">
                <TrendingUp size={12} className="text-blue-500" />
                <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Trending Signal Opportunities</h3>
             </div>
             <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button 
                    key={s.name}
                    onClick={() => { triggerHaptic('light'); handleUpdateEntry(s.name, 'code', ''); }}
                    className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-2 hover:border-orange-500/40 hover:bg-slate-800 transition-all text-slate-300"
                  >
                    <Plus size={10} className="text-orange-500" />
                    {s.name}
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value.toUpperCase())}
            placeholder="FILTER REGISTRY..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black outline-none focus:border-orange-500/30 text-white placeholder:text-slate-700 transition-all"
          />
        </div>

        <div className="space-y-6">
          {/* Vetted Signals (Static Apps) */}
          <div className="space-y-4">
            <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] px-2">Vetted Signals</h3>
            {DISCOVERY_HUB_APPS.filter(a => a.name.includes(searchTerm)).map(app => {
              const entry = manifest.find(e => e.appId === app.id) || { appId: app.id, code: '', url: app.officialUrl };
              return (
                <div key={app.id} className="bg-slate-950/50 border border-slate-800/60 rounded-3xl p-6 space-y-5 group hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden border border-white/5">
                        <img src={app.icon} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{app.name}</h4>
                        <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Master ID: {app.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[7px] font-black text-slate-500 uppercase ml-2 tracking-widest">Referral Code</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                        <input 
                          type="text"
                          value={entry.code}
                          onChange={e => handleUpdateEntry(app.id, 'code', e.target.value.toUpperCase())}
                          placeholder="PENDING"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-orange-400 placeholder:text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[7px] font-black text-slate-500 uppercase ml-2 tracking-widest">Destination URL</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                        <input 
                          type="text"
                          value={entry.url}
                          onChange={e => handleUpdateEntry(app.id, 'url', e.target.value)}
                          placeholder={app.officialUrl}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-white placeholder:text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Community Pulsars (Dynamic/Community Entries) */}
          <div className="space-y-4">
            <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] px-2">Community Pulsars</h3>
            {manifest.filter(e => !DISCOVERY_HUB_APPS.some(d => d.id === e.appId) && e.appId.includes(searchTerm)).map(entry => (
              <div key={entry.appId} className="bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-3xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{entry.appId}</h4>
                      <p className="text-[7px] font-bold text-blue-500 uppercase tracking-widest">External Signal Match</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveEntry(entry.appId)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[7px] font-black text-slate-500 uppercase ml-2 tracking-widest">Referral Code</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                      <input 
                        type="text"
                        value={entry.code}
                        onChange={e => handleUpdateEntry(entry.appId, 'code', e.target.value.toUpperCase())}
                        placeholder="ASSIGN CODE..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-orange-400 placeholder:text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[7px] font-black text-slate-500 uppercase ml-2 tracking-widest">Custom Link</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                      <input 
                        type="text"
                        value={entry.url}
                        onChange={e => handleUpdateEntry(entry.appId, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-white placeholder:text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {manifest.filter(e => !DISCOVERY_HUB_APPS.some(d => d.id === e.appId)).length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-slate-800/40 rounded-3xl opacity-30">
                 <p className="text-[8px] font-black uppercase tracking-[0.4em]">No external codes registered</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-center pt-4">
         <p className="text-[7px] font-black text-slate-700 uppercase tracking-widest">
           Sharded Ledger V16.9 | Global Partner Hub
         </p>
      </div>
    </div>
  );
};
