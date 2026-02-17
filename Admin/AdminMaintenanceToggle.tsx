
import React from 'react';
import { Activity } from 'lucide-react';

interface AdminMaintenanceToggleProps {
  isEnabled: boolean;
  onToggle: (val: boolean) => void;
}

export const AdminMaintenanceToggle: React.FC<AdminMaintenanceToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Activity className="text-red-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest text-red-400">Network Lockdown</h2>
        </div>
        <button 
          onClick={() => onToggle(!isEnabled)} 
          className={`w-14 h-8 rounded-full relative transition-all ${isEnabled ? 'bg-red-500' : 'bg-slate-800'}`}
        >
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isEnabled ? 'left-7' : 'left-1'}`} />
        </button>
      </div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
        System-wide redirection to maintenance terminal.
      </p>
    </section>
  );
};
