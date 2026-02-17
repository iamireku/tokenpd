
import React from 'react';
import { Plus, Sparkles, Zap, Lock } from 'lucide-react';
import { useApp } from '../store';
import { getPodLimit } from '../utils';

export const QuickAddCard: React.FC = () => {
  const { state, setView } = useApp();
  
  const podLimit = getPodLimit(state.rank, state.isPremium);
  const isLimitReached = state.apps.length >= podLimit;

  const handleClick = () => {
    if (isLimitReached) {
      setView('LAB');
    } else {
      setView('CREATE');
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-full border-2 border-dashed rounded-[2.5rem] p-6 flex items-center justify-between transition-all group active:scale-[0.98] mb-4 ${
        isLimitReached 
          ? 'bg-orange-950/10 border-orange-950 opacity-50 cursor-default' 
          : 'bg-black border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/5 shadow-2xl'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-16 h-16 bg-black rounded-full flex items-center justify-center border-2 border-dashed transition-all duration-300 ${
            isLimitReached ? 'border-orange-950' : 'border-orange-500/30 group-hover:border-orange-500 group-hover:bg-orange-500/10'
          }`}>
            {isLimitReached ? (
              <Lock size={22} className="text-orange-950" />
            ) : (
              <Plus size={24} className="text-orange-500/60 group-hover:text-orange-500 transition-colors" />
            )}
          </div>
          {!isLimitReached && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-black shadow-lg opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
              <Zap size={12} fill="currentColor" />
            </div>
          )}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h3 className={`font-black text-[11px] uppercase tracking-widest transition-colors ${
              isLimitReached ? 'text-orange-950' : 'text-orange-200 group-hover:text-theme-main'
            }`}>
              {isLimitReached ? 'LIMIT REACHED' : 'ADD NEW POD'}
            </h3>
          </div>
          <p className={`text-[9px] font-bold tracking-tight uppercase transition-colors ${
            isLimitReached ? 'text-orange-950/60' : 'text-orange-500/60 group-hover:text-orange-500'
          }`}>
            {isLimitReached ? `Rank Cap (${state.apps.length}/${podLimit})` : 'New earning signal detected'}
          </p>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
        isLimitReached ? 'text-orange-950' : 'text-orange-500/40 group-hover:text-orange-500 group-hover:rotate-12 bg-orange-500/5'
      }`}>
        {isLimitReached ? <Lock size={20} /> : <Sparkles size={20} />}
      </div>
    </button>
  );
};
