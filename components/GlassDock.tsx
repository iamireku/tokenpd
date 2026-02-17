
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { AppView } from '../types';
import { Home, Plus, Zap, Settings as SettingsIcon } from 'lucide-react';
import { triggerHaptic, getPodLimit } from '../utils';

export const GlassDock: React.FC = () => {
  const { state, view, setView, addToast } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Re-show immediately if at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide if scrolling down
      else if (currentScrollY > lastScrollY.current + 15) {
        setIsVisible(false);
      } 
      // Show if scrolling up
      else if (currentScrollY < lastScrollY.current - 15) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'DASHBOARD', icon: <Home /> },
    { id: 'CREATE', icon: <Plus /> },
    { id: 'LAB', icon: <Zap /> },
    { id: 'SETTINGS', icon: <SettingsIcon /> }
  ];

  const handleNavClick = (id: AppView) => {
    triggerHaptic('light');
    
    // Check for tiered pod limit if trying to access the CREATE view
    if (id === 'CREATE') {
      const podLimit = getPodLimit(state.rank, state.isPremium);
      const isLimitReached = state.apps.length >= podLimit;
      
      if (isLimitReached) {
        addToast(`Pod Limit Reached (${state.apps.length}/${podLimit})`, "INFO");
        setView('LAB'); // Redirect to Growth Lab for upgrades
        return;
      }
    }

    setView(id);
  };

  return (
    <div 
      className={`fixed left-0 right-0 flex justify-center z-[100] px-8 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0 pointer-events-none'
      }`}
      style={{ bottom: 'max(2.5rem, var(--sab, 1.5rem))' }}
    >
      <nav className="glass-dock-light px-4 py-3 rounded-full flex items-center justify-between w-full max-w-sm shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id as AppView)}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
              view === item.id 
                ? 'bg-[#ff7a21] text-white shadow-xl shadow-orange-500/40 active:scale-90' 
                : 'text-slate-400 hover:text-[#ff7a21]'
            }`}
          >
            {React.cloneElement(item.icon as React.ReactElement<any>, { 
              size: 24, 
              strokeWidth: view === item.id ? 3 : 2 
            })}
          </button>
        ))}
      </nav>
    </div>
  );
};
