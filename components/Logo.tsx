
import React from 'react';

interface LogoProps {
  size?: number;
  pulseSpeed?: number; 
  strokeColor?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 64, 
  pulseSpeed = 4,
  strokeColor = 'var(--primary)'
}) => {
  const logoUrl = "https://imgur.com/a/aP3lePs";

  return (
    <div 
      className="relative flex items-center justify-center animate-quantum" 
      style={{ 
        width: size, 
        height: size, 
        '--pulse-speed': `${pulseSpeed}s` 
      } as React.CSSProperties}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-theme-primary/10 rounded-full blur-xl animate-pulse" />
      
      <div 
        className="relative bg-slate-950 rounded-full flex items-center justify-center overflow-hidden z-10"
        style={{ 
          width: size * 0.9, 
          height: size * 0.9,
          boxShadow: `0 8px 25px -5px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.05)`
        }}
      >
        <img 
          src={logoUrl} 
          className="w-full h-full object-cover" 
          alt="TP" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'icon-192.png';
          }}
        />
        
        {/* System Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-theme-primary/40 shadow-[0_0_8px_var(--primary)] animate-[scan_3s_linear_infinite] pointer-events-none" />
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  );
};
