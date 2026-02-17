
import React, { useState } from 'react';
import { useApp } from '../store';
import { Download, X, Share, PlusSquare, ArrowBigDown, Zap, Coins } from 'lucide-react';
import { detectOS, triggerHaptic } from '../utils';

export const InstallPrompt: React.FC = () => {
  const { installPrompt, setInstallPrompt, isInstalled } = useApp();
  const [showIosTip, setShowIosTip] = useState(false);
  const os = detectOS();

  if (isInstalled) return null;

  const handleInstallAndroid = async () => {
    if (!installPrompt) return;
    triggerHaptic('heavy');
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleShowIosGuide = () => {
    triggerHaptic('medium');
    setShowIosTip(true);
  };

  return (
    <>
      <div className="mb-8 solid-card p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Download size={120} />
        </div>
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-tight mb-1">Get the Full App</h3>
            <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest leading-relaxed mb-4 max-w-[200px]">
              Install TokenPod to unlock <span className="text-yellow-400 font-black">+50P Bonus</span> and permanent <span className="text-yellow-400 font-black">+5% Earning Speed</span>.
            </p>
            
            <div className="flex gap-2 mb-4">
               <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
                  <Coins size={12} className="text-yellow-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">+50P REWARD</span>
               </div>
               <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
                  <Zap size={12} className="text-yellow-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">+5% BOOST</span>
               </div>
            </div>

            {os === 'ANDROID' && installPrompt && (
              <button 
                onClick={handleInstallAndroid}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Download size={14} /> Install Now
              </button>
            )}

            {os === 'IOS' && (
              <button 
                onClick={handleShowIosGuide}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Share size={14} /> Setup Guide
              </button>
            )}

            {os === 'WEB' && (
              <p className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-3 py-2 rounded-lg inline-block">
                Open on Mobile to Install
              </p>
            )}
          </div>
          
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
            <Download size={20} />
          </div>
        </div>
      </div>

      {showIosTip && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex items-end justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 flex flex-col items-center text-center shadow-2xl animate-in slide-in-from-bottom duration-500">
            <button 
              onClick={() => setShowIosTip(false)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900"
            >
              <X size={24} />
            </button>
            
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-8">
              <PlusSquare size={40} />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 uppercase mb-4">Install on iOS</h2>
            <div className="space-y-6 text-left w-full mb-10">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs">1</div>
                <p className="text-[10px] font-bold text-slate-600 uppercase">Tap the <Share size={14} className="inline mx-1 text-blue-600" /> Share button</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs">2</div>
                <p className="text-[10px] font-bold text-slate-600 uppercase">Select <span className="text-slate-900 font-black">"Add to Home Screen"</span></p>
              </div>
            </div>

            <button 
              onClick={() => setShowIosTip(false)}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Got it!
            </button>
            
            <div className="mt-8 flex flex-col items-center gap-2 text-blue-600 animate-bounce">
               <span className="text-[8px] font-black uppercase tracking-widest">Share button is here</span>
               <ArrowBigDown size={24} fill="currentColor" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
