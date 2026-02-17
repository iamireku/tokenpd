import { UserState, LifestyleRank, Theme, AppView, AdminStats } from '../types';

export type StoreState = UserState & {
  view: AppView;
  previousView: AppView | null;
  editingAppId: string | null;
  editingTaskId: string | null;
  prefillApp: { name: string; icon: string } | null;
  launchingAppName: string | null;
  lastAdminStats?: AdminStats;
  adminKey: string | null;
  isSyncing: boolean;
  isBackgroundSyncing: boolean;
  isAuthenticating: boolean;
  isOnline: boolean;
  installPrompt: any;
};

export type StoreAction = 
  | { type: 'SET_VIEW'; view: AppView }
  | { type: 'SET_VAULT'; vault: Partial<UserState> & { isDirty?: boolean } }
  | { type: 'SET_SYNCING'; status: boolean }
  | { type: 'SET_BACKGROUND_SYNCING'; status: boolean }
  | { type: 'SET_AUTH_STATUS'; status: boolean }
  | { type: 'SET_EDIT_APP'; id: string | null }
  | { type: 'SET_EDIT_TASK'; id: string | null }
  | { type: 'SET_PREFILL_APP'; app: { name: string; icon: string } | null }
  | { type: 'SET_LAUNCHING'; name: string | null }
  | { type: 'SET_ADMIN_STATS'; stats: AdminStats }
  | { type: 'SET_ADMIN_KEY'; key: string | null }
  | { type: 'SET_ONLINE'; status: boolean }
  | { type: 'SET_INSTALL_PROMPT'; prompt: any }
  | { type: 'LOGOUT' };

export const DEFAULT_STATE: StoreState = {
  accountId: '', nickname: '', hashedPin: '', isInitialized: false, points: 0, adPoints: 0, referrals: 0, referralCode: '', usedCodes: [], isPremium: false, isActivated: false, joinedAt: Date.now(), lastSyncAt: Date.now(), lastSeenAt: Date.now(), rank: LifestyleRank.MEMBER, apps: [], tasks: [], pointHistory: [], messages: [], theme: Theme.SYSTEM, unlockedDiscoveryIds: [], lastSeasonResetAt: Date.now(), analyticsUnlocked: false, notificationsEnabled: false, unlockedTrendingSlots: 0, promoRegistry: [], isDirty: false, isMaintenanceMode: false, trendingProjects: [], adConsent: false, hasInstallBonus: false, 
  view: 'DASHBOARD', previousView: null, editingAppId: null, editingTaskId: null, prefillApp: null, launchingAppName: null, adminKey: null, isSyncing: false, isBackgroundSyncing: false, isAuthenticating: false, isOnline: true, installPrompt: null, adminUnlockTaps: 5
};

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_VIEW': 
      if (state.view === action.view) return state;
      return { ...state, previousView: state.view, view: action.view };
    case 'SET_VAULT': return { 
      ...state, 
      ...action.vault, 
      isDirty: action.vault.isDirty !== undefined ? action.vault.isDirty : state.isDirty 
    };
    case 'SET_SYNCING': return { ...state, isSyncing: action.status };
    case 'SET_BACKGROUND_SYNCING': return { ...state, isBackgroundSyncing: action.status };
    case 'SET_AUTH_STATUS': return { ...state, isAuthenticating: action.status };
    case 'SET_EDIT_APP': return { ...state, editingAppId: action.id };
    case 'SET_EDIT_TASK': return { ...state, editingTaskId: action.id };
    case 'SET_PREFILL_APP': return { ...state, prefillApp: action.app };
    case 'SET_LAUNCHING': return { ...state, launchingAppName: action.name };
    case 'SET_ADMIN_STATS': return { ...state, lastAdminStats: action.stats };
    case 'SET_ADMIN_KEY': return { ...state, adminKey: action.key };
    case 'SET_ONLINE': return { ...state, isOnline: action.status };
    case 'SET_INSTALL_PROMPT': return { ...state, installPrompt: action.prompt };
    case 'LOGOUT': return DEFAULT_STATE;
    default: return state;
  }
}