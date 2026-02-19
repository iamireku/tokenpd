import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useApp } from '../store';
import { AppStatus } from '../types';
import { formatTimeLeft, getAppStatus, triggerHaptic } from '../utils';
import { Timer, Zap, ExternalLink } from 'lucide-react';

interface FloatingPortalProps {
  onClose: () => void;
}

/**
 * FloatingTimerView: The content that renders INSIDE the PiP window.
 * This is a minimalist version of the dashboard.
 */
const FloatingTimerView: React.FC<{ state: any; now: number }> = ({ state, now }) => {
  const sortedApps = [...state.apps].sort((a, b) => {
    const aMin = Math.min(...state.tasks.filter((t: any) => t.appId === a.id).map((t: any) => t.nextDueAt));
    const bMin = Math.min(...state.tasks.filter((t: any) => t.appId === b.id).map((t: any) => t.nextDueAt));
    return aMin - bMin;
  });

  return (
    <div style={{ 
      backgroundColor: '#000', 
      color: '#fff', 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <Timer size={16} color="#ff7a21" />
        <h1 style={{ fontSize: '12px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Signal Overlay</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedApps.map(app => {
          const status = getAppStatus(app.id, state.tasks, now);
          const tasks = state.tasks.filter((t: any) => t.appId === app.id);
          const nextDue = Math.min(...tasks.map((t: any) => t.nextDueAt));
          const timeLeft = formatTimeLeft(nextDue - now);
          const isReady = status === AppStatus.READY;
          const isUrgent = status === AppStatus.URGENT;

          return (
            <div key={app.id} style={{ 
              backgroundColor: '#0b0e14', 
              borderRadius: '16px', 
              padding: '12px', 
              border: isReady ? '1.5px solid #ff7a21' : '1.5px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#222' }}>
                  {/* Fixed invalid CSS property 'objectCover' to 'objectFit' */}
                  <img src={app.icon} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
                <div>
                  <h3 style={{ fontSize: '10px', fontWeight: '900', margin: 0, textTransform: 'uppercase', color: '#fff' }}>{app.name}</h3>
                  <p style={{ 
                    fontSize: '9px', 
                    fontWeight: 'bold', 
                    margin: '2px 0 0 0', 
                    color: isReady ? '#ff7a21' : isUrgent ? '#ff7a21' : '#10b981',
                    animation: isUrgent ? 'pulse 1s infinite' : 'none'
                  }}>
                    {isReady ? 'READY NOW' : timeLeft}
                  </p>
                </div>
              </div>
              {isReady && <Zap size={14} color="#ff7a21" fill="#ff7a21" />}
            </div>
          );
        })}

        {sortedApps.length === 0 && (
          <p style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '40px' }}>No active signals</p>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export const FloatingPortal: React.FC<FloatingPortalProps> = ({ onClose }) => {
  const { state } = useApp();
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

        // Copy styles from main document
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pip.document.head.appendChild(style);
          } catch (e) {}
        });

        // Add a specialized root for the PiP window
        const rootDiv = pip.document.createElement('div');
        rootDiv.id = 'pip-root';
        pip.document.body.appendChild(rootDiv);
        
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

  // Update the PiP content whenever state or time changes
  useEffect(() => {
    if (pipRootRef.current) {
      pipRootRef.current.render(<FloatingTimerView state={state} now={now} />);
    }
  }, [state, now]);

  return null; // This component doesn't render anything in the main DOM
};