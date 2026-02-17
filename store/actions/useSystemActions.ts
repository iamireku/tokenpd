import React, { useCallback, useState } from 'react';
import { StoreState, StoreAction } from '../reducer';
import { exportVault } from '../../utils';

// Fix: Import React to resolve React.Dispatch namespace error
export const useSystemActions = (state: StoreState, dispatch: React.Dispatch<StoreAction>, addToast: any) => {
  const [tapCounter, setTapCounter] = useState(0);

  const triggerLaunch = useCallback((name: string, url: string) => {
    dispatch({ type: 'SET_LAUNCHING', name });
    setTimeout(() => { 
      window.open(url, '_blank'); 
      dispatch({ type: 'SET_LAUNCHING', name: null }); 
    }, 1500);
  }, [dispatch]);

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
      isDirty: true // Fix: Ensure dismissal triggers a cloud sync
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