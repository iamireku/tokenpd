
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useApp } from '../store';
import { AppStatus, SoundProfile } from '../types';
import { formatTimeLeft, getAppStatus, triggerHaptic, playSignalSound } from '../utils';
import { Timer, Zap, ExternalLink, Play, ChevronRight, Volume2, VolumeX, Info } from 'lucide-react';

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
 */
const FloatingTimerView: React.FC<{ 
  state: any; 
  now: number; 
  onLaunch: (name: string, url: string) => void;
  onToggleAudio: () => void;
}> = ({ state, now, onLaunch, onToggleAudio }) => {
  const [showSmartNote, setShowSmartNote] = useState(true);

  const sortedApps = [...state.apps].sort((a, b) => {
    const aTasks = state.tasks.filter((t: any) => t.appId === a.id);
    const bTasks = state.tasks.filter((t: any) => t.appId === b.id);
    const aMin = aTasks.length > 0 ? Math.min(...aTasks.map((t: any) => t.nextDueAt)) : Infinity;
    const bMin = bTasks.length > 0 ? Math.min(...bTasks.map((t: any) => t.nextDueAt)) : Infinity;
    return aMin - bMin;
  });

  const visibleApps = sortedApps.filter((app, index) => {
    if (index === 0) return true; 
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
      WebkitBackdropFilter: 'blur(30px)',
      display: 'flex',
      flexDirection: 'column'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onToggleAudio}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: state.hudAudioEnabled ? '#ff7a21' : 'rgba(255,255,255,0.3)', 
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            {state.hudAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {/* Standard React components for tooltips don't work easily here, so we use a simplified PiP-compatible tip */}
          </button>
          <div style={{ fontSize: '10px', fontWeight: '900', color: '#ff7a21', letterSpacing: '0.5px' }}>
            {state.points}P
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {visibleApps.map(app => {
          const status = getAppStatus(app.id, state.tasks, now);
          const tasks = state.tasks.filter((t: any) => t.appId === app.id);
          const nextDue = tasks.length > 0 ? Math.min(...tasks.map((t: any) => t.nextDueAt)) : now;
          const task = tasks.find((t: any) => t.nextDueAt === nextDue);
          const timeLeft = formatTimeLeft(nextDue - now);
          const isReady = status === AppStatus.READY;
          const isUrgent = status === AppStatus.URGENT;

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
                  <img src={app.icon} style={{ width: '26px', height: '26px', borderRadius: '7px', objectFit: 'cover', position: 'relative', zIndex: 2, filter: isReady ? 'none' : 'grayscale(0.6)' }} alt="" />
                  {isReady && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,122,33,0.4)', borderRadius: '7px', width: '26px', height: '26px', margin: 'auto' }}>
                       <Play size={10} fill="white" color="white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: '900', margin: 0, textTransform: 'uppercase', color: isReady ? '#fff' : 'rgba(255,255,255,0.9)', letterSpacing: '0.3px' }}>{app.name}</h3>
                  <p style={{ fontSize: '9px', fontWeight: '800', margin: '2px 0 0 0', color: isReady ? '#ff7a21' : isUrgent ? '#ff7a21' : '#10b981', letterSpacing: '0.5px' }}>
                    {isReady ? 'READY NOW' : timeLeft}
                  </p>
                </div>
              </div>
              <div style={{ opacity: isReady ? 1 : 0.3 }}>
                {isReady ? (
                  <div style={{ background: '#ff7a21', padding: '6px', borderRadius: '10px', display: 'flex', boxShadow: '0 4px 10px rgba(255,122,33,0.3)' }}>
                    <Zap size={14} color="#000" fill="#000" />
                  </div>
                ) : <ChevronRight size={14} color="#fff" />}
              </div>
            </div>
          );
        })}
      </div>

      {showSmartNote && (
        <footer style={{ marginTop: 'auto', paddingTop: '16px' }}>
           <div 
             onClick={() => setShowSmartNote(false)}
             style={{ 
               backgroundColor: 'rgba(255,122,33,0.1)', 
               border: '1px dashed rgba(255,122,33,0.3)', 
               borderRadius: '12px', 
               padding: '10px', 
               display: 'flex', 
               alignItems: 'start', 
               gap: '8px',
               cursor: 'pointer'
             }}
           >
              <Info size={12} color="#ff7a21" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '8px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', margin: 0, textTransform: 'uppercase', lineHeight: '1.4', letterSpacing: '0.5px' }}>
                Priority Mode: Only Ready, Urgent, or soon-to-be-due tasks are shown here. (Tap to hide)
              </p>
           </div>
        </footer>
      )}
    </div>
  );
};

export const FloatingPortal: React.FC<FloatingPortalProps> = ({ onClose }) => {
  const { state, triggerLaunch, dispatch } = useApp();
  const [now, setNow] = useState(Date.now());
  const pipWindowRef = useRef<any>(null);
  const pipRootRef = useRef<any>(null);
  
  const prevReadyCount = useRef<number>(0);

  useEffect(() => {
    const heartbeat = setInterval(() => setNow(Date.now()), 1000);
    const launchPip = async () => {
      if (!('documentPictureInPicture' in window)) return;
      try {
        const pip = await (window as any).documentPictureInPicture.requestWindow({ width: 320, height: 480 });
        pipWindowRef.current = pip;
        [...document.styleSheets].forEach((ss) => {
          try {
            const css = [...ss.cssRules].map((r) => r.cssText).join('');
            const style = document.createElement('style');
            style.textContent = css;
            pip.document.head.appendChild(style);
          } catch (e) {}
        });
        const rootDiv = pip.document.createElement('div');
        rootDiv.id = 'pip-root';
        pip.document.body.appendChild(rootDiv);
        pip.document.body.style.margin = '0';
        pip.document.body.style.backgroundColor = '#000';
        const root = ReactDOM.createRoot(rootDiv);
        pipRootRef.current = root;
        pip.addEventListener('pagehide', () => onClose());
        triggerHaptic('success');
      } catch (err) { onClose(); }
    };
    launchPip();
    return () => {
      clearInterval(heartbeat);
      if (pipWindowRef.current) pipWindowRef.current.close();
    };
  }, []);

  useEffect(() => {
    const currentReadyCount = state.tasks.filter(t => t.nextDueAt <= now).length;
    if (currentReadyCount > prevReadyCount.current && state.hudAudioEnabled) {
      playSignalSound(state.soundProfile);
      triggerHaptic('medium');
    }
    prevReadyCount.current = currentReadyCount;
  }, [state.tasks, now, state.hudAudioEnabled, state.soundProfile]);

  const handlePipLaunch = (name: string, url: string) => {
    window.focus();
    triggerLaunch(name, url);
  };

  const handleToggleAudio = () => {
    dispatch({ type: 'SET_VAULT', vault: { hudAudioEnabled: !state.hudAudioEnabled } });
  };

  useEffect(() => {
    if (pipRootRef.current) {
      pipRootRef.current.render(
        <FloatingTimerView 
          state={state} 
          now={now} 
          onLaunch={handlePipLaunch} 
          onToggleAudio={handleToggleAudio}
        />
      );
    }
  }, [state, now]);

  return null;
};
