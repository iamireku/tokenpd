
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { TOOLTIP_LIBRARY } from '../constants/tooltips';
import { triggerHaptic } from '../utils';
import { HelpCircle, X } from 'lucide-react';

interface TooltipProps {
  id: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ id, position = 'bottom', children }) => {
  const { state, dismissTooltip } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAcknowledged = state.acknowledgedTooltips.includes(id);
  const content = TOOLTIP_LIBRARY[id];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (isAcknowledged && !isOpen) return <>{children}</>;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setIsOpen(!isOpen);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    dismissTooltip(id);
    setIsOpen(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'bottom-full mb-4 left-1/2 -translate-x-1/2';
      case 'left': return 'right-full mr-4 top-1/2 -translate-y-1/2';
      case 'right': return 'left-full ml-4 top-1/2 -translate-y-1/2';
      default: return 'top-full mt-4 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div className="relative">
        {children}
        {!isAcknowledged && (
          <button 
            onClick={handleToggle}
            className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg animate-pulse z-20 border border-white/20"
          >
            ?
          </button>
        )}
      </div>

      {isOpen && (
        <div className={`absolute z-[2000] w-56 animate-in zoom-in slide-in-from-top-2 duration-300 ${getPositionClasses()}`}>
          <div className="bg-slate-900/95 backdrop-blur-md border border-orange-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500" />
             
             <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                   <HelpCircle size={14} />
                </div>
                <p className="text-[10px] font-bold text-slate-100 uppercase leading-relaxed tracking-tight">
                   {content}
                </p>
             </div>

             <button 
              onClick={handleDismiss}
              className="w-full bg-orange-500 text-black py-2 rounded-xl font-black text-[8px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
             >
               Got it
             </button>
          </div>
          
          {/* Tooltip Arrow */}
          <div className={`absolute w-3 h-3 bg-slate-900 rotate-45 border border-orange-500/30 -z-10 ${
            position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-0 border-l-0' :
            position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2 border-b-0 border-r-0' :
            position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2 border-b-0 border-l-0' :
            'left-[-6px] top-1/2 -translate-y-1/2 border-t-0 border-r-0'
          }`} />
        </div>
      )}
    </div>
  );
};
