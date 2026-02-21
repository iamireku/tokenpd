
import React from 'react';
import { ArrowRight, Loader2, Save } from 'lucide-react';
import { CreationStep } from '../../constants/podSetup';

interface SetupFooterProps {
  currentStep: CreationStep;
  isNextDisabled: boolean;
  isSaveDisabled: boolean;
  isProcessing: boolean;
  onNext: () => void;
  onSave: () => void;
}

export const SetupFooter: React.FC<SetupFooterProps> = ({
  currentStep,
  isNextDisabled,
  isSaveDisabled,
  isProcessing,
  onNext,
  onSave
}) => {
  if (currentStep === 'IDENTITY') {
    return (
      <button 
        disabled={isNextDisabled} 
        onClick={onNext} 
        className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--primary)] text-[var(--primary-contrast)] rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-[110] disabled:opacity-50 border-t border-white/30"
      >
        <ArrowRight size={24} strokeWidth={3} />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 pt-4 pb-12">
      <button 
        disabled={isSaveDisabled || isProcessing} 
        onClick={onSave} 
        className="w-full bg-[var(--primary)] text-[var(--primary-contrast)] py-6 rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase shadow-2xl active:scale-[0.98] transition-all disabled:opacity-30 border-t border-white/30 flex items-center justify-center gap-3"
      >
        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Save size={20} />}
        SAVE POD
      </button>
      <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest text-center">
        Finalize setup to sync with the Secure Cloud
      </p>
    </div>
  );
};
