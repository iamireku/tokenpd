
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../store';
import { 
  getSmartLaunchUrl, 
  fetchAppIcon, 
  generateId, 
  calculateNextDueAt, 
  triggerHaptic, 
  playFeedbackSound, 
  formatTimeLeft, 
  ensureHttps, 
  getDomainFromUrl, 
  isSearchFallbackUrl 
} from '../utils';
import { Task } from '../types';
import { CreationStep, LaunchMode, SMART_SIGNALS } from '../constants/podSetup';

export const usePodSetup = () => {
  const { state, addApp, updateApp, setView, editingAppId, setEditingAppId, editingTaskId, setEditingTaskId, isProcessing, toggleNotifications, addToast, setPrefillApp } = useApp();
  
  const editingApp = useMemo(() => editingAppId ? state.apps.find(a => a.id === editingAppId) : null, [editingAppId, state.apps]);
  const editingTasks = useMemo(() => editingAppId ? state.tasks.filter(t => t.appId === editingAppId) : [], [editingAppId, state.tasks]);

  const [currentStep, setCurrentStep] = useState<CreationStep>(editingAppId ? 'TIMER' : 'IDENTITY');
  const [name, setName] = useState(editingApp?.name || state.prefillApp?.name || '');
  const [iconUrl, setIconUrl] = useState(editingApp?.icon || state.prefillApp?.icon || `https://api.dicebear.com/7.x/identicon/svg?seed=new-app`);
  const [isFetchingIcon, setIsFetchingIcon] = useState(false);

  // Launch Configuration
  const [launchMode, setLaunchMode] = useState<LaunchMode>(() => {
    if (!editingApp) return 'SMART';
    if (editingApp.fallbackStoreUrl?.includes('t.me')) return 'TELEGRAM';
    if (!isSearchFallbackUrl(editingApp.fallbackStoreUrl)) return 'URL';
    return 'SMART';
  });
  const [tgHandle, setTgHandle] = useState(editingApp?.fallbackStoreUrl?.includes('t.me') ? editingApp.fallbackStoreUrl.split('t.me/')[1] : '');
  const [customUrl, setCustomUrl] = useState(!editingApp?.fallbackStoreUrl?.includes('t.me') && !isSearchFallbackUrl(editingApp?.fallbackStoreUrl || '') ? editingApp?.fallbackStoreUrl || '' : '');

  // Cycle Configuration
  const [frequency, setFrequency] = useState<'FIXED_DAILY' | 'SLIDING' | 'WINDOW'>('SLIDING');
  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);
  const [taskName, setTaskName] = useState('');
  const [addedTasks, setAddedTasks] = useState<Omit<Task, 'id' | 'appId'>[]>([]);

  // Sync state
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  const [syncH, setSyncH] = useState(0);
  const [syncM, setSyncM] = useState(0);

  // Initialization for editing
  useEffect(() => {
    if (editingAppId && editingTasks.length > 0 && addedTasks.length === 0) {
      setAddedTasks(editingTasks);
    }
  }, [editingAppId, editingTasks]);

  useEffect(() => {
    if (editingTaskId) {
      const task = editingTasks.find(t => t.id === editingTaskId);
      if (task) {
        setTaskName(task.name);
        setFrequency(task.frequency);
        setDays(Math.floor((task.customHours || 0) / 24));
        setHours((task.customHours || 0) % 24);
        setMins(task.customMinutes || 0);
        setCurrentStep('TIMER');
      }
    }
  }, [editingTaskId, editingTasks]);

  // Smart Match State
  const matchedProjectKey = useMemo(() => {
    if (name.length < 2) return null;
    return Object.keys(SMART_SIGNALS).find(key => key.includes(name.toUpperCase()));
  }, [name]);

  const handleApplySmartProfile = useCallback(() => {
    if (!matchedProjectKey) return;
    triggerHaptic('success');
    const profile = SMART_SIGNALS[matchedProjectKey];
    
    setName(matchedProjectKey);
    setTaskName(profile.label);
    setFrequency(profile.freq);
    setDays(profile.d);
    setHours(profile.h);
    setMins(profile.m);

    if (profile.tg) {
      setLaunchMode('TELEGRAM');
      setTgHandle(profile.tg);
    } else if (profile.url) {
      setLaunchMode('URL');
      setCustomUrl(profile.url);
    } else {
      setLaunchMode('SMART');
    }
    
    addToast(`${matchedProjectKey} profile applied`, "SUCCESS");
    setCurrentStep('TIMER');
  }, [matchedProjectKey, addToast]);

  // Favicon/Icon Discovery
  useEffect(() => {
    if (launchMode === 'URL' && customUrl.length > 3 && !editingAppId) {
      const domain = getDomainFromUrl(customUrl);
      if (domain) {
        setIconUrl(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
      }
    }
  }, [customUrl, launchMode, editingAppId]);

  useEffect(() => {
    if (name.length > 2 && !editingAppId && !state.prefillApp && launchMode === 'SMART') {
      setIsFetchingIcon(true);
      const timer = setTimeout(async () => {
        const discoveredIcon = await fetchAppIcon(name);
        setIconUrl(discoveredIcon);
        setIsFetchingIcon(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [name, editingAppId, state.prefillApp, launchMode]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    if (currentStep === 'IDENTITY') {
      setEditingAppId(null);
      setEditingTaskId(null);
      setPrefillApp(null);
      setView('DASHBOARD');
    } else {
      if (editingAppId) {
        setEditingAppId(null);
        setEditingTaskId(null);
        setPrefillApp(null);
        setView('DASHBOARD');
      } else {
        setCurrentStep('IDENTITY');
      }
    }
  }, [currentStep, editingAppId, setEditingAppId, setEditingTaskId, setPrefillApp, setView]);

  const handleFinalize = useCallback(() => {
    if (isProcessing) return;
    
    let finalUrl = '';
    if (launchMode === 'TELEGRAM') finalUrl = `https://t.me/${tgHandle.replace('@', '').trim()}`;
    else if (launchMode === 'URL') finalUrl = ensureHttps(customUrl);
    else finalUrl = getSmartLaunchUrl(name);

    if (editingAppId) {
      updateApp({ ...editingApp!, name, icon: iconUrl, fallbackStoreUrl: finalUrl }, addedTasks.map(t => (t as any).id ? t as Task : { ...t, id: generateId(), appId: editingAppId } as Task));
      addToast(`${name} Pod updated`, "SUCCESS");
    } else {
      addApp({ name, icon: iconUrl, fallbackStoreUrl: finalUrl }, addedTasks);
      addToast(`${name} Pod created successfully`, "SUCCESS");
    }
    triggerHaptic('success');
    playFeedbackSound('uplink');
    setEditingAppId(null);
    setEditingTaskId(null);
    setPrefillApp(null);
    setView('DASHBOARD');
  }, [isProcessing, launchMode, tgHandle, customUrl, name, editingAppId, editingApp, iconUrl, addedTasks, updateApp, addApp, addToast, setEditingAppId, setEditingTaskId, setPrefillApp, setView]);

  const handleAddTask = useCallback(() => {
    if (isProcessing || !taskName.trim()) return;
    triggerHaptic('medium');
    
    const totalHours = (days * 24) + hours;
    let nextDueAt: number;

    if (isSyncEnabled && frequency !== 'FIXED_DAILY') {
      const remainingMs = (syncH * 3600000) + (syncM * 60000);
      const durationMs = (totalHours * 3600000) + (mins * 60000);
      const offset = remainingMs - durationMs;
      
      nextDueAt = calculateNextDueAt({ 
        frequency, 
        customHours: totalHours, 
        customMinutes: mins 
      }, Date.now() + offset);
    } else if (!isSyncEnabled) {
      nextDueAt = Date.now();
    } else {
      nextDueAt = calculateNextDueAt({ 
        frequency, 
        customHours: totalHours, 
        customMinutes: mins 
      }, Date.now());
    }

    const newTaskData: Omit<Task, 'id' | 'appId'> = {
      name: taskName.trim().toUpperCase(),
      frequency, customHours: totalHours, customMinutes: mins,
      nextDueAt, streak: 0, efficiency: 100, totalLatencyMs: 0, taskDuration: 0,
      notificationEnabled: true, createdAt: Date.now()
    };
    
    if (editingTaskId) {
      setAddedTasks(prev => prev.map(t => (t as any).id === editingTaskId ? { ...t, ...newTaskData } : t));
      setEditingTaskId(null);
      addToast("Task updated in list", "SUCCESS");
    } else {
      setAddedTasks(prev => [...prev, newTaskData]);
      addToast("Task added to list", "SUCCESS");
    }
    
    setTaskName('');
    setDays(1);
    setHours(0);
    setMins(0);
    setFrequency('SLIDING');
    setIsSyncEnabled(false);
    setSyncH(0);
    setSyncM(0);
  }, [isProcessing, taskName, days, hours, isSyncEnabled, frequency, syncH, syncM, mins, editingTaskId, setEditingTaskId, addToast]);

  const applyPreset = useCallback((h: number) => {
    triggerHaptic('medium');
    setDays(Math.floor(h / 24));
    setHours(h % 24);
    setMins(0);
  }, []);

  const removeTaskFromList = useCallback((idx: number) => {
    triggerHaptic('light');
    setAddedTasks(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const editTaskFromList = useCallback((idx: number) => {
    const t = addedTasks[idx];
    triggerHaptic('light');
    setTaskName(t.name);
    setFrequency(t.frequency);
    setDays(Math.floor((t.customHours || 0) / 24));
    setHours((t.customHours || 0) % 24);
    setMins(t.customMinutes || 0);
    if ((t as any).id) {
      setEditingTaskId((t as any).id);
    } else {
      setAddedTasks(prev => prev.filter((_, i) => i !== idx));
    }
  }, [addedTasks, setEditingTaskId]);

  const nextHarvestPreview = useMemo(() => {
    const totalHours = (days * 24) + hours;
    const nextTime = calculateNextDueAt({ 
      frequency, 
      customHours: totalHours, 
      customMinutes: mins 
    }, Date.now());
    
    const d = new Date(nextTime);
    const diff = nextTime - Date.now();
    
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const dayStr = d.toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : 'Tomorrow';
    
    return {
      full: `${dayStr} @ ${timeStr}`,
      relative: formatTimeLeft(diff)
    };
  }, [days, hours, mins, frequency]);

  return {
    state,
    isProcessing,
    currentStep,
    setCurrentStep,
    identity: {
      name, setName, iconUrl, setIconUrl, isFetchingIcon,
      launchMode, setLaunchMode, tgHandle, setTgHandle, customUrl, setCustomUrl,
      matchedProjectKey, handleApplySmartProfile
    },
    tasks: {
      taskName, setTaskName, addedTasks, frequency, setFrequency,
      days, setDays, hours, setHours, mins, setMins,
      isSyncEnabled, setIsSyncEnabled, syncH, setSyncH, syncM, setSyncM,
      handleAddTask, removeTaskFromList, editTaskFromList, applyPreset, nextHarvestPreview
    },
    actions: {
      handleBack, handleFinalize, toggleNotifications
    },
    editing: {
      editingAppId, editingTaskId
    }
  };
};
