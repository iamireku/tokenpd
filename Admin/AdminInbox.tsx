import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  Copy,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { triggerHaptic } from '../utils';

type FilterType = 'ALL' | 'SUPPORT' | 'PARTNER' | 'INVESTOR';

export const AdminInbox: React.FC = () => {
  const { adminKey, adminFetchFeedback, addToast } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadFeedback = async () => {
    if (!adminKey) return;
    setIsLoading(true);
    const res = await adminFetchFeedback(adminKey);
    if (res?.success) {
      setMessages(res.feedback || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadFeedback();
  }, [adminKey]);

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesFilter = filter === 'ALL' || msg.type === filter;
      const matchesSearch = msg.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           msg.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           msg.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [messages, filter, searchTerm]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    addToast(`${label} Copied`, "INFO");
  };

  const getCategoryStyles = (type: string) => {
    switch (type) {
      case 'PARTNER': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'INVESTOR': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'PARTNER': return 'Partnership';
      case 'INVESTOR': return 'Growth';
      default: return 'Help Req';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* INBOX ACTION HEADER */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Inbox size={20} />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase text-white tracking-widest leading-none">User Messages</h2>
              <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{messages.length} ARCHIVED IN CLOUD</p>
            </div>
          </div>
          <button 
            onClick={() => { triggerHaptic('medium'); loadFeedback(); }}
            disabled={isLoading}
            className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all active:rotate-180"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="SEARCH MESSAGES..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black text-white placeholder:text-slate-700 outline-none focus:border-blue-500/40 transition-all uppercase tracking-widest"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 px-1">
            {[
              { id: 'ALL', label: 'All Messages', icon: Inbox },
              { id: 'SUPPORT', label: 'Help', icon: MessageSquare },
              { id: 'PARTNER', label: 'Partners', icon: Handshake },
              { id: 'INVESTOR', label: 'Growth', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { triggerHaptic('light'); setFilter(tab.id as FilterType); }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  filter === tab.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MESSAGE FEED */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] opacity-30">
             <AlertCircle className="mx-auto mb-4" size={40} />
             <p className="text-[9px] font-black uppercase tracking-[0.4em]">No messages found in filter</p>
          </div>
        ) : (
          filteredMessages.map((msg, i) => {
            const isNew = (Date.now() - new Date(msg.timestamp).getTime()) < 3600000;
            return (
              <div 
                key={i} 
                className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-blue-500/30 transition-all animate-in slide-in-from-bottom duration-500 shadow-xl"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="p-6 space-y-6">
                  {/* Card Header: Type & User Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${getCategoryStyles(msg.type)}`}>
                         {msg.type === 'PARTNER' ? <Handshake size={24} /> : msg.type === 'INVESTOR' ? <BarChart3 size={24} /> : <MessageSquare size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <h3 className="text-sm font-black text-white uppercase tracking-tight">{msg.nickname}</h3>
                           {isNew && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                           <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${getCategoryStyles(msg.type)}`}>
                             {getCategoryLabel(msg.type)}
                           </span>
                           <div className="flex items-center gap-1.5 text-slate-500">
                             <Clock size={10} />
                             <span className="text-[7px] font-black uppercase tracking-widest">Received {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCopy(msg.nickname, "Username")}
                      className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-700 hover:text-white transition-colors"
                    >
                      <User size={14} />
                    </button>
                  </div>

                  {/* Body: The Message Content */}
                  <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 group-hover:border-slate-700 transition-colors">
                    <p className="text-[10px] text-slate-300 font-bold uppercase leading-relaxed selectable-data whitespace-pre-wrap">
                      {msg.comment}
                    </p>
                  </div>

                  {/* Footer: Contact & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={() => handleCopy(msg.email, "Email")}
                         className="flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[8px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                       >
                         <Mail size={12} className="text-blue-500" />
                         {msg.email}
                       </button>
                    </div>
                    <div className="flex gap-2">
                       <a 
                         href={`mailto:${msg.email}?subject=TokenPod Support: Re: ${msg.nickname}`}
                         className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 border-t border-white/20"
                       >
                         <ArrowUpRight size={12} /> Draft Reply
                       </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center pt-10">
         <div className="inline-flex items-center gap-3 bg-slate-950 border border-slate-900 px-6 py-2 rounded-full">
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.3em]">Communications Node Local Sync Complete</p>
         </div>
      </div>
    </div>
  );
};