import React, { useCallback } from 'react';
import { StoreState, StoreAction } from '../reducer';
import { secureFetch } from '../../services/transport';
import { RewardType } from '../../types';

// Fix: Import React to resolve React.Dispatch namespace error
export const useAdminActions = (state: StoreState, dispatch: React.Dispatch<StoreAction>) => {
  const adminLogin = useCallback(async (k: string) => {
    const res = await secureFetch({ action: 'ADMIN_LOGIN', adminKey: k }, k);
    return res?.success ? { success: true, sessionToken: res.sessionToken } : { success: false, error: res?.error };
  }, []);

  const fetchNetworkStats = useCallback(async (t: string) => {
    const res = await secureFetch({ action: 'ADMIN_FETCH_STATS', sessionToken: t }, t, true);
    if (res?.success) dispatch({ type: 'SET_ADMIN_STATS', stats: res });
    return res;
  }, [dispatch]);

  const adminLookupUser = useCallback((k: string, id: string) => 
    secureFetch({ action: 'ADMIN_LOOKUP_USER', sessionToken: k, accountId: id }, k)
  , []);

  const adminInjectPoints = useCallback(async (k: string, id: string, a: number) => 
    !!(await secureFetch({ action: 'ADMIN_INJECT_POINTS', sessionToken: k, accountId: id, amount: a }, k))?.success
  , []);

  const adminToggleMaintenance = useCallback(async (k: string, e: boolean) => 
    !!(await secureFetch({ action: 'ADMIN_TOGGLE_MAINTENANCE', sessionToken: k, enabled: e }, k))?.success
  , []);

  const adminTriggerSeasonalReset = useCallback(async (k: string) => 
    !!(await secureFetch({ action: 'ADMIN_SEASONAL_RESET', sessionToken: k }, k))?.success
  , []);

  const adminTriggerTrendingUpdate = useCallback(async (k: string) => 
    (await secureFetch({ action: 'ADMIN_TRENDING_UPDATE', sessionToken: k }, k))?.success ? { success: true } : { success: false }
  , []);

  const adminTerminateSession = useCallback(async (k: string, id: string) => 
    !!(await secureFetch({ action: 'ADMIN_TERMINATE_SESSION', sessionToken: k, accountId: id }, k))?.success
  , []);

  const adminFetchFeedback = useCallback((k: string) => 
    secureFetch({ action: 'ADMIN_FETCH_FEEDBACK', sessionToken: k }, k)
  , []);

  const addBroadcast = useCallback(async (broadcast: any, isGlobal: boolean) => {
    await secureFetch({ action: 'ADMIN_PUSH_BROADCAST', sessionToken: state.adminKey, broadcast, isGlobal }, state.adminKey || '');
  }, [state.adminKey]);

  const createProtocolCode = useCallback(async (type: RewardType, data: any) => {
    await secureFetch({ action: 'ADMIN_CREATE_PROTOCOL', sessionToken: state.adminKey, protocol: { ...data, reward: type } }, state.adminKey || '');
  }, [state.adminKey]);

  const deleteProtocolCode = useCallback(async (id: string) => {
    await secureFetch({ action: 'ADMIN_DELETE_PROTOCOL', sessionToken: state.adminKey, id }, state.adminKey || '');
  }, [state.adminKey]);

  const adminExportGlobal = useCallback(async (k: string) => {
    const res = await secureFetch({ action: 'ADMIN_EXPORT_GLOBAL_LEDGER', sessionToken: k }, k);
    if (res?.success) {
      const blob = new Blob([JSON.stringify(res.ledger, null, 2)], { type: 'application/json' });
      const link = document.createElement('a'); 
      link.href = URL.createObjectURL(blob); 
      link.download = `ledger_${Date.now()}.json`; 
      link.click();
    }
  }, []);

  return {
    adminLogin, fetchNetworkStats, adminLookupUser, adminInjectPoints, adminToggleMaintenance,
    adminTriggerSeasonalReset, adminTriggerTrendingUpdate, adminTerminateSession, adminFetchFeedback,
    addBroadcast, createProtocolCode, deleteProtocolCode, adminExportGlobal
  };
};