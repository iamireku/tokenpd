
import React, { useState, useMemo, useEffect } from 'react';
import { AppIdentity, AppStatus, Task } from '../types';
import { useApp } from '../store';
import { usePodTimer } from '../hooks/usePodTimer';
import { triggerHaptic, formatTimeLeft, getTaskStatus, playFeedbackSound } from '../utils';
import { Tooltip } from './Tooltip';
import { 
  Pencil, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  PlusSquare, 
  X, 
  Settings,
  Loader2,
  Activity
} from 'lucide-react';

interface AppCardProps {
  app: AppIdentity;
  variant?: 'large' | 'compact';
  index?: number;
  total?: number;
}

export const AppCard: React.FC<AppCardProps> = ({ app, variant = 'large', index = 0, total = 1 }) => {
  const { state, claimApp, resetTask, deleteTask, deleteApp, setView, setEditingAppId, setEditingTaskId, triggerLaunch, isProcessing, addToast, undoDeletedItem } = useApp();
  const [activePanel, setActivePanel] = useState<'NONE' | 'ACTIONS' | 'ALIGN'>('NONE');
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isSurging, setIsSurging] = useState(false);
  
  const { status, timeLeft, currentTime } = usePodTimer(app);
  
  const appTasks = useMemo(() => state.tasks.filter(t => t.appId === app.id), [state.tasks, app.id]);
  const isReady = status === AppStatus.READY;
  
  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHarvesting || isSurging) return;
    
    // Point 3: Mastery Check (Perfect Harvest)
    const earliestReadyTask = appTasks
      .filter(t => t.nextDueAt <= currentTime)
      .sort((a, b) => b.nextDueAt - a.nextDueAt)[0];
    
    const latencySecs = earliestReadyTask ? (currentTime - earliestReadyTask.nextDueAt) / 1000 : 0;
    const isFlawless = latencySecs > 0 && latencySecs < 60;

    triggerHaptic('heavy');
    triggerLaunch(app.name, app.fallbackStoreUrl);
    
    setIsHarvesting(true);
    try {
      await claimApp(app.id, 10000);
      
      // Point 1: Trigger Magma Surge Animation
      setIsSurging(true);
      playFeedbackSound('harvest');
      
      if (isFlawless) {
        setTimeout(() => {
          addToast("FLAWLESS SIGNAL (+100% EFFICIENCY)", "SUCCESS");
          triggerHaptic('success');
        }, 1200);
      }
      
      setTimeout(() => setIsSurging(false), 1000);
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
      action: { label: "UNDO", onClick: () => { undoDeletedItem(); } } 
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`group relative solid-card rounded-[2rem] w-64 h-72 shrink-0 p-6 flex flex-col transition-all duration-300 overflow-hidden ${isReady ? 'border-orange-500 shadow-xl ring-1 ring-orange-500/20' : 'border-theme opacity-95'}`}>
        {/* Magma Surge Overlay */}
        <div className={`absolute inset-0 z-0 bg-orange-500 transition-opacity duration-700 pointer-events-none ${isSurging ? 'opacity-20' : 'opacity-0'}`} />
        <div className={`absolute left-0 top-0 bottom-0 z-10 bg-orange-500 transition-all duration-1000 ${isSurging ? 'w-full' : 'w-0'}`} style={{ opacity: isSurging ? 0.4 : 0 }} />

        {/* Hardware Status Strip - Top Bar Indicator */}
        {isReady && !isSurging && <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 animate-pulse" />}
        
        <div className="flex-1 flex flex-col relative z-20">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-1">
               {Array.from({length: total}).map((_, i) => (
                 <div key={i} className={`w-1 h-1 rounded-full ${i === index ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
               ))}
            </div>
          </div>

          <div className="flex flex-col items-center flex-1 justify-center gap-4">
            <div className={`relative p-1 rounded-2xl transition-all duration-500 ${isReady ? 'bg-orange-500/5' : ''}`}>
              <button 
                onClick={handleManualLaunch}
                className={`w-20 h-20 bg-slate-900 rounded-[1.4rem] flex items-center justify-center overflow-hidden shadow-lg border-2 transition-all ${isReady ? 'border-orange-500 active:scale-95' : 'border-white/5 active:scale-90'}`}
              >
                 <img src={app.icon} alt={app.name} className="w-full h-full object-cover transition-all duration-500" />
              </button>
            </div>
            
            <div className="text-center space-y-1">
               <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-tighter truncate w-48">{app.name}</h3>
               <p className={`text-[9px] font-mono font-black uppercase tracking-widest ${isReady ? 'text-orange-500' : 'text-emerald-500'}`}>
                 {isReady ? 'SIGNAL: READY' : timeLeft}
               </p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={!isReady || isHarvesting || isSurging}
            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              isReady 
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20 active:translate-y-0.5' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            {isHarvesting ? <Loader2 size={14} className="animate-spin" /> : isSurging ? 'SYNCED' : 'HARVEST'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative solid-card rounded-[1.8rem] overflow-hidden transition-all duration-300 ${isReady ? 'border-orange-500/40 shadow-md ring-1 ring-orange-500/10' : 'border-theme'}`}>
      {/* Magma Surge Overlay (Large) */}
      <div className={`absolute inset-0 z-0 bg-orange-500 transition-opacity duration-1000 pointer-events-none ${isSurging ? 'opacity-10' : 'opacity-0'}`} />
      
      {/* State Indicator Bar - Vertical hardware LED strip */}
      {isReady && <div className={`absolute left-0 top-0 bottom-0 z-10 bg-orange-500 transition-all duration-700 ${isSurging ? 'w-full opacity-30' : 'w-1 opacity-100'}`} />}
      
      <div className="p-4 flex items-center justify-between cursor-pointer relative z-20" onClick={() => setActivePanel(activePanel === 'NONE' ? 'ACTIONS' : 'NONE')}>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleManualLaunch}
            className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border transition-all ${isReady ? 'border-orange-500 shadow-md active:scale-90' : 'border-theme bg-slate-50 dark:bg-slate-900 active:scale-90'}`}
          >
            <img src={app.icon} alt={app.name} className="w-full h-full object-cover transition-all duration-500" />
          </button>
          
          <div className="space-y-0.5">
            <h3 className="font-black text-[12px] uppercase text-slate-900 dark:text-slate-50 tracking-tight leading-none">{app.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono font-black uppercase tracking-widest leading-none ${isReady ? 'text-orange-500' : 'text-emerald-500 opacity-80'}`}>
                {isReady ? (isSurging ? 'SYNCING...' : 'READY') : timeLeft}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isReady ? (
            <button 
              onClick={handleClaim} 
              disabled={isHarvesting || isSurging}
              className="px-6 py-2.5 bg-orange-500 text-black rounded-xl font-black text-[9px] tracking-[0.2em] shadow-lg active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              {isHarvesting ? <Loader2 size={12} className="animate-spin" /> : isSurging ? 'SECURED' : 'HARVEST'}
            </button>
          ) : (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 transition-transform ${activePanel !== 'NONE' ? 'rotate-180' : ''}`}>
               <ChevronDown size={18} strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {activePanel !== 'NONE' && (
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-theme animate-in slide-in-from-top duration-300 relative z-20">
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 px-2 mb-2">
               <Activity size={10} className="text-slate-400" />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Signal Nodes</span>
            </div>
            {appTasks.map(task => {
              const taskStatus = getTaskStatus(task, currentTime);
              const taskTimeLeft = formatTimeLeft(task.nextDueAt - currentTime);
              const isTaskReady = taskStatus === AppStatus.READY;
              
              return (
                <div key={task.id} className="bg-white dark:bg-slate-900 rounded-xl p-3 flex items-center justify-between border border-theme shadow-sm">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase">{task.name}</span>
                      <span className={`text-[8px] font-mono font-black uppercase tracking-widest ${isTaskReady ? 'text-orange-500' : 'text-emerald-500 opacity-80'}`}>
                        {isTaskReady ? 'READY' : taskTimeLeft}
                      </span>
                   </div>
                   <div className="flex items-center gap-1">
                     <button onClick={(e) => { e.stopPropagation(); setEditingAppId(app.id); setEditingTaskId(task.id); setView('CREATE'); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Pencil size={14} /></button>
                     <button onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); resetTask(task.id); addToast(`${task.name} Reset`, "INFO"); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><RotateCcw size={14} /></button>
                     <button onClick={(e) => { e.stopPropagation(); triggerHaptic('medium'); if(confirm('Remove this signal node?')) { deleteTask(task.id); handleUndoDelete(task.id, 'TIMER'); } }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                   </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 border-t border-theme bg-white dark:bg-slate-900">
            <button onClick={() => { setEditingAppId(app.id); setEditingTaskId(null); setView('CREATE'); }} className="py-3 border border-theme rounded-xl flex items-center justify-center gap-2 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
              <Settings size={12} className="text-slate-400" />
              <span className="text-[9px] font-black uppercase text-slate-500">Config Pod</span>
            </button>
            <button onClick={() => { triggerHaptic('light'); setEditingAppId(app.id); setEditingTaskId(null); setView('CREATE'); }} className="py-3 border border-theme rounded-xl flex items-center justify-center gap-2 active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
              <PlusSquare size={12} className="text-orange-500" />
              <span className="text-[9px] font-black uppercase text-slate-500">Add Signal</span>
            </button>
          </div>

          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              triggerHaptic('heavy'); 
              if(confirm('Disconnect Pod?')) { deleteApp(app.id); handleUndoDelete(app.id, 'POD'); } 
            }} 
            className="w-full py-4 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center gap-2 border-t border-theme font-black text-[8px] uppercase tracking-widest"
          >
            <Trash2 size={12} /> Disconnect Pod
          </button>
        </div>
      )}
    </div>
  );
};
