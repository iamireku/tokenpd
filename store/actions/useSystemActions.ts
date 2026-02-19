import React, { useCallback, useState } from 'react';
import { StoreState, StoreAction } from '../reducer';
import { exportVault, isSearchFallbackUrl, getSmartLaunchUrl, getPersistentVault } from '../../utils';
import { STORAGE_KEY } from '../../constants';

export const useSystemActions = (state: StoreState, dispatch: React.Dispatch<StoreAction>, addToast: any) => {
  const [tapCounter, setTapCounter] = useState(0);

  const triggerLaunch = useCallback((name: string, url: string) => {
    const resolvedUrl = isSearchFallbackUrl(url) ? getSmartLaunchUrl(name) : url;

    // UI Feedback: Set launching state immediately
    dispatch({ type: 'SET_LAUNCHING', name });

    // BLOCKING PERSISTENCE: 
    // Force a local storage write of the CURRENT vault state before we leave the context.
    // This ensures that if the OS kills the browser, the reload will see the latest "Harvested" data.
    try {
      const vaultToSave = getPersistentVault(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vaultToSave));
    } catch (e) {
      console.warn("Pre-launch persistence failed", e);
    }

    // PHASE 1: SIMULATION (1000ms)
    // We allow the UI to play the "Scanning" animation.
    
    // PHASE 2: EXECUTION (After 1s)
    setTimeout(() => {
      const newWindow = window.open(resolvedUrl, '_blank');
      
      // Fallback if window.open was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.assign(resolvedUrl);
      }
    }, 1000);

    // PHASE 3: CLEANUP (Fade out overlay)
    setTimeout(() => { 
      dispatch({ type: 'SET_LAUNCHING', name: null }); 
    }, 1800);
  }, [state, dispatch]);

  const exportData = useCallback(() => exportVault(state), [state]);

  const importData = useCallback((json: string) => { 
    try { 
      const p = JSON.parse(json); 
      if (p.accountId) {
        dispatch({ type: 'SET_VAULT', vault: p }); 
        addToast("Vault Imported", "SUCCESS");
      }
    } catch { 
      addToast("Invalid JSON", "ERROR"); 
    } 
  }, [dispatch, addToast]);

  const dismissMessage = useCallback((id: string) => {
    dispatch({ type: 'SET_VAULT', vault: { 
      messages: state.messages.map(m => m.id === id ? { ...m, isRead: true } : m),
      isDirty: true 
    }});
  }, [state.messages, dispatch]);

  const triggerSecretTap = useCallback(() => {
    setTapCounter(p => { 
      if (p + 1 >= (state.adminUnlockTaps || 5)) { 
        dispatch({ type: 'SET_VIEW', view: 'ADMIN_AUTH' }); 
        return 0; 
      }
      return p + 1;
    });
  }, [state.adminUnlockTaps, dispatch]);

  return { triggerLaunch, exportData, importData, dismissMessage, triggerSecretTap };
};