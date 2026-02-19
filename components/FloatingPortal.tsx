import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useApp } from '../store';
import { AppStatus } from '../types';
import { formatTimeLeft, getAppStatus, triggerHaptic } from '../utils';
import { Timer, Zap, ExternalLink, Play, ChevronRight } from 'lucide-react';

interface FloatingPortalProps {
  onClose: () => void;
}

/**
 * ProgressRing: A compact visual indicator for the harvest cycle
 */
const ProgressRing: React.FC<{ progress: number; status: AppStatus; size: number }> = ({ progress, status, size }) => {
  const radius = size / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  const color = status === AppStatus.READY ? '#ff7a21' : status === AppStatus.URGENT ? '#ff7a21' : '#10b981';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: status === AppStatus.READY ? 'drop-shadow(0 0 6px rgba(255,122,33,0.4))' : 'none' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="3"
        fill="transparent"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth="3"
        fill="transparent"
        strokeDasharray={circumference}
        style={{ 
          strokeDashoffset: offset, 
          transition: 'stroke-dashoffset 1s linear',
          strokeLinecap: 'round'
        }}
      />
    </svg>
  );
};

/**
 * FloatingTimerView: The content that renders INSIDE the PiP window.
 * Engineered as a High-Density HUD for multitasking.
 */
const FloatingTimerView: React.FC<{ state: any; now: number; onLaunch: (name: string, url: string) => void }> = ({ state, now, onLaunch }) => {
  const sortedApps = [...state.apps].sort((a, b) => {
    const aTasks = state.tasks.filter((t: any) => t.appId === a.id);
    const bTasks = state.tasks.filter((t: any) => t.appId === b.id);
    const aMin = aTasks.length > 0 ? Math.min(...aTasks.map((t: any) => t.nextDueAt)) : Infinity;
    const bMin = bTasks.length > 0 ? Math.min(...bTasks.map((t: any) => t.nextDueAt)) : Infinity;
    return aMin - bMin;
  });

  // Adaptive Density Filter: Hide Pods > 2 hours away unless it's the very next one
  const visibleApps = sortedApps.filter((app, index) => {
    if (index === 0) return true; // Always show next signal
    const tasks = state.tasks.filter((t: any) => t.appId === app.id);
    const nextDue = tasks.length > 0 ? Math.min(...tasks.map((t: any) => t.nextDueAt)) : Infinity;
    const status = getAppStatus(app.id, state.tasks, now);
    const isReadyOrUrgent = status !== AppStatus.ACTIVE;
    const isWithin2Hours = (nextDue - now) < 7200000;
    return isReadyOrUrgent || isWithin2Hours;
  });

  return (
    <div style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
      color: '#fff', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '16px',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)'
    }}>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)', 
        paddingBottom: '12px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={14} color="#ff7a21" />
          <h1 style={{ fontSize: '10px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)' }}>Signal HUD</h1>
        </div>
        <div style={{ fontSize: '10px', fontWeight: '900', color: '#ff7a21', letterSpacing: '0.5px' }}>
          {state.points}P
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleApps.map(app => {
          const status = getAppStatus(app.id, state.tasks, now);
          const tasks = state.tasks.filter((t: any) => t.appId === app.id);
          const nextDue = tasks.length > 0 ? Math.min(...tasks.map((t: any) => t.nextDueAt)) : now;
          const task = tasks.find((t: any) => t.nextDueAt === nextDue);
          
          const timeLeft = formatTimeLeft(nextDue - now);
          const isReady = status === AppStatus.READY;
          const isUrgent = status === AppStatus.URGENT;

          // Calculate Progress
          let progress = 0;
          if (task) {
            const duration = (task.customHours || 24) * 3600000 + (task.customMinutes || 0) * 60000;
            const elapsed = duration - Math.max(0, nextDue - now);
            progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
          }

          return (
            <div 
              key={app.id} 
              onClick={() => { triggerHaptic('light'); onLaunch(app.name, app.fallbackStoreUrl); }}
              style={{ 
                backgroundColor: isReady ? 'rgba(255, 122, 33, 0.08)' : 'rgba(255,255,255,0.04)', 
                borderRadius: '16px', 
                padding: '12px 16px', 
                border: isReady ? '1px solid rgba(255,122,33,0.5)' : '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isReady ? '0 8px 24px rgba(255,122,33,0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <ProgressRing progress={isReady ? 100 : progress} status={status} size={38} />
                  </div>
                  <img 
                    src={app.icon} 
                    style={{ 
                      width: '26px', 
                      height: '26px', 
                      borderRadius: '7px', 
                      objectFit: 'cover', 
                      position: 'relative',
                      zIndex: 2,
                      filter: isReady ? 'none' : 'grayscale(0.6)'
                    }} 
                    alt="" 
                  />
                  {isReady && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,122,33,0.4)', borderRadius: '7px', width: '26px', height: '26px', margin: 'auto' }}>
                       <Play size={10} fill="white" color="white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: '900', margin: 0, textTransform: 'uppercase', color: isReady ? '#fff' : 'rgba(255,255,255,0.9)', letterSpacing: '0.3px' }}>{app.name}</h3>
                  <p style={{ 
                    fontSize: '9px', 
                    fontWeight: '800', 
                    margin: '2px 0 0 0', 
                    color: isReady ? '#ff7a21' : isUrgent ? '#ff7a21' : '#10b981',
                    letterSpacing: '0.5px'
                  }}>
                    {isReady ? 'READY NOW' : timeLeft}
                  </p>
                </div>
              </div>
              
              <div style={{ opacity: isReady ? 1 : 0.3 }}>
                {isReady ? (
                  <div style={{ background: '#ff7a21', padding: '6px', borderRadius: '10px', display: 'flex', boxShadow: '0 4px 10px rgba(255,122,33,0.3)' }}>
                    <Zap size={14} color="#000" fill="#000" />
                  </div>
                ) : (
                  <ChevronRight size={14} color="#fff" />
                )}
              </div>
            </div>
          );
        })}

        {visibleApps.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Zap size={32} color="rgba(255,255,255,0.1)" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px' }}>Scanning Network...</p>
          </div>
        )}
      </div>

      {visibleApps.length > 0 && sortedApps.length > visibleApps.length && (
        <div style={{ marginTop: '20px', textAlign: 'center', opacity: 0.4 }}>
           <p style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>+ {sortedApps.length - visibleApps.length} more signals in vault</p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export const FloatingPortal: React.FC<FloatingPortalProps> = ({ onClose }) => {
  const { state, triggerLaunch } = useApp();
  const [now, setNow] = useState(Date.now());
  const pipWindowRef = useRef<any>(null);
  const pipRootRef = useRef<any>(null);

  useEffect(() => {
    const heartbeat = setInterval(() => setNow(Date.now()), 1000);
    
    const launchPip = async () => {
      if (!('documentPictureInPicture' in window)) return;

      try {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 320,
          height: 480,
        });

        pipWindowRef.current = pip;

        // Copy all style tags to PiP
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pip.document.head.appendChild(style);
          } catch (e) {}
        });

        // Setup PiP Root
        const rootDiv = pip.document.createElement('div');
        rootDiv.id = 'pip-root';
        pip.document.body.appendChild(rootDiv);
        pip.document.body.style.margin = '0';
        pip.document.body.style.overflowX = 'hidden';
        pip.document.body.style.backgroundColor = '#000';
        
        const root = ReactDOM.createRoot(rootDiv);
        pipRootRef.current = root;

        pip.addEventListener('pagehide', () => {
          onClose();
        });

        triggerHaptic('success');
      } catch (err) {
        console.error('PiP Request Failed:', err);
        onClose();
      }
    };

    launchPip();

    return () => {
      clearInterval(heartbeat);
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
    };
  }, []);

  // Launch Protocol for PiP
  const handlePipLaunch = (name: string, url: string) => {
    window.focus();
    triggerLaunch(name, url);
  };

  // Live Rendering Sync
  useEffect(() => {
    if (pipRootRef.current) {
      pipRootRef.current.render(
        <FloatingTimerView 
          state={state} 
          now={now} 
          onLaunch={handlePipLaunch} 
        />
      );
    }
  }, [state, now]);

  return null;
};