
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { 
  ChevronLeft, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Sparkles, 
  Plus, 
  Calendar,
  Globe,
  Loader2,
  Clock,
  CheckCircle2,
  Check,
  X,
  Target,
  Grid,
  Link2,
  ArrowRight,
  Save,
  ShieldAlert,
  Bell,
  BellOff,
  AlertTriangle
} from 'lucide-react';
import { detectOS, getSmartLaunchUrl, fetchAppIcon, generateId, calculateNextDueAt, triggerHaptic, playFeedbackSound } from '../utils';
import { Task } from '../types';

type CreationStep = 'IDENTITY' | 'TIMER';

export const CreatePod: React.FC = () => {
  const { state, addApp, updateApp, setView, editingAppId, setEditingAppId, editingTaskId, setEditingTaskId, isProcessing, toggleNotifications, addToast, setPrefillApp } = useApp();
  
  const editingApp = useMemo(() => editingAppId ? state.apps.find(a => a.id === editingAppId) : null, [editingAppId, state.apps]);
  const editingTasks = useMemo(() => editingAppId ? state.tasks.filter(t => t.appId === editingAppId) : [], [editingAppId, state.tasks]);

  const [currentStep, setCurrentStep] = useState<CreationStep>(editingAppId ? 'TIMER' : 'IDENTITY');
  const [name, setName] = useState(editingApp?.name || state.prefillApp?.name || '');
  const [iconUrl, setIconUrl] = useState(editingApp?.icon || state.prefillApp?.icon || `https://api.dicebear.com/7.x/identicon/svg?seed=new-app`);
  const [isFetchingIcon, setIsFetchingIcon] = useState(false);

  // Cycle Configuration
  const [frequency, setFrequency] = useState<'FIXED_DAILY' | 'SLIDING' | 'WINDOW'>('SLIDING');
  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);
  const [cycleName, setCycleName] = useState('');
  const [addedTasks, setAddedTasks] = useState<Omit<Task, 'id' | 'appId'>[]>(editingTasks);

  const [showPostAddDialog, setShowPostAddDialog] = useState(false);

  // Timer Alignment State
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  const [syncH, setSyncH] = useState(0);
  const [syncM, setSyncM] = useState(0);

  // Load specific task details if editingTaskId is set
  useEffect(() => {
    if (editingTaskId) {
      const task = editingTasks.find(t => t.id === editingTaskId);
      if (task) {
        setCycleName(task.name);
        setFrequency(task.frequency);
        setDays(Math.floor((task.customHours || 0) / 24));
        setHours((task.customHours || 0) % 24);
        setMins(task.customMinutes || 0);
        setCurrentStep('TIMER');
      }
    } else if (editingTasks.length > 0) {
      setCycleName(editingTasks[0].name);
      setFrequency(editingTasks[0].frequency);
      setDays(Math.floor((editingTasks[0].customHours || 0) / 24));
      setHours((editingTasks[0].customHours || 0) % 24);
      setMins(editingTasks[0].customMinutes || 0);
    }
  }, [editingTaskId, editingTasks]);

  useEffect(() => {
    // Only auto-fetch if we don't have prefill data and aren't editing
    if (name.length > 2 && !editingAppId && !state.prefillApp) {
      setIsFetchingIcon(true);
      const timer = setTimeout(async () => {
        const discoveredIcon = await fetchAppIcon(name);
        setIconUrl(discoveredIcon);
        setIsFetchingIcon(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [name, editingAppId, state.prefillApp]);

  const handleBackToDashboard = () => {
    triggerHaptic('light');
    setEditingAppId(null);
    setEditingTaskId(null);
    setPrefillApp(null);
    setView('DASHBOARD');
  };

  const handleFinalize = () => {
    if (isProcessing) return;
    if (editingAppId) {
      updateApp({ ...editingApp!, name, icon: iconUrl }, addedTasks.map(t => (t as any).id ? t as Task : { ...t, id: generateId(), appId: editingAppId } as Task));
      addToast(`${name} Pod Updated`, "SUCCESS");
    } else {
      addApp({ name, icon: iconUrl, fallbackStoreUrl: getSmartLaunchUrl(name) }, addedTasks);
      addToast(`${name} Pod Created Successfully`, "SUCCESS");
    }
    triggerHaptic('success');
    playFeedbackSound('uplink');
    setEditingAppId(null);
    setEditingTaskId(null);
    setPrefillApp(null);
    setView('DASHBOARD');
  };

  const handleAddTask = () => {
    if (isProcessing) return;
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
      name: cycleName, frequency, customHours: totalHours, customMinutes: mins,
      nextDueAt, streak: 0, efficiency: 100, totalLatencyMs: 0, taskDuration: 0,
      notificationEnabled: true, createdAt: Date.now()
    };
    
    if (editingTaskId) {
      setAddedTasks(prev => prev.map(t => (t as any).id === editingTaskId ? { ...t, ...newTaskData } : t));
      setEditingTaskId(null);
    } else {
      setAddedTasks(prev => [...prev, newTaskData]);
    }
    
    setShowPostAddDialog(true);
    setIsSyncEnabled(false);
    setSyncH(0);
    setSyncM(0);
  };

  const TimeInput = ({ label, value, setter, max = 99, color = "text-[var(--primary)]" }: any) => {
    const [localString, setLocalString] = useState(value.toString());

    useEffect(() => {
      setLocalString(value.toString());
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, ''); 
      if (val === '') {
        setLocalString('');
        setter(0);
        return;
      }
      const num = Math.min(max, parseInt(val));
      setLocalString(num.toString());
      setter(num);
    };

    const handleBlur = () => {
      if (localString === '') {
        setLocalString('0');
        setter(0);
      }
    };

    return (
      <div className="flex flex-col items-center">
        <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); setter(Math.min(max, value + 1)); }} className={`${color} active:scale-125 transition-transform disabled:opacity-30 p-1`}><ChevronUp size={24} strokeWidth={4} /></button>
        <input 
          type="number" 
          value={localString}
          onBlur={handleBlur}
          inputMode="numeric"
          disabled={isProcessing}
          onChange={handleChange} 
          className="w-12 h-12 bg-[var(--bg-main)] rounded-xl border-2 border-[var(--primary)] text-lg font-black text-center outline-none focus:shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50 text-[var(--primary)] shadow-sm" 
        />
        <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); setter(Math.max(0, value - 1)); }} className={`${color} active:scale-125 transition-transform disabled:opacity-30 p-1`}><ChevronDown size={24} strokeWidth={4} /></button>
        <span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-main)]">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-transparent pb-32 relative">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-main)]/80 backdrop-blur-xl border-b border-[var(--primary)]/20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); if (currentStep === 'IDENTITY') { handleBackToDashboard(); } else { if (editingAppId) { handleBackToDashboard(); } else setCurrentStep('IDENTITY'); } }} className="p-1.5 bg-[var(--bg-card)] rounded-lg border border-[var(--primary)] text-[var(--primary)] disabled:opacity-30 transition-all"><ChevronLeft size={18} strokeWidth={3} /></button>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] leading-none">Pod Setup</h1>
            <p className="text-[var(--primary)] text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">{currentStep === 'IDENTITY' ? 'Identity' : 'Signal configuration'}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${currentStep === 'IDENTITY' ? 'bg-[var(--primary)]' : 'bg-[var(--primary)]/20'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${currentStep === 'TIMER' ? 'bg-[var(--primary)]' : 'bg-[var(--primary)]/20'}`} />
        </div>
      </header>

      <div className="pt-24 px-6 max-w-md mx-auto">
        {currentStep === 'IDENTITY' ? (
          <div className="animate-in slide-in-from-right duration-300 space-y-6">
            <div className="solid-card rounded-[2.5rem] p-8 flex flex-col items-center border-[var(--primary)]/20 shadow-sm">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center overflow-hidden shadow-lg transition-all">
                  <img src={iconUrl} className="w-full h-full object-cover" alt="" />
                </div>
                {isFetchingIcon && (
                  <div className="absolute inset-0 bg-[var(--bg-main)]/70 rounded-3xl flex items-center justify-center animate-in fade-in">
                    <Loader2 size={32} className="text-[var(--primary)] animate-spin" />
                  </div>
                )}
              </div>
              <div className="w-full space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--text-main)] ml-4 uppercase tracking-[0.2em]">App Name</label>
                  <input disabled={isProcessing} value={name} onChange={e => setName(e.target.value.toUpperCase())} className="bg-[var(--bg-main)] w-full p-6 rounded-[1.5rem] text-xl font-black text-center border-2 border-[var(--primary)] outline-none focus:shadow-[0_0_20px_var(--primary-glow)] disabled:opacity-50 text-[var(--primary)] placeholder-[var(--text-muted)]/30 shadow-inner" placeholder="ENTER NAME..." />
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 opacity-50">
                <ShieldAlert size={12} className="text-orange-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Tracking an external signal? Remember to DYOR.</span>
              </div>
            </div>

            <button 
              disabled={name.length < 2 || isProcessing} 
              onClick={() => { triggerHaptic('light'); name.length >= 2 && setCurrentStep('TIMER'); }} 
              className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--primary)] text-[var(--primary-contrast)] rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-[110] disabled:opacity-50 border-t border-white/30"
            >
              <ArrowRight size={24} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-300 space-y-6">
            <div className="solid-card rounded-[2.5rem] p-6 border-[var(--primary)]/20 shadow-sm">
              <div className="space-y-2 mb-6">
                <label className="text-[9px] font-black text-[var(--text-main)] ml-4 uppercase tracking-[0.2em]">Timer Label</label>
                <input disabled={isProcessing} value={cycleName} onChange={e => setCycleName(e.target.value.toUpperCase())} className="w-full bg-[var(--bg-main)] p-4 rounded-[1.2rem] text-center font-black uppercase border-2 border-[var(--primary)] outline-none focus:shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50 text-[var(--primary)] text-sm" placeholder="E.G. MINING CYCLE" />
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--primary)]/20 mb-6 shadow-inner">
                <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); setFrequency('FIXED_DAILY'); setIsSyncEnabled(false); }} className={`py-3 rounded-xl text-[7px] font-black uppercase tracking-widest leading-tight transition-all ${frequency === 'FIXED_DAILY' ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md' : 'text-[var(--primary)] opacity-60'} disabled:opacity-30`}>Fixed<br/>Daily</button>
                <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); setFrequency('SLIDING'); }} className={`py-3 rounded-xl text-[7px] font-black uppercase tracking-widest leading-tight transition-all ${frequency === 'SLIDING' ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md' : 'text-[var(--primary)] opacity-60'} disabled:opacity-30`}>Sliding<br/>Timer</button>
                <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); setFrequency('WINDOW'); }} className={`py-3 rounded-xl text-[7px] font-black uppercase tracking-widest leading-tight transition-all ${frequency === 'WINDOW' ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md' : 'text-[var(--primary)] opacity-60'} disabled:opacity-30`}>Block<br/>Window</button>
              </div>
              
              {(frequency === 'SLIDING' || frequency === 'WINDOW') && (
                <div className="p-4 bg-[var(--bg-card)] rounded-[2rem] border-2 border-[var(--primary)]/10 mb-6 flex flex-col items-center shadow-inner">
                   <p className="text-[8px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mb-4">Cycle Duration</p>
                   <div className="flex justify-center gap-3">
                    <TimeInput label="DAYS" value={days} setter={setDays} max={365} />
                    <div className="text-[var(--primary)] opacity-30 text-lg font-black mt-6 self-start">:</div>
                    <TimeInput label="HRS" value={hours} setter={setHours} max={23} />
                    <div className="text-[var(--primary)] opacity-30 text-lg font-black mt-6 self-start">:</div>
                    <TimeInput label="MINS" value={mins} setter={setMins} max={59} />
                   </div>
                </div>
              )}

              {frequency === 'FIXED_DAILY' && (
                <div className="p-6 bg-[var(--primary)]/5 rounded-[2rem] border-2 border-[var(--primary)]/20 mb-6 text-center">
                  <p className="text-[11px] font-black text-[var(--primary)] uppercase tracking-widest leading-none">Midnight Reset</p>
                  <p className="text-[8px] font-bold text-[var(--text-main)] mt-2 opacity-60 uppercase tracking-widest">Resets at 00:00 Daily</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <button 
                  disabled={frequency === 'FIXED_DAILY' || isProcessing}
                  onClick={() => { triggerHaptic('light'); setIsSyncEnabled(!isSyncEnabled); }}
                  className={`w-full p-4 rounded-[1.5rem] border-2 flex items-center justify-between transition-all ${frequency === 'FIXED_DAILY' ? 'opacity-30 grayscale cursor-not-allowed border-slate-800' : isSyncEnabled ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] shadow-md' : 'bg-[var(--bg-main)] border-[var(--primary)]/10 text-[var(--text-main)]'} disabled:opacity-30`}
                >
                  <div className="flex items-center gap-3">
                    <Link2 size={16} strokeWidth={3} className={isSyncEnabled ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-left">Align Timer</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-all ${isSyncEnabled ? 'bg-[var(--primary)]' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSyncEnabled ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>

                {isSyncEnabled && (
                  <div className="p-4 bg-[var(--bg-main)] rounded-[1.5rem] border-2 border-[var(--primary)] animate-in slide-in-from-top duration-300 flex flex-col items-center shadow-lg">
                    <p className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest mb-4">Time remaining on app:</p>
                    <div className="flex justify-center gap-3">
                      <TimeInput label="HOURS" value={syncH} setter={setSyncH} max={168} />
                      <div className="text-[var(--primary)] text-lg font-black mt-6 self-start opacity-30">:</div>
                      <TimeInput label="MINS" value={syncM} setter={setSyncM} max={59} />
                    </div>
                  </div>
                )}

                <div className={`p-4 rounded-[1.5rem] border-2 transition-all flex items-center justify-between ${state.notificationsEnabled ? 'bg-green-50/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${state.notificationsEnabled ? 'text-green-500 bg-green-500/10' : 'text-orange-500 bg-orange-500/10 animate-pulse'}`}>
                        {state.notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)] block">Signal Alerts</span>
                        <span className={`text-[7px] font-bold uppercase tracking-[0.15em] ${state.notificationsEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                           {state.notificationsEnabled ? 'Fully Operational' : 'Alerts Disabled'}
                        </span>
                      </div>
                   </div>
                   {!state.notificationsEnabled && (
                     <button onClick={() => { triggerHaptic('medium'); toggleNotifications(); }} className="bg-orange-500 text-black px-4 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Enable</button>
                   )}
                   {state.notificationsEnabled && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
              </div>

              <button 
                disabled={isProcessing} 
                onClick={handleAddTask} 
                className="w-full bg-[var(--primary)]/10 text-[var(--primary)] py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all border border-[var(--primary)]/30 mb-2"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />} 
                {editingTaskId ? 'Update Signal' : 'Save Task'}
              </button>
            </div>

            <button 
              disabled={addedTasks.length === 0 || isProcessing} 
              onClick={() => { triggerHaptic('heavy'); handleFinalize(); }} 
              className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--primary)] text-[var(--primary-contrast)] rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-[110] disabled:opacity-50 border-t border-white/30"
            >
              {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} strokeWidth={3} />}
            </button>
          </div>
        )}
      </div>

      {showPostAddDialog && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-[var(--bg-main)]/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="solid-card w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center text-center animate-in zoom-in-95 shadow-2xl border-[var(--primary)]/40">
             <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center text-[var(--primary-contrast)] shadow-lg mb-6"><Check size={32} strokeWidth={5} /></div>
             <h2 className="text-xl font-black uppercase mb-4 text-[var(--primary)] tracking-tight">Signal {editingTaskId ? 'Updated' : 'Added'}</h2>
             {!state.notificationsEnabled && (
                <div className="mb-8 p-5 bg-orange-500/10 border-2 border-orange-500/30 rounded-[1.5rem] animate-in slide-in-from-bottom duration-500 delay-150">
                   <div className="flex justify-center mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-black shadow-lg">
                        <Bell size={20} />
                      </div>
                   </div>
                   <h3 className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-1">Never Miss a Harvest</h3>
                   <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase leading-relaxed mb-4">
                      TokenPod can alert you exactly when this signal hits 100%. Enable background alerts now?
                   </p>
                   <button onClick={() => { triggerHaptic('heavy'); toggleNotifications(); }} className="w-full bg-orange-500 text-black py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Enable Alerts Now</button>
                </div>
             )}
             <div className="space-y-4 w-full">
               <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); setShowPostAddDialog(false); }} className="w-full bg-[var(--bg-main)] text-[var(--text-main)] py-4 rounded-[1.5rem] font-black text-[10px] tracking-[0.2em] uppercase border-2 border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-colors disabled:opacity-30">Add Another Task</button>
               <button disabled={isProcessing} onClick={() => { triggerHaptic('heavy'); handleFinalize(); }} className="w-full bg-[var(--primary)] text-[var(--primary-contrast)] py-4 rounded-[1.5rem] font-black text-[10px] tracking-[0.2em] uppercase shadow-lg disabled:opacity-50 active:scale-95 border-t border-white/30">Save & Exit</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
