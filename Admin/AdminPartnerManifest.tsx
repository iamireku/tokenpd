
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
    <div className="space-y-8 pb-20">
      <section className="bg-theme-card border border-theme rounded-[2.5rem] p-8 shadow-xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="text-orange-500" size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest text-orange-400">Partner Hub</h2>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save Changes
          </button>
        </div>

        <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-3">
          <AlertCircle size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-orange-800 uppercase tracking-tight leading-relaxed">
            Attach your referral links to projects. They will appear as "Founder's Signal" in both the Discovery list and Community Pulse.
          </p>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-2">
                <TrendingUp size={12} className="text-blue-500" />
                <h3 className="text-[8px] font-black text-theme-muted uppercase tracking-widest">Trending Without Codes</h3>
             </div>
             <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button 
                    key={s.name}
                    onClick={() => handleUpdateEntry(s.name, 'code', '')}
                    className="bg-theme-main border border-theme px-3 py-1.5 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 hover:border-orange-500/40 transition-colors"
                  >
                    <Plus size={10} className="text-orange-500" />
                    {s.name}
                  </button>
                ))}
             </div>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={14} />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value.toUpperCase())}
            placeholder="FILTER PROJECTS..."
            className="w-full bg-theme-main border border-theme rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black outline-none focus:border-orange-500/30"
          />
        </div>

        <div className="space-y-6">
          {/* Static Apps */}
          {DISCOVERY_HUB_APPS.filter(a => a.name.includes(searchTerm)).map(app => {
            const entry = manifest.find(e => e.appId === app.id) || { appId: app.id, code: '', url: app.officialUrl };
            return (
              <div key={app.id} className="bg-theme-main border border-theme rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={app.icon} className="w-10 h-10 rounded-xl object-cover grayscale opacity-50" alt="" />
                    <div>
                      <h4 className="text-[11px] font-black text-theme-main uppercase">{app.name}</h4>
                      <p className="text-[8px] font-bold text-theme-muted uppercase">Discovery App</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-theme-muted uppercase ml-2">Referral Code</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={12} />
                      <input 
                        type="text"
                        value={entry.code}
                        onChange={e => handleUpdateEntry(app.id, 'code', e.target.value.toUpperCase())}
                        placeholder="NO CODE SET"
                        className="w-full bg-theme-card border border-theme rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-theme-main"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-theme-muted uppercase ml-2">Custom Referral Link</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={12} />
                      <input 
                        type="text"
                        value={entry.url}
                        onChange={e => handleUpdateEntry(app.id, 'url', e.target.value)}
                        placeholder={app.officialUrl}
                        className="w-full bg-theme-card border border-theme rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-theme-main"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dynamic/Community Entries */}
          {manifest.filter(e => !DISCOVERY_HUB_APPS.some(d => d.id === e.appId) && e.appId.includes(searchTerm)).map(entry => (
            <div key={entry.appId} className="bg-theme-main border-2 border-dashed border-theme rounded-3xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-theme-main uppercase">{entry.appId}</h4>
                    <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Community Signal</p>
                  </div>
                </div>
                <button onClick={() => handleRemoveEntry(entry.appId)} className="p-2 text-theme-muted hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-theme-muted uppercase ml-2">Referral Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={12} />
                    <input 
                      type="text"
                      value={entry.code}
                      onChange={e => handleUpdateEntry(entry.appId, 'code', e.target.value.toUpperCase())}
                      placeholder="ENTER CODE..."
                      className="w-full bg-theme-card border border-theme rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-theme-main"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-theme-muted uppercase ml-2">Custom Referral Link</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={12} />
                    <input 
                      type="text"
                      value={entry.url}
                      onChange={e => handleUpdateEntry(entry.appId, 'url', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-theme-card border border-theme rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-mono outline-none focus:border-orange-500/30 text-theme-main"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
