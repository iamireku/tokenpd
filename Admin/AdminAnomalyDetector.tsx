
import React from 'react';
import { ShieldAlert, AlertCircle, Eye, Radar, Trash2, UserX } from 'lucide-react';
import { AnomalyReport } from '../types';

interface AdminAnomalyDetectorProps {
  anomalies: AnomalyReport[];
  onDismiss: (id: string) => void;
  onBan: (accountId: string) => void;
}

export const AdminAnomalyDetector: React.FC<AdminAnomalyDetectorProps> = ({ anomalies, onDismiss, onBan }) => {
  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'HIGH': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getAnomalyLabel = (type: string) => {
    switch(type) {
      case 'BOT_PRECISION': return 'Unexpected Harvest Speed';
      case 'MULTI_VAULT': return 'Vault Data Collision';
      case 'INJECTION_SURGE': return 'Unusual Point Spike';
      default: return 'Pattern Error Detected';
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
        <Radar size={120} className="animate-spin duration-[10s] linear" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest text-red-400">Pattern Error Detection</h2>
        </div>
        <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[7px] font-black text-slate-500 uppercase tracking-widest">
           Live Database Scanning...
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {anomalies.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
            <AlertCircle size={32} className="mb-2" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Database Signatures Normal</p>
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div key={anomaly.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 group transition-all hover:border-slate-700">
               <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[7px] font-black uppercase border mb-2 ${getSeverityColor(anomaly.severity)}`}>
                       <AlertCircle size={8} /> {anomaly.severity} SEVERITY
                    </div>
                    <h3 className="font-black text-xs uppercase tracking-tight text-white">{anomaly.nickname}</h3>
                    <p className="text-[9px] font-mono text-slate-500 mt-1">{anomaly.accountId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TIMESTAMP</p>
                    <p className="text-[10px] font-mono text-white mt-1">
                      {new Date(anomaly.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
               </div>

               <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 mb-5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
                    <span className="text-white">TRIGGER:</span> {getAnomalyLabel(anomaly.type)}
                  </p>
               </div>

               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onBan(anomaly.accountId)}
                    className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <UserX size={12} /> Flag Account
                  </button>
                  <button 
                    onClick={() => onDismiss(anomaly.id)}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-500 transition-colors">
                    <Eye size={14} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center px-1">
         <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">Smart Pattern Rate: 5Hz</p>
         <button className="text-[7px] font-black text-blue-500 uppercase tracking-widest hover:underline">View History</button>
      </div>
    </section>
  );
};
