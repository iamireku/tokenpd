import React, { useCallback } from 'react';
import { StoreState, StoreAction } from '../reducer';
import { secureFetch } from '../../services/transport';
import { generateId, calculateNextDueAt, getPersistentVault } from '../../utils';
import { STORAGE_KEY } from '../../constants';

export const useEconomyActions = (state: StoreState, dispatch: React.Dispatch<StoreAction>, addToast: any) => {
  const forceSync = useCallback(async (isAuto: boolean = false) => {
    if (!state.isOnline || state.isBackgroundSyncing || !state.isInitialized) return;
    
    // QUOTA PROTECTION:
    // If it's an auto-sync (heartbeat), only proceed if data is dirty.
    // If it's manual (forceSync call), proceed anyway.
    if (isAuto && !state.isDirty && state.lastSyncAt && (Date.now() - state.lastSyncAt < 60000)) {
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
    const now = Date.now();
    
    // PHASE 1: LOCAL-FIRST UPDATE
    const syncAnchor = now + Number(offsetMs || 0);
    const updatedTasks = state.tasks.map(t => {
      if (t.appId === id && t.nextDueAt <= now + 10000) {
        const hours = (typeof t.customHours === 'number') ? t.customHours : 24;
        const mins = (typeof t.customMinutes === 'number') ? t.customMinutes : 0;
        const durationMs = (hours * 3600000) + (mins * 60000);
        
        let nextDue;
        if (t.frequency === 'FIXED_DAILY') {
          const d = new Date(syncAnchor);
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() + 1);
          nextDue = d.getTime();
        } else if (t.frequency === 'WINDOW') {
          const d = new Date(syncAnchor);
          d.setHours(0, 0, 0, 0);
          while (d.getTime() <= syncAnchor) d.setTime(d.getTime() + durationMs);
          nextDue = d.getTime();
        } else {
          nextDue = syncAnchor + durationMs;
        }

        return { ...t, nextDueAt: nextDue, streak: (t.streak || 0) + 1, lastCompletedAt: now };
      }
      return t;
    });

    const tempState = { ...state, tasks: updatedTasks, isDirty: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistentVault(tempState)));
    dispatch({ type: 'SET_VAULT', vault: { tasks: updatedTasks, isDirty: true } });

    // PHASE 2: CLOUD SYNC
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ 
        action: 'CLAIM_POD', 
        accountId: state.accountId, 
        hashedPin: state.hashedPin, 
        appId: id, 
        offsetMs 
      }, state.hashedPin);

      if (res?.success) { 
        dispatch({ 
          type: 'SET_VAULT', 
          vault: { 
            ...res.vault, 
            lastSyncAt: Date.now(),
            isDirty: false 
          } 
        }); 
        addToast("Signal Secured", "SUCCESS"); 
      } else if (res?.error === 'MAINTENANCE_ACTIVE') {
        dispatch({ type: 'SET_VAULT', vault: { isMaintenanceMode: true } });
      }
    } finally { 
      dispatch({ type: 'SET_BACKGROUND_SYNCING', status: false }); 
    }
  }, [state, dispatch, addToast]);

  const logPartnerHandshake = useCallback(async (appId: string) => {
    if (!state.isOnline) return;
    await secureFetch({ 
      action: 'LOG_HANDSHAKE', 
      accountId: state.accountId, 
      hashedPin: state.hashedPin, 
      appId 
    }, state.hashedPin, true);
  }, [state.accountId, state.hashedPin, state.isOnline]);

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
  }, [state.accountId, state.hashedPin, dispatch, state.partnerManifest]);

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
  }, [state.accountId, state.hashedPin, dispatch, state.partnerManifest]);

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

  const igniteSpark = useCallback(async (appId?: string) => {
    dispatch({ type: 'SET_BACKGROUND_SYNCING', status: true });
    try {
      const res = await secureFetch({ action: 'IGNITE_SPARK', accountId: state.accountId, hashedPin: state.hashedPin, appId }, state.hashedPin);
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
    forceSync, claimApp, logPartnerHandshake, resetApp, resetTask, deleteTask, addApp, updateApp, deleteApp, 
    redeemCode, claimReferralCode, submitVote, igniteSpark, unlockDiscovery, claimDailyBonus,
    rechargeSpark, unlockAnalytics
  };
};