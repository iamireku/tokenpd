import React from 'react';
import { ChevronLeft } from 'lucide-react';
// Fix: Import CreationStep from constants definition instead of hook file
import { CreationStep } from '../../constants/podSetup';

interface SetupHeaderProps {
  currentStep: CreationStep;
  onBack: () => void;
  disabled?: boolean;
}

export const SetupHeader: React.FC<SetupHeaderProps> = ({ currentStep, onBack, disabled }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-main)]/80 backdrop-blur-xl border-b border-[var(--primary)]/20 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          disabled={disabled} 
          onClick={onBack} 
          className="p-1.5 bg-[var(--bg-card)] rounded-lg border border-[var(--primary)] text-[var(--primary)] disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={18} strokeWidth={3} />
        </button>
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] leading-none">Pod Setup</h1>
          <p className="text-[var(--primary)] text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">{currentStep === 'IDENTITY' ? 'Identity' : 'Task settings'}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${currentStep === 'IDENTITY' ? 'bg-[var(--primary)]' : 'bg-[var(--primary)]/20'}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${currentStep === 'TIMER' ? 'bg-[var(--primary)]' : 'bg-[var(--primary)]/20'}`} />
      </div>
    </header>
  );
};
