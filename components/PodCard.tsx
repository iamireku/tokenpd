import React, { useState, useMemo } from 'react';
import { AppIdentity, AppStatus, Task } from '../types';
import { useApp } from '../store';
import { usePodTimer } from '../hooks/usePodTimer';
import { triggerHaptic, formatTimeLeft, getTaskStatus } from '../utils';
import { 
  Pencil, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  PlusSquare, 
  X, 
  Settings,
  Loader2,
  Zap
} from 'lucide-react';

interface AppCardProps {
  app: AppIdentity;
  variant?: 'large' | 'compact';
  index?: number;
  total?: number;
}

export const AppCard: React.FC<AppCardProps> = ({ app, variant = 'large', index = 0, total = 1 }) => {
  const { state, claimApp, resetTask, deleteTask, deleteApp, setView, setEditingAppId, setEditingTaskId, triggerLaunch, isProcessing, addToast } = useApp();
  const [activePanel, setActivePanel] = useState<'NONE' | 'ACTIONS' | 'ALIGN'>('NONE');
  const [isHarvesting, setIsHarvesting] = useState(false);
  
  const { status, timeLeft, currentTime } = usePodTimer(app);
  
  const appTasks = useMemo(() => state.tasks.filter(t => t.appId === app.id), [state.tasks, app.id]);
  const isReady = status === AppStatus.READY;
  
  const getTimerColorClass = (podStatus: AppStatus) => {
    if (podStatus === AppStatus.READY) return 'text-orange-500'; 
    if (podStatus === AppStatus.URGENT) return 'text-orange-500 animate-pulse'; 
    return 'text-[#10b981]'; 
  };

  const timerColorClass = getTimerColorClass(status);

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHarvesting) return;
    triggerHaptic('medium');
    setIsHarvesting(true);
    try {
      await claimApp(app.id, 10000);
      triggerLaunch(app.name, app.fallbackStoreUrl);
    } finally {
      setIsHarvesting(false);
    }
  };

  const handleManualLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    triggerLaunch(app.name, app.fallbackStoreUrl);
  };

  const handleUndoDelete = (id: string, type: 'POD' | 'TIMER') => {
    addToast(`${type} Removed`, "INFO", { 
      action: { label: "UNDO", onClick: () => { /* Logic is handled in context Provider already */ } } 
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`solid-card rounded-[3rem] w-72 h-80 shrink-0 p-8 flex flex-col transition-all duration-500 relative ${isReady ? 'border-theme-primary shadow-[0_0_20px_rgba(255,122,33,0.15)]' : 'border-theme'}`}>
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="flex justify-center mb-8">
            <div className="flex gap-1.5">
               {Array.from({length: total}).map((_, i) => (
                 <div 
                  key={i} 
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    i === index 
                      ? 'bg-theme-primary scale-125' 
                      : 'bg-theme-muted opacity-20'
                  }`} 
                 />
               ))}
            </div>
          </div>

          <div className="flex items-center gap-5 mb-10 w-full px-2">
            <button 
              onClick={handleManualLaunch}
              className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden shadow-xl active:scale-90 transition-transform group shrink-0"
            >
               <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
            </button>
            <div className="text-left overflow-hidden">
               <h3 className="text-base font-black uppercase text-theme-main tracking-tight truncate">{app.name}</h3>
               <p className={`text-[10px] font-black uppercase tracking-widest ${timerColorClass}`}>
                 {isReady ? 'READY' : timeLeft}
               </p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={isHarvesting}
            className={`w-full py-6 rounded-[2.25rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/10 active:scale-95 transition-all relative overflow-hidden ${isReady ? 'bg-theme-primary text-theme-contrast' : 'bg-theme-muted/10 text-theme-muted cursor-not-allowed'}`}
          >
            {isHarvesting ? (
              <Loader2 size={18} className="animate-spin mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                HARVEST NOW
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`solid-card rounded-[2.5rem] overflow-hidden transition-all duration-500 ${isReady ? 'border-theme-primary shadow-[0_0_15px_rgba(255,122,33,0.05)]' : 'border-theme'}`}>
      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setActivePanel(activePanel === 'NONE' ? 'ACTIONS' : 'NONE')}>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleManualLaunch}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm overflow-hidden bg-slate-100 active:scale-90 transition-transform border border-theme"
          >
            <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
          </button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-[13px] uppercase text-theme-main tracking-tight">{app.name}</h3>
              <div className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-theme-primary animate-pulse' : 'bg-slate-200'}`} />
              <span className={`text-[10px] font-black uppercase tabular-nums tracking-widest ${timerColorClass}`}>
                {timeLeft}
              </span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-theme-muted opacity-60">
              {appTasks.length} {appTasks.length === 1 ? 'SIGNAL ACTIVE' : 'SIGNALS ACTIVE'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isReady && (
            <button 
              onClick={handleClaim} 
              disabled={isHarvesting}
              className="px-6 py-2.5 bg-theme-primary text-theme-contrast rounded-full font-black text-[10px] tracking-widest shadow-lg active:scale-90 flex items-center gap-2 disabled:opacity-50"
            >
              {isHarvesting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  HARVEST
                </>
              )}
            </button>
          )}
          <ChevronDown size={18} className={`transition-transform text-theme-muted opacity-40 ${activePanel !== 'NONE' ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {activePanel !== 'NONE' && (
        <div className="bg-theme-main/5 border-t border-theme/50 animate-in slide-in-from-top duration-300">
          <div className="p-4 space-y-3">
            <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] px-2 mb-2">Active Timers</p>
            {appTasks.map(task => {
              const taskStatus = getTaskStatus(task, currentTime);
              const taskTimeLeft = formatTimeLeft(task.nextDueAt - currentTime);
              const isTaskReady = taskStatus === AppStatus.READY;
              const isTaskUrgent = taskStatus === AppStatus.URGENT;
              
              const subTimerClass = isTaskReady ? 'text-orange-500' : isTaskUrgent ? 'text-orange-500 animate-pulse' : 'text-[#10b981]';

              return (
                <div key={task.id} className="bg-theme-card rounded-2xl p-4 flex items-center justify-between border border-theme">
                   <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-theme-main uppercase">{task.name}</span>
                     <span className={`text-[9px] font-bold uppercase tracking-widest ${subTimerClass}`}>
                        {isTaskReady ? 'READY TO HARVEST' : taskTimeLeft}
                     </span>
                   </div>
                   <div className="flex items-center gap-2">
                     <button disabled={isProcessing} onClick={(e) => { e.stopPropagation(); setEditingAppId(app.id); setEditingTaskId(task.id); setView('CREATE'); }} className="w-9 h-9 flex items-center justify-center bg-theme-main border border-theme text-theme-muted rounded-xl disabled:opacity-30"><Pencil size={14} /></button>
                     <button disabled={isProcessing} onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); resetTask(task.id); addToast(`${task.name} Reset`, "INFO"); }} className="w-9 h-9 flex items-center justify-center bg-theme-main border border-theme text-theme-muted rounded-xl disabled:opacity-30"><RotateCcw size={14} /></button>
                     <button disabled={isProcessing} onClick={(e) => { e.stopPropagation(); triggerHaptic('medium'); if(confirm('Remove this timer?')) { deleteTask(task.id); handleUndoDelete(task.id, 'TIMER'); } }} className="w-9 h-9 flex items-center justify-center bg-theme-main border border-theme text-theme-muted rounded-xl disabled:opacity-30"><X size={14} /></button>
                   </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 border-t border-theme/50">
            <button disabled={isProcessing} onClick={() => { setEditingAppId(app.id); setEditingTaskId(null); setView('CREATE'); }} className="py-4 bg-theme-card border border-theme rounded-2xl flex flex-col items-center gap-1 shadow-sm disabled:opacity-30">
              <Settings size={14} className="text-theme-muted" />
              <span className="text-[9px] font-black uppercase text-theme-muted">Edit Pod</span>
            </button>
            <button disabled={isProcessing} onClick={() => { triggerHaptic('light'); setEditingAppId(app.id); setEditingTaskId(null); setView('CREATE'); }} className="py-4 bg-theme-card border border-theme rounded-2xl flex flex-col items-center gap-1 shadow-sm disabled:opacity-30">
              <PlusSquare size={14} className="text-theme-primary" />
              <span className="text-[9px] font-black uppercase text-theme-muted">Add Timer</span>
            </button>
          </div>

          <button 
            disabled={isProcessing} 
            onClick={(e) => { 
              e.stopPropagation(); 
              triggerHaptic('heavy'); 
              if(confirm('Permanently delete Pod and all its timers?')) { 
                deleteApp(app.id); 
                handleUndoDelete(app.id, 'POD');
              } 
            }} 
            className="w-full py-4 text-red-500/60 hover:text-red-500 transition-all flex items-center justify-center gap-2 border-t border-theme/50 disabled:opacity-30"
          >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span className="text-[9px] font-black uppercase tracking-widest">Delete Pod</span>
          </button>
        </div>
      )}
    </div>
  );
};