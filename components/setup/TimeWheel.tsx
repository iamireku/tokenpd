
import React, { useRef } from 'react';
import { triggerHaptic } from '../../utils';

interface WheelPickerProps {
  label: string;
  value: number;
  max: number;
  setter: (val: number) => void;
  disabled?: boolean;
}

export const TimeWheel: React.FC<WheelPickerProps> = ({ label, value, max, setter, disabled }) => {
  const startY = useRef(0);

  const handleUpdate = (direction: number) => {
    if (disabled) return;
    triggerHaptic('light');
    let next = value + direction;
    if (next >= max) next = 0;
    if (next < 0) next = max - 1;
    setter(next);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = startY.current - endY;
    if (Math.abs(diff) > 20) {
      handleUpdate(diff > 0 ? 1 : -1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 5) {
      handleUpdate(e.deltaY > 0 ? 1 : -1);
    }
  };

  const prev = (value - 1 + max) % max;
  const next = (value + 1) % max;

  return (
    <div 
      className="flex flex-col items-center select-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col items-center bg-theme-main/5 rounded-2xl p-2 border border-theme/50 overflow-hidden w-16">
        <button 
          onClick={() => handleUpdate(-1)} 
          disabled={disabled}
          className="text-[10px] font-black text-theme-muted opacity-30 hover:opacity-100 transition-all p-1"
        >
          {prev.toString().padStart(2, '0')}
        </button>
        
        <div className="py-2 flex flex-col items-center relative">
          <span className="text-2xl font-black text-theme-primary tabular-nums drop-shadow-[0_0_10px_var(--primary-glow)]">
            {value.toString().padStart(2, '0')}
          </span>
          <div className="absolute inset-x-0 top-0 h-[1px] bg-theme-primary/10" />
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-theme-primary/10" />
        </div>

        <button 
          onClick={() => handleUpdate(1)} 
          disabled={disabled}
          className="text-[10px] font-black text-theme-muted opacity-30 hover:opacity-100 transition-all p-1"
        >
          {next.toString().padStart(2, '0')}
        </button>
      </div>
      <span className="text-[7px] font-black uppercase tracking-widest text-theme-muted mt-2">{label}</span>
    </div>
  );
};
