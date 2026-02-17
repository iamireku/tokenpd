
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  Inbox, 
  MessageSquare, 
  Handshake, 
  BarChart3, 
  Clock, 
  User, 
  Mail, 
  ChevronRight, 
  RefreshCw,
  Loader2
} from 'lucide-react';
import { triggerHaptic } from '../utils';

export const AdminInbox: React.FC = () => {
  const { adminKey, adminFetchFeedback } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadFeedback = async () => {
    if (!adminKey) return;
    setIsLoading(true);
    triggerHaptic('light');
    const res = await adminFetchFeedback(adminKey);
    if (res?.success) {
      setMessages(res.feedback || []);
      setLastRefreshed(new Date());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFeedback();
  }, [adminKey]);

  const getCategoryStyles = (type: string) => {
    switch (type) {
      case 'PARTNER': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'INVESTOR': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'PARTNER': return <Handshake size={10} />;
      case 'INVESTOR': return <BarChart3 size={10} />;
      default: return <MessageSquare size={10} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Inbox className="text-blue-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Support Inbox</h2>
        </div>
        <button 
          onClick={loadFeedback}
          disabled={isLoading}
          className="text-slate-500 hover:text-white flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"
        >
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {isLoading ? 'Fetching...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="p-20 text-center opacity-20 flex flex-col items-center gap-4">
             <Inbox size={48} />
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Inbox Empty</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all animate-in slide-in-from-bottom duration-300" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-md text-[7px] font-black uppercase border flex items-center gap-1.5 ${getCategoryStyles(msg.type)}`}>
                       {getCategoryIcon(msg.type)} {msg.type}
                    </div>
                    <span className="text-[9px] font-black text-white uppercase tracking-tight">{msg.nickname}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={10} />
                    <span className="text-[8px] font-mono">{new Date(msg.timestamp).toLocaleString([], { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                  <Mail size={12} className="text-slate-600" />
                  <span className="text-[9px] font-bold text-slate-400 selectable-data select-all">{msg.email}</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-300 font-bold uppercase leading-relaxed whitespace-pre-wrap selectable-data">
                    {msg.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 text-center">
         <p className="text-[7px] font-black text-slate-700 uppercase tracking-widest">
           Showing last 50 entries from feedback database
         </p>
      </div>
    </div>
  );
};
