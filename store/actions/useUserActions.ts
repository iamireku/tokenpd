import React, { useCallback } from 'react';
import { StoreState, StoreAction } from '../reducer';
import { secureFetch } from '../../services/transport';
import { generateId, sha256 } from '../../utils';
import { DEFAULT_STATE } from '../reducer';
import { STORAGE_KEY, VAPID_PUBLIC_KEY, PUBLIC_GUEST_SECRET } from '../../constants';

// Fix: Import React to resolve React.Dispatch namespace error
export const useUserActions = (state: StoreState, dispatch: React.Dispatch<StoreAction>, addToast: any) => {
  const onboard = useCallback(async (nickname: string, pin: string, mode: 'REGISTER' | 'LOGIN', referralCode?: string) => {
    dispatch({ type: 'SET_AUTH_STATUS', status: true });
    const hashedPin = await sha256(pin);
    try {
      if (mode === 'REGISTER') {
        const accountId = `a_${generateId()}`;
        const refCode = `REF-${generateId().slice(0, 5).toUpperCase()}`;
        const initial = { ...DEFAULT_STATE, accountId, nickname, hashedPin, referralCode: refCode, referredBy: referralCode, points: referralCode ? 50 : 0, isInitialized: true };
        const res = await secureFetch({ action: 'PUSH', ...initial }, hashedPin);
        if (res?.success) { 
          dispatch({ 
            type: 'SET_VAULT', 
            vault: { 
              ...initial, 
              trendingProjects: res.trendingProjects,
              partnerManifest: res.partnerManifest || []
            } 
          }); 
          return true; 
        }
        if (res?.error === 'NICKNAME_TAKEN') addToast("Nickname Taken", "ERROR");
        return false;
      } else {
        const res = await secureFetch({ action: 'FETCH', nickname, hashedPin }, hashedPin);
        if (res?.success) { 
          dispatch({ 
            type: 'SET_VAULT', 
            vault: { 
              ...res.vault, 
              hashedPin, 
              isInitialized: true,
              partnerManifest: res.partnerManifest || []
            } 
          }); 
          return true; 
        }
        return false;
      }
    } finally { dispatch({ type: 'SET_AUTH_STATUS', status: false }); }
  }, [dispatch, addToast]);

  const updatePin = useCallback(async (currentPin: string, newPin: string) => {
    dispatch({ type: 'SET_AUTH_STATUS', status: true });
    try {
      const currentHashed = await sha256(currentPin);
      const newHashed = await sha256(newPin);

      if (currentHashed !== state.hashedPin) {
        addToast("Current PIN Incorrect", "ERROR");
        return false;
      }

      const res = await secureFetch({ 
        action: 'UPDATE_PIN', 
        accountId: state.accountId, 
        nickname: state.nickname,
        hashedPin: state.hashedPin, 
        newHashedPin: newHashed 
      }, state.hashedPin);

      if (res?.success) {
        dispatch({ type: 'SET_VAULT', vault: { hashedPin: newHashed } });
        addToast("Security PIN Updated", "SUCCESS");
        return true;
      } else {
        addToast(res?.error || "Update Failed", "ERROR");
        return false;
      }
    } finally {
      dispatch({ type: 'SET_AUTH_STATUS', status: false });
    }
  }, [state.accountId, state.nickname, state.hashedPin, dispatch, addToast]);

  const submitFeedback = useCallback(async (comment: string, email: string, type?: string) => {
    const isGuest = !state.isInitialized;
    const res = await secureFetch({ 
      action: 'FEEDBACK', 
      accountId: isGuest ? 'GUEST' : state.accountId, 
      nickname: isGuest ? 'GUEST' : state.nickname, 
      comment, email, type 
    }, isGuest ? PUBLIC_GUEST_SECRET : state.hashedPin);
    return !!res?.success;
  }, [state]);

  const toggleNotifications = useCallback(async () => {
    if (state.notificationsEnabled) {
      dispatch({ type: 'SET_VAULT', vault: { notificationsEnabled: false, pushSubscription: null } });
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({ 
          userVisibleOnly: true, 
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) 
        });
        dispatch({ type: 'SET_VAULT', vault: { notificationsEnabled: true, pushSubscription: sub.toJSON() } });
        addToast("Alerts Enabled", "SUCCESS");
      }
    } catch { addToast("Not Supported", "ERROR"); }
  }, [state.notificationsEnabled, dispatch, addToast]);

  const signOut = useCallback(() => { 
    localStorage.removeItem(STORAGE_KEY); 
    dispatch({ type: 'LOGOUT' }); 
  }, [dispatch]);

  const deleteAccount = useCallback(async () => {
    const res = await secureFetch({ 
      action: 'DELETE_ACCOUNT', 
      accountId: state.accountId, 
      nickname: state.nickname, 
      hashedPin: state.hashedPin 
    }, state.hashedPin);
    if (res?.success) { signOut(); return true; }
    return false;
  }, [state, signOut]);

  return { onboard, updatePin, submitFeedback, toggleNotifications, signOut, deleteAccount };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}