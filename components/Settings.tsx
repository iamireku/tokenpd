import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { Theme } from '../types';
import { 
  Bell, 
  CircleUser, 
  LogOut, 
  ChevronRight, 
  Check, 
  Monitor, 
  Trash2, 
  Fingerprint,
  GraduationCap,
  MessageSquare,
  Eye,
  EyeOff,
  Copy,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { triggerHaptic } from '../utils';

export const Settings: React.FC = () => {
  const { state, signOut, setTheme, toggleNotifications, setView, deleteAccount, addToast, isSyncing } = useApp();
  const [showAccountId, setShowAccountId] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    const checkPerm = () => {
      if (typeof Notification !== 'undefined') setBrowserPermission(Notification.permission);
    };
    checkPerm();
    const interval = setInterval(checkPerm, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyAccountId = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(state.accountId);
    addToast("ID Copied to Clipboard", "SUCCESS");
  };

  const themes = [
    { id: Theme.SYSTEM, label: 'Auto', icon: <Monitor size={14} /> },
    { id: Theme.LIGHT, label: 'Light', icon: <Sun size={14} /> },
    { id: Theme.DARK, label: 'Dark', icon: <Moon size={14} /> }
  ];

  const isBlocked = browserPermission === 'denied';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#f8fafc] pb-40 pt-6 relative overflow-hidden">
      {/* Landing Page Background Continuity (Dark Mode Only) */}
      <div className="fixed inset-0 pointer-events-none opacity-0 dark:opacity-40 -z-10 transition-opacity duration-1000">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,33,0.1),transparent_70%)]" />
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.05),transparent_60%)]" />
      </div>

      <div className="max-w-lg mx-auto relative z-10">
        <header className="sticky-header-capsule border-slate-200">
          <h1 className="text-sm font-black uppercase text-slate-900 leading-none">Settings</h1>
          <p className="text-slate-500 font-black text-[8px] mt-1 uppercase tracking-widest">Account Preferences</p>
        </header>

        <div className="px-6 pt-10 space-y-8">
          <section>
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 px-2">Support & Outreach</h2>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => { triggerHaptic('light'); setView('CONTACT'); }}
                className="bg-theme-card p-6 rounded-[2.5rem] border border-theme flex items-center justify-between group text-left shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase text-theme-main">Support Hub</h3>
                    <p className="text-[8px] font-bold text-theme-muted uppercase">Data Requests & Help</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-theme-muted" />
              </button>

              <button 
                onClick={() => { triggerHaptic('light'); setView('GUIDE'); }}
                className="bg-theme-card p-6 rounded-[2.5rem] border border-theme flex items-center justify-between group text-left active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase text-theme-main">App Guide</h3>
                    <p className="text-[8px] font-bold text-theme-muted uppercase">Learn How It Works</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-theme-muted" />
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 px-2">Display Protocol</h2>
            <div className="bg-theme-card rounded-[2rem] p-1.5 border border-theme flex shadow-sm">
              {themes.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { triggerHaptic('light'); setTheme(t.id); }} 
                  className={`flex-1 py-4 rounded-[1.5rem] flex flex-col items-center gap-1.5 transition-all ${state.theme === t.id ? 'bg-theme-primary text-theme-contrast shadow-lg' : 'text-theme-muted hover:text-theme-main'}`}
                >
                  {t.icon}
                  <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-4 px-2">Account Control</h2>
            <div className="bg-theme-card rounded-[2.5rem] divide-y divide-theme border border-theme overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4"><CircleUser className="text-theme-muted" size={20} /><span className="font-bold text-theme-main">Nickname</span></div>
                <span className="text-[10px] text-theme-muted font-black">{state.nickname}</span>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Fingerprint className="text-theme-muted" size={20} />
                    <span className="font-bold text-theme-main">Vault Identity</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => { triggerHaptic('light'); setShowAccountId(!showAccountId); }} className="p-2 text-theme-muted hover:text-theme-primary transition-colors">
                       {showAccountId ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                     {showAccountId && (
                       <button onClick={copyAccountId} className="p-2 text-theme-muted hover:text-theme-primary transition-colors">
                         <Copy size={16} />
                       </button>
                     )}
                  </div>
                </div>
                <div className="bg-theme-main/10 rounded-xl p-3 border border-theme border-dashed flex items-center justify-center">
                   <span className={`font-mono text-[10px] font-black tracking-widest uppercase transition-all ${showAccountId ? 'text-theme-primary selectable-data' : 'text-theme-muted/30'}`}>
                      {showAccountId ? state.accountId : '••••••••••••••••'}
                   </span>
                </div>
              </div>

              <div onClick={toggleNotifications} className={`flex items-center justify-between p-5 cursor-pointer transition-colors ${isBlocked ? 'bg-red-500/5' : ''}`}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-4">
                    <Bell className={isBlocked ? 'text-red-500' : 'text-theme-muted'} size={20} />
                    <span className={`font-bold ${isBlocked ? 'text-red-500' : 'text-theme-main'}`}>Notifications</span>
                  </div>
                  {isBlocked && <span className="text-[7px] font-black text-red-500 uppercase ml-9 mt-1">Blocked by Browser</span>}
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-all ${state.notificationsEnabled && !isBlocked ? 'bg-theme-primary' : 'bg-theme-muted/20'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.notificationsEnabled && !isBlocked ? 'left-7' : 'left-1'}`} />
                </div>
              </div>
              
              <button onClick={signOut} className="w-full flex items-center justify-between p-5 text-red-500 active:bg-red-500/5 transition-colors">
                <div className="flex items-center gap-4"><LogOut size={20} /> <span className="font-bold">Logout</span></div>
                <ChevronRight size={18} />
              </button>
            </div>
          </section>

          <section className="pt-4">
            <button onClick={() => { if(confirm('Permanently wipe all vault data and terminate this identity?')) deleteAccount(); }} className="w-full bg-red-600/5 text-red-600 p-8 rounded-[2.5rem] border border-red-500/20 flex flex-col items-center gap-3 active:bg-red-600 active:text-white transition-all">
              <Trash2 size={24} /><h3 className="text-xs font-black uppercase">Delete Account</h3>
              <p className="text-[8px] font-bold uppercase opacity-70">Wipe all data permanently</p>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};