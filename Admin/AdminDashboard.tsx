
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  Terminal, ChevronLeft, RefreshCw, ShieldX, Settings2, Loader2, Download, FileJson, Database, Clock, WifiOff, Zap, ShieldAlert, ZapOff,
  Network, Wallet, MessageSquare, ShieldCheck, Activity, Inbox
} from 'lucide-react';
import { AdminStatsGrid } from './AdminStatsGrid';
import { AdminMaintenanceToggle } from './AdminMaintenanceToggle';
import { AdminSignalBroadcaster } from './AdminSignalBroadcaster';
import { AdminProtocolGenerator } from './AdminProtocolGenerator';
import { AdminVaultSearch } from './AdminVaultSearch';
import { AdminSecuritySettings } from './AdminSecuritySettings';
import { AdminAnomalyDetector } from './AdminAnomalyDetector';
import { AdminShardMap } from './AdminShardMap';
import { AdminTrendingControl } from './AdminTrendingControl';
import { AdminSurveyIntelligence } from './AdminSurveyIntelligence';
import { AdminInbox } from './AdminInbox';
import { triggerHaptic } from '../utils';
import { useHoldToConfirm } from '../hooks/useHoldToConfirm';

interface AuditEntry {
  timestamp: string;
  action: string;
  detail: string;
}

type AdminTab = 'NETWORK' | 'ECONOMY' | 'COMMUNICATIONS' | 'INBOX' | 'PATTERNS';

export const AdminDashboard: React.FC = () => {
  const { 
    state, setView, addToast, addBroadcast, fetchNetworkStats, 
    adminLookupUser, adminInjectPoints, adminToggleMaintenance, 
    adminKey, createProtocolCode, deleteProtocolCode,
    setAdminUnlockTaps, adminUnlockTaps, adminExportGlobal, adminTriggerSeasonalReset, 
    adminTerminateSession, adminTriggerTrendingUpdate
  } = useApp();
  
  const [currentTab, setCurrentTab] = useState<AdminTab>('NETWORK');
  const [isScrolled, setIsScrolled] = useState(false);
  const [networkStats, setNetworkStats] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAuthFailed, setIsAuthFailed] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMaintenanceLocal, setIsMaintenanceLocal] = useState(state.isMaintenanceMode || false);
  const [isUplinkMissing, setIsUplinkMissing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isTrendingUpdating, setIsTrendingUpdating] = useState(false);
  
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const addAudit = (action: string, detail: string) => {
    const entry = { 
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      detail 
    };
    setAuditLog(prev => [entry, ...prev].slice(0, 50));
  };

  const loadStats = async () => {
    if (!adminKey) {
      setIsInitialLoading(false);
      return;
    }
    
    setIsInitialLoading(true);
    addAudit("UPLINK_FETCH", "Requesting Global Shard Stats");
    const stats = await fetchNetworkStats(adminKey);
    
    if (stats && !stats.error) {
      setNetworkStats(stats);
      setLastUpdated(new Date());
      setIsMaintenanceLocal(stats.isMaintenanceMode);
      setIsAuthFailed(false);
      setIsNetworkError(false);
      setIsUplinkMissing(false);
      addAudit("UPLINK_SUCCESS", `Synced ${stats.totalUsers} Users`);
    } else {
      const err = stats?.error;
      if (err === 'UPLINK_UNCONFIGURED') {
        setIsUplinkMissing(true);
        addAudit("UPLINK_ERROR", "Target Missing");
      } else if (err === 'NETWORK_BLOCK' || err === 'INVALID_SERVER_RESPONSE') {
        setIsNetworkError(true);
        addAudit("UPLINK_OFFLINE", "Satellite Link Severed");
      } else {
        setIsAuthFailed(true);
        addAudit("AUTH_ERROR", "Master Token Rejected");
      }
    }
    setIsInitialLoading(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    loadStats();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [adminKey]);

  const handlePostBroadcast = async (b: any) => {
    if (!adminKey) return;
    triggerHaptic('heavy');
    addAudit("BROADCAST_PUSH", b.title);
    await addBroadcast(b, true);
    loadStats();
  };

  const handleCreateProtocol = async (pType: any, pData: any) => {
    if (!adminKey) return;
    triggerHaptic('medium');
    addAudit("PROTOCOL_GEN", pData.code);
    await createProtocolCode(pType, pData);
    loadStats();
    addToast("Protocol Registered", "SUCCESS");
  };

  const handleDeleteProtocol = async (id: string) => {
    if (!adminKey) return;
    triggerHaptic('heavy');
    addAudit("PROTOCOL_DECOM", id);
    await deleteProtocolCode(id);
    loadStats();
    addToast("Protocol Terminated", "INFO");
  };

  const handleUserLookup = async (id: string) => {
    if (!adminKey) return null;
    triggerHaptic('medium');
    addAudit("VAULT_LOOKUP", id);
    const res = await adminLookupUser(adminKey, id);
    if (!res || res.error) addToast("User Not Found", "ERROR");
    return res;
  };

  const handlePointInjection = async (id: string, amt: number) => {
    if (!adminKey) return false;
    triggerHaptic('heavy');
    addAudit("POINT_INJECT", `${id}: ${amt}P`);
    const success = await adminInjectPoints(adminKey, id, amt);
    if (success) addToast(`Injected ${amt}P`, "SUCCESS");
    return success;
  };

  const handleTerminateSession = async (id: string) => {
    if (!adminKey) return false;
    triggerHaptic('heavy');
    addAudit("SESSION_TERMINATE", id);
    const success = await adminTerminateSession(adminKey, id);
    if (success) addToast(`Session Terminated for ${id}`, "SUCCESS");
    return success;
  };

  const handleToggleMaintenance = async (val: boolean) => {
    if (!adminKey) return;
    triggerHaptic('medium');
    addAudit("MAINTENANCE_TOGGLE", val ? "ACTIVE" : "DISABLED");
    if (await adminToggleMaintenance(adminKey, val)) {
      setIsMaintenanceLocal(val);
    }
  };

  const handleExportGlobal = async () => {
    if (!adminKey || isExporting) return;
    setIsExporting(true);
    triggerHaptic('heavy');
    addAudit("GLOBAL_EXPORT", "Compiling System Snapshot");
    await adminExportGlobal(adminKey);
    setIsExporting(false);
  };

  const handleTriggerTrendingUpdate = async () => {
    if (!adminKey || isTrendingUpdating) return;
    setIsTrendingUpdating(true);
    addAudit("TRENDING_UPDATE", "Scanning 20 Shards for Project Tally");
    const res = await adminTriggerTrendingUpdate(adminKey);
    if (res.success) {
      addToast("Trending Engine Updated", "SUCCESS");
      addAudit("TRENDING_SUCCESS", "Snapshot Cache Refreshed");
      loadStats();
    } else {
      addToast("Trending Update Failed", "ERROR");
      addAudit("TRENDING_ERROR", "Scanner Timeout");
    }
    setIsTrendingUpdating(false);
  };

  const { holdProgress: resetProgress, handleStart: startReset, handleEnd: stopReset } = useHoldToConfirm(async () => {
    if (!adminKey || isResetting) return;
    setIsResetting(true);
    triggerHaptic('heavy');
    addAudit("SEASONAL_RESET", "Executing 10% Decay Protocol");
    const success = await adminTriggerSeasonalReset(adminKey);
    if (success) {
      addToast("Seasonal Reset Executed", "SUCCESS");
      loadStats();
    }
    setIsResetting(false);
  }, 3000);

  const handleAnomalyDismiss = (id: string) => {
    triggerHaptic('light');
    addAudit("PATTERN_CLEAR", id);
    setNetworkStats((prev: any) => ({
      ...prev,
      recentAnomalies: prev.recentAnomalies?.filter((a: any) => a.id !== id),
      flaggedAnomaliesCount: Math.max(0, (prev.flaggedAnomaliesCount || 1) - 1)
    }));
  };

  const handleAnomalyBan = (vaultId: string) => {
    triggerHaptic('heavy');
    addAudit("ACCOUNT_FLAG", vaultId);
    addToast(`Vault ${vaultId} Flagged for Review`, "INFO");
  };

  const TabButton = ({ id, icon: Icon, label, hasBadge }: { id: AdminTab, icon: any, label: string, hasBadge?: boolean }) => (
    <button 
      onClick={() => { triggerHaptic('light'); setCurrentTab(id); }}
      className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all relative ${currentTab === id ? 'text-green-500' : 'text-theme-muted hover:text-theme-main'}`}
    >
      <div className="relative">
        <Icon size={18} />
        {hasBadge && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-theme-main animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
        )}
      </div>
      <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
      {currentTab === id && (
        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-green-500 rounded-full animate-in fade-in zoom-in" />
      )}
    </button>
  );

  if (isUplinkMissing) {
    return (
      <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mb-8 border border-orange-500/20">
            <Settings2 size={40} className="text-orange-500" />
         </div>
         <h1 className="text-theme-main font-black text-2xl uppercase tracking-tighter mb-4">UPLINK REQUIRED</h1>
         <p className="text-theme-muted font-bold uppercase tracking-widest text-[9px] leading-relaxed mb-10 max-w-xs mx-auto">
           The serverless proxy cannot reach the Ledger. Ensure GAS_SCRIPT_URL is configured.
         </p>
         <button onClick={() => setView('SETTINGS')} className="bg-theme-card text-theme-main px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-theme">
           RETURN TO BASE
         </button>
      </div>
    );
  }

  if (isNetworkError) {
    return (
      <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <WifiOff size={40} className="text-red-500" />
         </div>
         <h1 className="text-theme-main font-black text-2xl uppercase tracking-tighter mb-4">SATELLITE OFFLINE</h1>
         <p className="text-theme-muted font-bold uppercase tracking-widest text-[9px] leading-relaxed mb-10 max-w-xs mx-auto">
           The proxy uplink returned an invalid response.
         </p>
         <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={loadStats} className="bg-green-600 text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              RETRY HANDSHAKE
            </button>
            <button onClick={() => setView('SETTINGS')} className="bg-theme-card text-theme-main px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-theme">
              ABORT SESSION
            </button>
         </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center text-center">
        <Loader2 size={40} className="text-green-500 animate-spin mb-4" />
        <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest">Syncing Network Nodes...</p>
      </div>
    );
  }

  if (isAuthFailed) {
    return (
      <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
         <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <ShieldX size={40} className="text-red-500" />
         </div>
         <h1 className="text-theme-main font-black text-2xl uppercase tracking-tighter mb-4">AUTH FAILED</h1>
         <p className="text-theme-muted font-bold uppercase tracking-widest text-[9px] mb-8">Master Token Rejected by Ledger</p>
         <button onClick={() => setView('SETTINGS')} className="bg-theme-card text-theme-main px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-theme">
           RETURN TO BASE
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-main text-theme-main p-6 pb-40 animate-in slide-in-from-bottom duration-500">
      <header className={`sticky-header-capsule border-green-500/30 bg-theme-card/90 ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('SETTINGS')} className="p-2 bg-theme-main rounded-xl text-theme-muted hover:text-theme-primary border border-theme">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Terminal className="text-green-500" size={20} />
              <h1 className="text-sm font-black uppercase tracking-tighter text-theme-main">Command Center</h1>
            </div>
          </div>
          <button onClick={loadStats} className="text-theme-muted hover:text-theme-primary transition-transform active:rotate-180"><RefreshCw size={16} /></button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="mt-8 bg-theme-card/80 backdrop-blur-md border border-theme rounded-3xl flex items-center px-2 py-1 sticky top-[4.5rem] z-[100] shadow-2xl">
        <TabButton id="NETWORK" icon={Network} label="Network" />
        <TabButton id="ECONOMY" icon={Wallet} label="Economy" />
        <TabButton id="INBOX" icon={Inbox} label="Inbox" hasBadge={(networkStats?.feedbackCount || 0) > 0} />
        <TabButton id="COMMUNICATIONS" icon={MessageSquare} label="Comm" />
        <TabButton id="PATTERNS" icon={ShieldCheck} label="Patterns" />
      </nav>

      <div className="pt-8 space-y-10">
        
        {currentTab === 'NETWORK' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminStatsGrid stats={networkStats} lastUpdated={lastUpdated} />
            <AdminShardMap />
            <AdminTrendingControl 
              trending={networkStats?.trendingProjects || []} 
              onTriggerUpdate={handleTriggerTrendingUpdate}
              isProcessing={isTrendingUpdating}
            />
            <AdminMaintenanceToggle 
              isEnabled={isMaintenanceLocal} 
              onToggle={handleToggleMaintenance} 
            />
            <section className="bg-theme-card border-2 border-red-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-[2s]">
                 <ZapOff size={200} className="text-red-500" />
              </div>
              <div className="flex items-center gap-2 mb-8 relative z-10">
                <ShieldAlert className="text-red-500" size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest text-red-500">Network Danger Zone</h2>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="p-5 bg-red-500/5 rounded-2xl border border-red-500/10">
                   <p className="text-[10px] font-bold text-red-800 uppercase tracking-tight leading-relaxed">
                      CAUTION: This command executes the 10% point decay protocol across all 20 shards immediately. (Standard timing: Start of Month)
                   </p>
                </div>
                <button 
                  onMouseDown={startReset}
                  onMouseUp={stopReset}
                  onMouseLeave={stopReset}
                  onTouchStart={startReset}
                  onTouchEnd={stopReset}
                  disabled={isResetting}
                  className="w-full relative overflow-hidden bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-theme-contrast py-6 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 border border-red-600/30"
                >
                  <div className="absolute inset-0 bg-red-600 transition-all duration-75 opacity-50" style={{ width: `${resetProgress}%` }} />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isResetting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    {resetProgress > 0 ? `EXECUTING... ${Math.round(resetProgress)}%` : 'HOLD TO TRIGGER MONTHLY RESET'}
                  </span>
                </button>
              </div>
            </section>
          </div>
        )}

        {currentTab === 'ECONOMY' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminProtocolGenerator 
              protocols={networkStats?.protocols || []} 
              onCreate={handleCreateProtocol} 
              onDelete={handleDeleteProtocol} 
            />
            <AdminVaultSearch 
              onLookup={handleUserLookup} 
              onInject={handlePointInjection} 
              onTerminate={handleTerminateSession}
            />
            <section className="bg-theme-card border border-theme rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-8">
                <Database className="text-blue-500" size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Network Data & Sovereignty</h2>
              </div>
              <div className="p-6 bg-theme-main rounded-3xl border border-theme flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
                  <FileJson size={32} />
                </div>
                <h4 className="text-xs font-black text-theme-main uppercase tracking-widest mb-2">Master Backup Protocol</h4>
                <button 
                  onClick={handleExportGlobal}
                  disabled={isExporting}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                  {isExporting ? 'PROCESSING SHARDS...' : 'DOWNLOAD GLOBAL LEDGER'}
                </button>
              </div>
            </section>
          </div>
        )}

        {currentTab === 'INBOX' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminInbox />
          </div>
        )}

        {currentTab === 'COMMUNICATIONS' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminSurveyIntelligence data={networkStats?.surveyIntelligence || []} />
            <AdminSignalBroadcaster onBroadcast={handlePostBroadcast} />
          </div>
        )}

        {currentTab === 'PATTERNS' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminAnomalyDetector 
              anomalies={networkStats?.recentAnomalies || []} 
              onDismiss={handleAnomalyDismiss}
              onBan={handleAnomalyBan}
            />
            <AdminSecuritySettings 
              currentTaps={adminUnlockTaps || 5} 
              onUpdateTaps={setAdminUnlockTaps} 
            />
            <section className="bg-theme-main border border-theme rounded-3xl overflow-hidden shadow-2xl">
               <div className="bg-theme-card px-6 py-3 border-b border-theme flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-green-500" />
                    <span className="text-[8px] font-black text-theme-muted uppercase tracking-widest">Live Activity Log</span>
                  </div>
                  <span className="text-[7px] font-mono text-green-500/50">Audit-Ready</span>
               </div>
               <div className="p-4 h-64 overflow-y-auto font-mono text-[9px] space-y-2 hide-scrollbar">
                  {auditLog.map((log, i) => (
                    <div key={i} className="flex gap-3 animate-in slide-in-from-left duration-300">
                      <span className="text-theme-muted shrink-0">[{log.timestamp}]</span>
                      <span className="text-green-500 shrink-0">{log.action}:</span>
                      <span className="text-theme-muted/70">{log.detail}</span>
                    </div>
                  ))}
                  {auditLog.length === 0 && (
                    <div className="h-full flex items-center justify-center text-theme-muted uppercase tracking-[0.3em]">
                      Awaiting Telemetry...
                    </div>
                  )}
               </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
