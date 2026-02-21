
import React from 'react';
import { Link as LinkIcon, Bell, BellOff, CheckCircle2, Loader2, Plus, Save, Target } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { TimeWheel } from './TimeWheel';
import { PRESETS } from '../../constants/podSetup';

interface TaskConfigFormProps {
  taskName: string;
  setTaskName: (v: string) => void;
  frequency: 'FIXED_DAILY' | 'SLIDING' | 'WINDOW';
  setFrequency: (v: 'FIXED_DAILY' | 'SLIDING' | 'WINDOW') => void;
  days: number;
  setDays: (v: number) => void;
  hours: number;
  setHours: (v: number) => void;
  mins: number;
  setMins: (v: number) => void;
  isSyncEnabled: boolean;
  setIsSyncEnabled: (v: boolean) => void;
  syncH: number;
  setSyncH: (v: number) => void;
  syncM: number;
  setSyncM: (v: number) => void;
  onAdd: () => void;
  applyPreset: (h: number) => void;
  nextHarvestPreview: { full: string; relative: string };
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  isProcessing: boolean;
  editingTaskId: string | null;
}

export const TaskConfigForm: React.FC<TaskConfigFormProps> = ({
  taskName, setTaskName, frequency, setFrequency,
  days, setDays, hours, setHours, mins, setMins,
  isSyncEnabled, setIsSyncEnabled, syncH, setSyncH, syncM, setSyncM,
  onAdd, applyPreset, nextHarvestPreview, notificationsEnabled, 
  toggleNotifications, isProcessing, editingTaskId
}) => {
  const isAddTaskDisabled = !taskName.trim() || isProcessing;

  return (
    <div className="solid-card rounded-[2.5rem] p-6 border-[var(--primary)]/20 shadow-sm overflow-hidden relative">
      <div className="flex items-center gap-2 mb-6">
         <div className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
         <h2 className="text-[10px] font-black text-theme-main uppercase tracking-widest">{editingTaskId ? 'Edit Task' : 'Configure New Task'}</h2>
      </div>

      <div className="space-y-2 mb-6">
        <label className={`text-[9px] font-black ml-4 uppercase tracking-[0.2em] transition-colors ${!taskName.trim() ? 'text-red-500' : 'text-[var(--text-main)]'}`}>
          Task Name *
        </label>
        <input 
          disabled={isProcessing} 
          value={taskName} 
          onChange={e => setTaskName(e.target.value.toUpperCase())} 
          className="w-full bg-[var(--bg-main)] p-4 rounded-[1.2rem] text-center font-black uppercase border-2 border-[var(--primary)] outline-none focus:shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50 text-[var(--primary)] text-sm" 
          placeholder="REQUIRED (E.G. MINING)" 
        />
      </div>
      
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[var(--bg-main)] rounded-[1.5rem] border border-[var(--primary)]/20 mb-6 shadow-inner">
        <button disabled={isProcessing} onClick={() => { setFrequency('FIXED_DAILY'); setIsSyncEnabled(false); }} className={`py-3 rounded-xl text-[7px] font-black uppercase tracking-widest leading-tight transition-all ${frequency === 'FIXED_DAILY' ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md' : 'text-[var(--primary)] opacity-60'} disabled:opacity-30`}>Fixed<br/>Daily</button>
        <button disabled={isProcessing} onClick={() => setFrequency('SLIDING')} className={`py-3 rounded-xl text-[7px] font-black uppercase tracking-widest leading-tight transition-all ${frequency === 'SLIDING' ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md' : 'text-[var(--primary)] opacity-60'} disabled:opacity-30`}>Sliding<br/>Timer</button>
        <button disabled={isProcessing} onClick={() => setFrequency('WINDOW')} className={`py-3 rounded-xl text-[7px] font-black uppercase tracking-widest leading-tight transition-all ${frequency === 'WINDOW' ? 'bg-[var(--primary)] text-[var(--primary-contrast)] shadow-md' : 'text-[var(--primary)] opacity-60'} disabled:opacity-30`}>Block<br/>Window</button>
      </div>
      
      {(frequency === 'SLIDING' || frequency === 'WINDOW') && (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
            {PRESETS.map((p) => {
              const isActive = (days * 24 + hours) === p.h && mins === 0;
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.h)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                    isActive 
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg' 
                      : 'bg-transparent border-[var(--primary)]/10 text-[var(--primary)]/60 hover:border-[var(--primary)]/30'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-[var(--bg-card)] rounded-[2rem] border-2 border-[var(--primary)]/10 flex flex-col items-center shadow-inner">
             <p className="text-[8px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mb-4">Time Setup</p>
             <div className="flex justify-center gap-6">
              <TimeWheel label="DAYS" value={days} setter={setDays} max={366} disabled={isProcessing} />
              <TimeWheel label="HRS" value={hours} setter={setHours} max={24} disabled={isProcessing} />
              <TimeWheel label="MINS" value={mins} setter={setMins} max={60} disabled={isProcessing} />
             </div>
          </div>
        </div>
      )}

      {frequency === 'FIXED_DAILY' && (
        <div className="p-6 bg-[var(--primary)]/5 rounded-[2rem] border-2 border-[var(--primary)]/20 mb-6 text-center">
          <p className="text-sm font-black text-[var(--primary)] uppercase tracking-widest leading-none">Midnight Reset</p>
          <p className="text-[8px] font-bold text-[var(--text-main)] mt-2 opacity-60 uppercase tracking-widest">Resets at 00:00 Daily</p>
        </div>
      )}

      <div className="mt-4 p-4 bg-slate-900 rounded-[1.5rem] border border-white/5 flex items-center justify-between mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Calculated Window</p>
            <p className="text-[10px] font-black text-white uppercase tracking-tight">{nextHarvestPreview.full}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Cycle</p>
          <p className="text-[10px] font-black text-orange-500 tabular-nums uppercase">{nextHarvestPreview.relative}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <button 
          disabled={frequency === 'FIXED_DAILY' || isProcessing}
          onClick={() => setIsSyncEnabled(!isSyncEnabled)}
          className={`w-full p-4 rounded-[1.5rem] border-2 flex items-center justify-between transition-all ${frequency === 'FIXED_DAILY' ? 'opacity-30 grayscale cursor-not-allowed border-slate-800' : isSyncEnabled ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] shadow-md' : 'bg-[var(--bg-main)] border-[var(--primary)]/10 text-[var(--text-main)]'} disabled:opacity-30`}
        >
          <div className="flex items-center gap-3">
            <LinkIcon size={16} strokeWidth={3} className={isSyncEnabled ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'} />
            <span className="text-[9px] font-black uppercase tracking-widest text-left">Sync timer with App</span>
          </div>
          <div className={`w-10 h-6 rounded-full relative transition-all ${isSyncEnabled ? 'bg-[var(--primary)]' : 'bg-slate-800'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSyncEnabled ? 'left-5' : 'left-1'}`} />
          </div>
        </button>

        {isSyncEnabled && (
          <div className="p-4 bg-[var(--bg-main)] rounded-[1.5rem] border-2 border-[var(--primary)] animate-in slide-in-from-top duration-300 flex flex-col items-center shadow-lg">
            <p className="text-[8px] font-black text-[var(--primary)] uppercase tracking-widest mb-4">Time remaining on app:</p>
            <div className="flex justify-center gap-6">
              <TimeWheel label="HOURS" value={syncH} setter={setSyncH} max={169} disabled={isProcessing} />
              <TimeWheel label="MINS" value={syncM} setter={setSyncM} max={60} disabled={isProcessing} />
            </div>
          </div>
        )}

        <div className={`p-4 rounded-[1.5rem] border-2 transition-all flex items-center justify-between ${notificationsEnabled ? 'bg-green-50/5 border-green-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
           <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${notificationsEnabled ? 'text-green-500 bg-green-500/10' : 'text-orange-500 bg-orange-500/10 animate-pulse'}`}>
                {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
              </div>
              <div className="text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)] block">Signal Alerts</span>
                <span className={`text-[7px] font-bold uppercase tracking-[0.15em] ${notificationsEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                   {notificationsEnabled ? 'Fully operational' : 'Alerts disabled'}
                </span>
              </div>
           </div>
           {!notificationsEnabled && (
             <button onClick={toggleNotifications} className="bg-orange-500 text-black px-4 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Enable</button>
           )}
           {notificationsEnabled && <CheckCircle2 size={16} className="text-green-500" />}
        </div>
      </div>

      <Tooltip id="tip_multi_signal" position="top">
        <button 
          disabled={isAddTaskDisabled} 
          onClick={onAdd} 
          className={`w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all border mb-2 ${
            isAddTaskDisabled 
              ? 'bg-theme-main/5 text-theme-muted/30 border-theme' 
              : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
          }`}
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : editingTaskId ? <Save size={16} /> : <Plus size={16} strokeWidth={3} />} 
          {editingTaskId ? 'Confirm Update' : 'Add to Pod'}
        </button>
      </Tooltip>
      {isAddTaskDisabled && !isProcessing && (
        <p className="text-[7px] font-black text-center text-red-500 uppercase tracking-widest animate-pulse">Task name is required</p>
      )}
    </div>
  );
};
