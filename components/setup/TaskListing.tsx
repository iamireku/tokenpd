
import React from 'react';
import { Pencil, Trash2, Clock, Calendar, Zap } from 'lucide-react';

interface TaskListingProps {
  addedTasks: any[];
  onEdit: (idx: number) => void;
  onRemove: (idx: number) => void;
}

export const TaskListing: React.FC<TaskListingProps> = ({ addedTasks, onEdit, onRemove }) => {
  if (addedTasks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em]">Signal Chain</h3>
        <span className="text-[8px] font-black bg-theme-primary/10 text-theme-primary px-2 py-0.5 rounded-full uppercase">
          {addedTasks.length} Active
        </span>
      </div>
      
      <div className="space-y-3">
        {addedTasks.map((task, idx) => (
          <div key={idx} className="bg-theme-card border border-theme rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-theme-primary/5 flex items-center justify-center text-theme-primary">
                  <Zap size={18} fill="currentColor" />
               </div>
               <div>
                  <h4 className="text-[11px] font-black text-theme-main uppercase tracking-tight">{task.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5 text-theme-muted">
                     <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          {task.frequency === 'FIXED_DAILY' ? '24H' : `${task.customHours || 0}H ${task.customMinutes || 0}M`}
                        </span>
                     </div>
                     <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{task.frequency.replace('_', ' ')}</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => onEdit(idx)} className="p-2 text-theme-muted hover:text-theme-primary transition-colors active:scale-90">
                  <Pencil size={14} />
               </button>
               <button onClick={() => onRemove(idx)} className="p-2 text-red-500/40 hover:text-red-500 transition-colors active:scale-90">
                  <Trash2 size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
