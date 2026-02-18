import React, { useCallback } from 'react';
import { StoreState, StoreAction } from '../reducer';
import { secureFetch } from '../../services/transport';
import { generateId, calculateNextDueAt, getPersistentVault } from '../../utils';

export const useEconomyActions = (state: StoreState, dispatch: React.Dispatch<StoreAction>, addToast: any) => {
  const forceSync = useCallback(async () => {
    if (!state.isOnline || state.isBackgroundSyncing || !state.isInitialized) return;
    
    // Check if there is actual data to sync
    if (!state.isDirty && state.lastSyncAt && (Date.now() - state.lastSyncAt < 30000)) {
        return;
    }

    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const persistentVault = getPersistentVault(state);
      const res = await secureFetch({ action: 'PUSH', ...persistentVault }, state.hashedPin, true);
      
      if (res?.success) {
        dispatch({ 
            type: 'SET_VAULT', 
            vault: { 
                ...res.vault,
                trendingProjects: res.trendingProjects || state.trendingProjects,
                partnerManifest: res.partnerManifest || state.partnerManifest,
                isMaintenanceMode: false,
                lastSyncAt: Date.now(),
                isDirty: false 
            } 
        });
      } else if (res?.error === 'MAINTENANCE_ACTIVE') {
        dispatch({ type: 'SET_VAULT', vault: { isMaintenanceMode: true } });
      }
    } finally { dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false }); }
  }, [state, dispatch]);

  const claimApp = useCallback(async (id: string, offsetMs: number = 0) => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ action: 'CLAIM_POD', accountId: state.accountId, hashedPin: state.hashedPin, appId: id, offsetMs }, state.hashedPin);
      if (res?.success) { 
        dispatch({ 
          type: 'SET_VAULT', 
          vault: { 
            ...res.vault, 
            lastSyncAt: Date.now(),
            partnerManifest: res.partnerManifest || state.partnerManifest
          } 
        }); 
        addToast("Signal Secured", "SUCCESS"); 
      } else if (res?.error === 'MAINTENANCE_ACTIVE') {
        dispatch({ type: 'SET_VAULT', vault: { isMaintenanceMode: true } });
      }
    } finally { dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false }); }
  }, [state.accountId, state.hashedPin, dispatch, addToast]);

  const resetApp = useCallback((id: string, offsetMs: number = 0, taskId?: string) => {
    const now = Date.now();
    const nextTasks = state.tasks.map(t => {
      if (taskId ? t.id === taskId : t.appId === id) return { ...t, nextDueAt: calculateNextDueAt(t, now + offsetMs), streak: 0 };
      return t;
    });
    dispatch({ type: 'SET_VAULT', vault: { tasks: nextTasks, isDirty: true } });
  }, [state.tasks, dispatch]);

  const resetTask = useCallback((id: string) => {
    const now = Date.now();
    const nextTasks = state.tasks.map(t => t.id === id ? { ...t, nextDueAt: calculateNextDueAt(t, now), streak: 0 } : t);
    dispatch({ type: 'SET_VAULT', vault: { tasks: nextTasks, isDirty: true } });
  }, [state.tasks, dispatch]);

  const deleteTask = useCallback((id: string) => {
    const taskToDelete = state.tasks.find(t => t.id === id);
    if (!taskToDelete) return;
    dispatch({ type: 'SET_VAULT', vault: { 
      tasks: state.tasks.filter(t => t.id !== id), 
      history: { lastDeletedTasks: [taskToDelete] },
      isDirty: true 
    } });
  }, [state.tasks, dispatch]);

  const addApp = useCallback((app: any, tasks: any[]) => {
    const id = generateId();
    dispatch({ type: 'SET_VAULT', vault: { 
      apps: [...state.apps, { ...app, id }], 
      tasks: [...state.tasks, ...tasks.map(t => ({ ...t, id: generateId(), appId: id }))],
      isDirty: true
    } });
    return true;
  }, [state.apps, state.tasks, dispatch]);

  const updateApp = useCallback((app: any, tasks: any[]) => {
    dispatch({ type: 'SET_VAULT', vault: { 
      apps: [...state.apps.filter(a => a.id !== app.id), app], 
      tasks: [...state.tasks.filter(t => t.appId !== app.id), ...tasks],
      isDirty: true
    } });
  }, [state.apps, state.tasks, dispatch]);

  const deleteApp = useCallback((id: string) => {
    const appToDelete = state.apps.find(a => a.id === id);
    const tasksToDelete = state.tasks.filter(t => t.appId === id);
    if (!appToDelete) return;
    
    dispatch({ type: 'SET_VAULT', vault: { 
      apps: state.apps.filter(a => a.id !== id), 
      tasks: state.tasks.filter(t => t.appId !== id),
      history: { lastDeletedApp: appToDelete, lastDeletedTasks: tasksToDelete },
      isDirty: true
    } });
  }, [state.apps, state.tasks, dispatch]);

  const redeemCode = useCallback(async (code: string) => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ action: 'REDEEM_PROTOCOL', accountId: state.accountId, hashedPin: state.hashedPin, code }, state.hashedPin);
      if (res?.success) { 
          dispatch({ 
            type: 'SET_VAULT', 
            vault: { 
              ...res.vault, 
              lastSyncAt: Date.now(),
              partnerManifest: res.partnerManifest || state.partnerManifest
            } 
          }); 
          return { success: true, message: res.message }; 
      }
      return { success: false, message: res?.error };
    } finally {
      dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false });
    }
  }, [state.accountId, state.hashedPin, dispatch]);

  const claimReferralCode = useCallback(async (code: string) => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ action: 'CLAIM_REFERRAL', accountId: state.accountId, hashedPin: state.hashedPin, code }, state.hashedPin);
      if (res?.success) { 
          dispatch({ 
            type: 'SET_VAULT', 
            vault: { 
              ...res.vault, 
              lastSyncAt: Date.now(),
              partnerManifest: res.partnerManifest || state.partnerManifest
            } 
          }); 
          return { success: true, message: res.message || 'Bonus Claimed' }; 
      }
      return { success: false, message: res?.error || 'Claim Failed' };
    } finally {
      dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false });
    }
  }, [state.accountId, state.hashedPin, dispatch]);

  const submitVote = useCallback(async (id: string, opt: string) => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ 
        action: 'VOTE', 
        accountId: state.accountId, 
        hashedPin: state.hashedPin, 
        surveyId: id, 
        optionLabel: opt 
      }, state.hashedPin);
      if (res?.success) {
          dispatch({ type: 'SET_VAULT', vault: { ...res.vault, lastSyncAt: Date.now() } });
          return true;
      }
      return false;
    } finally {
      dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false });
    }
  }, [state.accountId, state.hashedPin, dispatch]);

  const igniteSpark = useCallback(async () => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ action: 'IGNITE_SPARK', accountId: state.accountId, hashedPin: state.hashedPin }, state.hashedPin);
      if (res?.success) {
          dispatch({ type: 'SET_VAULT', vault: { ...res.vault, lastSyncAt: Date.now() } });
      }
    } finally {
      dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false });
    }
  }, [state.accountId, state.hashedPin, dispatch]);

  const unlockDiscovery = useCallback(async (id: string, cost: number) => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ action: 'PURCHASE_UNLOCK', accountId: state.accountId, hashedPin: state.hashedPin, projectId: id, cost }, state.hashedPin);
      if (res?.success) {
          dispatch({ type: 'SET_VAULT', vault: { ...res.vault, lastSyncAt: Date.now() } });
      }
    } finally {
      dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false });
    }
  }, [state.accountId, state.hashedPin, dispatch]);

  const claimDailyBonus = useCallback(async () => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ action: 'DAILY_BONUS', accountId: state.accountId, hashedPin: state.hashedPin }, state.hashedPin);
      if (res?.success) {
          dispatch({ type: 'SET_VAULT', vault: { ...res.vault, lastSyncAt: Date.now() } });
      }
    } finally {
      dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false });
    }
  }, [state.accountId, state.hashedPin, dispatch]);

  const rechargeSpark = useCallback(() => dispatch({ type: 'SET_VAULT', vault: { lastSparkAt: 0, isDirty: true } }), [dispatch]);
  const unlockAnalytics = useCallback(() => dispatch({ type: 'SET_VAULT', vault: { analyticsUnlocked: true, isDirty: true } }), [dispatch]);

  return { 
    forceSync, claimApp, resetApp, resetTask, deleteTask, addApp, updateApp, deleteApp, 
    redeemCode, claimReferralCode, submitVote, igniteSpark, unlockDiscovery, claimDailyBonus,
    rechargeSpark, unlockAnalytics
  };
};