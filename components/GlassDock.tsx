
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { AppView } from '../types';
import { Home, Plus, Zap, Settings as SettingsIcon } from 'lucide-react';
import { triggerHaptic, getPodLimit } from '../utils';

export const GlassDock: React.FC = () => {
  const { state, view, setView, addToast } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const lastScrollY = useRef(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Parallax tilt effect on mouse move
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock || !isHovered) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = dock.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      dock.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    };

    const handleMouseLeave = () => {
      dock.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    };

    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      dock.removeEventListener('mousemove', handleMouseMove);
      dock.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY.current + 15) {
        setIsVisible(false);
      } 
      else if (currentScrollY < lastScrollY.current - 15) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'DASHBOARD', icon: Home, label: 'Home' },
    { id: 'CREATE', icon: Plus, label: 'Create' },
    { id: 'LAB', icon: Zap, label: 'Lab' },
    { id: 'SETTINGS', icon: SettingsIcon, label: 'Settings' }
  ];

  const handleNavClick = (id: AppView) => {
    triggerHaptic('light');
    
    if (id === 'CREATE') {
      const podLimit = getPodLimit(state.rank, state.isPremium);
      const isLimitReached = state.apps.length >= podLimit;
      
      if (isLimitReached) {
        addToast(`Pod Limit Reached (${state.apps.length}/${podLimit})`, "INFO");
        setView('LAB');
        return;
      }
    }

    setView(id);
  };

  const getItemStyles = (itemId: string) => {
    const isPressed = pressedItem === itemId;
    const isActive = view === itemId;
    
    return {
      transform: isPressed 
        ? 'translateY(2px) scale(0.95)' 
        : isActive 
          ? 'translateY(-4px) scale(1.1)' 
          : 'translateY(0) scale(1)',
      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    };
  };

  return (
    <div 
      className={`fixed left-0 right-0 flex justify-center z-[100] px-8 transition-all duration-700 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-[200%] opacity-0'
      }`}
      style={{ 
        bottom: 'max(2rem, var(--sab, 1.5rem))',
        filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.3))',
      }}
    >
      {/* Physical base shadow - creates depth illusion */}
      <div 
        className="absolute inset-x-0 mx-auto w-full max-w-sm h-20 rounded-full blur-xl opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.8) 0%, transparent 80%)',
          bottom: '-10px',
          transform: 'scale(0.9)',
          transition: 'opacity 0.3s',
        }}
      />
      
      {/* Main dock with physical material properties */}
      <nav
        ref={dockRef}
        className="relative px-4 py-3 rounded-full flex items-center justify-between w-full max-w-sm"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(245,245,255,0.7) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: `
            inset 0 1px 2px rgba(255,255,255,1),
            inset 0 -2px 2px rgba(0,0,0,0.05),
            0 5px 12px rgba(0,0,0,0.15),
            0 15px 25px -8px rgba(0,0,0,0.3)
          `,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Highlight edge - gives the glass a rim light effect */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.6) 0%, transparent 70%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Inner reflection - adds depth to the glass */}
        <div 
          className="absolute inset-[2px] rounded-full pointer-events-none opacity-50"
          style={{
            background: 'linear-gradient(125deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(255,255,255,0.2) 80%)',
          }}
        />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          
          return (
            <div
              key={item.id}
              className="relative"
              style={{
                transform: `translateZ(${isActive ? 20 : 10}px)`,
                transition: 'transform 0.3s',
              }}
            >
              {/* Physical button base */}
              <button
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                  else itemRefs.current.delete(item.id);
                }}
                onClick={() => handleNavClick(item.id as AppView)}
                onMouseDown={() => setPressedItem(item.id)}
                onMouseUp={() => setPressedItem(null)}
                onMouseLeave={() => setPressedItem(null)}
                className="relative w-14 h-14 flex items-center justify-center rounded-full transition-all duration-200 group"
                style={{
                  ...getItemStyles(item.id),
                  background: isActive
                    ? 'linear-gradient(145deg, #ff7a21, #ff9f4a)'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,250,0.7))',
                  boxShadow: isActive
                    ? `
                        inset 0 -2px 2px rgba(0,0,0,0.1),
                        inset 0 2px 2px rgba(255,255,255,0.4),
                        0 5px 15px #ff7a21,
                        0 0 0 2px rgba(255,255,255,0.8)
                      `
                    : `
                        inset 0 2px 4px rgba(255,255,255,1),
                        inset 0 -2px 4px rgba(0,0,0,0.1),
                        0 5px 10px rgba(0,0,0,0.1),
                        0 8px 20px rgba(0,0,0,0.05)
                      `,
                  border: isActive 
                    ? '1px solid rgba(255,255,255,0.8)' 
                    : '1px solid rgba(255,255,255,0.9)',
                }}
                aria-label={item.label}
              >
                {/* Icon with subtle glow */}
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 3 : 2}
                  className="relative z-10"
                  style={{
                    color: isActive ? '#ffffff' : '#4a4a5a',
                    filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
                    transition: 'all 0.2s',
                  }}
                />
                
                {/* Button highlight/reflection */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
              </button>

              {/* Label that appears on hover - like physical tooltips */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
                style={{
                  background: 'rgba(30,30,40,0.9)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  transform: 'translateY(0) scale(0.9)',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {item.label}
                {/* Small arrow pointing down */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 top-full"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid rgba(30,30,40,0.9)',
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Bottom edge shadow - adds thickness perception */}
        <div 
          className="absolute bottom-0 left-4 right-4 h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
            transform: 'translateY(4px)',
          }}
        />
      </nav>
    </div>
  );
};
