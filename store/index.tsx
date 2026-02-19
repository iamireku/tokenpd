import React, { createContext, useContext, useReducer, useState, useCallback, useEffect, useRef } from 'react';
import { storeReducer, DEFAULT_STATE, StoreState, StoreAction } from './reducer';
import { useUserActions } from './actions/useUserActions';
import { useEconomyActions } from './actions/useEconomyActions';
import { useAdminActions } from './actions/useAdminActions';
import { useSystemActions } from './actions/useSystemActions';
import { Theme, Toast, PartnerManifestEntry, DiscoveryApp } from '../types';
import { STORAGE_KEY } from '../constants';
import { isStandalone, getPersistentVault, triggerHaptic } from '../utils';

interface AppContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  toasts: Toast[];
  addToast: (message: string, type: 'SUCCESS' | 'ERROR' | 'INFO', options?: { key?: string; action?: { label: string; onClick: () => void } }) => void;
  removeToast: (id: string) => void;
  onboard: (nickname: string, pin: string, mode: 'REGISTER' | 'LOGIN', referralCode?: string) => Promise<boolean>;
  updatePin: (currentPin: string, newPin: string) => Promise<boolean>;
  submitFeedback: (comment: string, email: string, type?: string) => Promise<boolean>;
  toggleNotifications: () => Promise<void>;
  signOut: () => void;
  deleteAccount: () => Promise<boolean>;
  forceSync: (isAuto?: boolean) => Promise<void>;
  claimApp: (id: string, offsetMs?: number) => Promise<void>;
  resetApp: (id: string, offsetMs?: number, taskId?: string) => void;
  resetTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addApp: (app: any, tasks: any[]) => boolean;
  updateApp: (app: any, tasks: any[]) => void;
  deleteApp: (id: string) => void;
  undoDeletedItem: () => void;
  redeemCode: (code: string) => Promise<{ success: boolean; message: string }>;
  claimReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
  submitVote: (id: string, opt: string) => Promise<boolean>;
  igniteSpark: () => Promise<void>;
  unlockDiscovery: (id: string, cost: number) => Promise<void>;
  claimDailyBonus: () => Promise<void>;
  rechargeSpark: () => void;
  unlockAnalytics: () => void;
  adminLogin: (key: string) => Promise<{ success: boolean; sessionToken?: string; error?: string }>;
  fetchNetworkStats: (token: string) => Promise<any>;
  adminLookupUser: (key: string, id: string) => Promise<any>;
  adminInjectPoints: (key: string, id: string, amount: number) => Promise<boolean>;
  adminToggleMaintenance: (key: string, enabled: boolean) => Promise<boolean>;
  adminTriggerSeasonalReset: (key: string) => Promise<boolean>;
  adminTriggerTrendingUpdate: (key: string) => Promise<{ success: boolean }>;
  adminTerminateSession: (key: string, id: string) => Promise<boolean>;
  adminTerminateAllSessions?: (key: string) => Promise<boolean>;
  adminFetchFeedback: (key: string) => Promise<any>;
  addBroadcast: (broadcast: any, isGlobal: boolean) => Promise<void>;
  createProtocolCode: (type: any, data: any) => Promise<void>;
  deleteProtocolCode: (id: string) => Promise<void>;
  adminExportGlobal: (key: string) => Promise<void>;
  adminUpdatePartnerManifest: (k: string, manifest: PartnerManifestEntry[]) => Promise<boolean>;
  adminUpdateVettedApps: (k: string, apps: DiscoveryApp[]) => Promise<boolean>;
  triggerLaunch: (name: string, url: string) => void;
  exportData: () => void;
  importData: (json: string) => void;
  dismissMessage: (id: string) => void;
  triggerSecretTap: () => void;
  view: any;
  setView: (view: any) => void;
  setEditingAppId: (id: string | null) => void;
  setEditingTaskId: (id: string | null) => void;
  setPrefillApp: (app: { name: string; icon: string } | null) => void;
  setAdminKey: (key: string | null) => void;
  setPipActive: (status: boolean) => void;
  isProcessing: boolean;
  isSyncing: boolean;
  isBackgroundSyncing: boolean;
  isAuthenticating: boolean;
  adminKey: string | null;
  launchingAppName: string | null;
  lastBonusAt: number | undefined;
  lastSparkAt: number | undefined;
  editingAppId: string | null;
  editingTaskId: string | null;
  setTheme: (theme: Theme) => void;
  setAdminUnlockTaps: (taps: number) => void;
  adminUnlockTaps: number | undefined;
  installPrompt: any;
  setInstallPrompt: (prompt: any) => void;
  isInstalled: boolean;
  isPipActive: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, DEFAULT_STATE);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const saveTimeoutRef = useRef<number | null>(null);
  const syncDebounceRef = useRef<number | null>(null);
  const lastVisibleAtRef = useRef<number>(Date.now());

  const removeToast = useCallback((id: string) => {
    setToasts(curr => curr.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'SUCCESS' | 'ERROR' | 'INFO', options?: { key?: string; action?: { label: string; onClick: () => void } }) => {
    setToasts(prev => {
      if (options?.key) {
        const existingIdx = prev.findIndex(t => t.key === options.key);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { 
            ...updated[existingIdx], 
            count: (updated[existingIdx].count || 1) + 1,
            message: message 
          };
          return updated;
        }
      }
      
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, message, type, ...options };
      
      setTimeout(() => {
        removeToast(id);
      }, 5000);
      
      return [...prev, newToast];
    });
  }, [removeToast]);

  const setView = useCallback((view: any) => {
    // SYNC STATE WITH HASH
    window.location.hash = view.toLowerCase();
    dispatch({ type: 'SET_VIEW', view });
  }, []);

  // INITIAL HYDRATION: Blocking check of localStorage to prevent UI reset
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // RECOVER VIEW FROM HASH IF EXISTS
        let initialView = parsed.view || 'DASHBOARD';
        const hash = window.location.hash.replace('#', '').toUpperCase();
        if (hash && ['DASHBOARD', 'CREATE', 'LAB', 'SETTINGS', 'FOCUS', 'ECONOMY', 'GUIDE'].includes(hash)) {
          initialView = hash;
        }

        dispatch({ type: 'SET_VAULT', vault: { ...parsed, view: initialView, isInitialized: true } });
      } catch (e) {
        console.error("Vault hydration failed", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleAppInstalled = () => {
      triggerHaptic('success');
      dispatch({ type: 'SET_NEWLY_INSTALLED', status: true });
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  // PERSISTENCE PROTOCOL
  useEffect(() => {
    if (!state.isInitialized) return;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      const vaultToSave = getPersistentVault(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vaultToSave));
    }, 2000);
    return () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); };
  }, [
    state.apps, state.tasks, state.points, state.nickname, state.theme, 
    state.notificationsEnabled, state.unlockedDiscoveryIds, state.isPremium,
    state.pollActivity, state.votedSurveys, state.lastSparkAt, state.lastBonusAt,
    state.messages, state.view
  ]);

  const setEditingAppId = (id: string | null) => dispatch({ type: 'SET_EDIT_APP', id });
  const setEditingTaskId = (id: string | null) => dispatch({ type: 'SET_EDIT_TASK', id });
  const setPrefillApp = (app: { name: string; icon: string } | null) => dispatch({ type: 'SET_PREFILL_APP', app });
  const setAdminKey = (key: string | null) => dispatch({ type: 'SET_ADMIN_KEY', key });
  const setPipActive = (status: boolean) => dispatch({ type: 'SET_PIP_ACTIVE', status });

  const userActions = useUserActions(state, dispatch, addToast);
  const economyActions = useEconomyActions(state, dispatch, addToast);
  const adminActions = useAdminActions(state, dispatch);
  const systemActions = useSystemActions(state, dispatch, addToast);

  // WELCOME BACK HANDSHAKE
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && state.isInitialized) {
        const timeAway = Date.now() - lastVisibleAtRef.current;
        // Only trigger foreground sync if user was away for > 1 min or has unsynced local changes
        if (timeAway > 60000 || state.isDirty) {
          economyActions.forceSync();
        }
      } else if (document.visibilityState === 'hidden') {
        lastVisibleAtRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isInitialized, state.isDirty, economyActions.forceSync]);

  // AUTO-SYNC HEARTBEAT (PROTECT GAS QUOTA)
  useEffect(() => {
    if (state.isDirty && !state.isBackgroundSyncing && state.isInitialized && state.isOnline) {
      if (syncDebounceRef.current) window.clearTimeout(syncDebounceRef.current);
      syncDebounceRef.current = window.setTimeout(() => {
        economyActions.forceSync(true); // Pass true to indicate auto-sync
      }, 5000); // 5s debounce for local changes
      return () => { if (syncDebounceRef.current) window.clearTimeout(syncDebounceRef.current); };
    }
  }, [state.isDirty, state.isBackgroundSyncing, state.isInitialized, state.isOnline, economyActions.forceSync]);

  const undoDeletedItem = useCallback(() => {
    if (!state.history?.lastDeletedApp) return;
    triggerHaptic('success');
    dispatch({ type: 'SET_VAULT', vault: { 
      apps: [...state.apps, state.history.lastDeletedApp],
      tasks: [...state.tasks, ...(state.history.lastDeletedTasks || [])],
      history: { lastDeletedApp: undefined, lastDeletedTasks: undefined },
      isDirty: true
    }});
    addToast("Pod Restored", "SUCCESS");
  }, [state.apps, state.tasks, state.history, addToast]);

  const value: AppContextType = {
    state,
    dispatch,
    toasts,
    addToast,
    removeToast,
    view: state.view,
    setView,
    setEditingAppId,
    setEditingTaskId,
    setPrefillApp,
    setAdminKey,
    setPipActive,
    isProcessing: state.isAuthenticating,
    isSyncing: state.isSyncing,
    isBackgroundSyncing: state.isBackgroundSyncing,
    isAuthenticating: state.isAuthenticating,
    adminKey: state.adminKey,
    launchingAppName: state.launchingAppName,
    lastBonusAt: state.lastBonusAt,
    lastSparkAt: state.lastSparkAt,
    editingAppId: state.editingAppId,
    editingTaskId: state.editingTaskId,
    setTheme: (theme: Theme) => dispatch({ type: 'SET_VAULT', vault: { theme } }),
    setAdminUnlockTaps: (adminUnlockTaps: number) => dispatch({ type: 'SET_VAULT', vault: { adminUnlockTaps } }),
    adminUnlockTaps: state.adminUnlockTaps,
    installPrompt: state.installPrompt,
    setInstallPrompt: (prompt: any) => dispatch({ type: 'SET_INSTALL_PROMPT', prompt }),
    isInstalled: isStandalone(),
    isPipActive: state.isPipActive,
    undoDeletedItem,
    ...userActions,
    ...economyActions,
    ...adminActions,
    ...systemActions
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};