
import React, { useMemo } from 'react';
import { useApp } from '../store';
import { calculatePointDecay, formatRelativeTime } from '../utils';
import { 
  Zap, 
  TrendingDown, 
  History as HistoryIcon, 
  ShieldCheck, 
  Info,
  ChevronLeft,
  ArrowDownToLine,
  GanttChart,
  ShieldAlert,
  Wallet,
  TrendingUp,
  LineChart,
  Ticket,
  UserPlus,
  Lock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export const PointsEconomy: React.FC = () => {
  const { state, setView } = useApp();

  const now = new Date();
  // Calculate the first day of the next month
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const carryOver = calculatePointDecay(state.points);
  const loss = state.points - carryOver;
  const decayPercentage = state.points > 0 ? Math.round((loss / state.points) * 100) : 0;

  const latestHistory = useMemo(() => {
    return [...(state.pointHistory || [])]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4);
  }, [state.pointHistory]);

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'DAILY_BONUS':
      case 'BONUS':
        return <Zap size={14} fill="currentColor" />;
      case 'REFERRAL':
        return <UserPlus size={14} />;
      case 'PURCHASE':
        return <Lock size={14} />;
      case 'REDEEM_PROTOCOL':
        return <Ticket size={14} />;
      case 'SYSTEM':
        return <ShieldAlert size={14} />;
      default:
        return <HistoryIcon size={14} />;
    }
  };

  const getHistoryLabel = (type: string) => {
    switch (type) {
      case 'DAILY_BONUS': return 'Daily Bonus';
      case 'BONUS': return 'Daily Spark';
      case 'REFERRAL': return 'Network Bonus';
      case 'PURCHASE': return 'App Unlock';
      case 'REDEEM_PROTOCOL': return 'Code Reward';
      case 'SYSTEM': return 'System Reset';
      default: return 'Movement';
    }
  };

  return (
    <div className="pb-40 pt-6 min-h-screen bg-slate-50/80 dark:bg-transparent relative animate-in slide-in-from-right duration-500 overflow-x-hidden">
      <div className="max-w-lg mx-auto">
        <header className="sticky-header-capsule mb-10 shadow-lg">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('LAB')} className="p-2 bg-theme-card rounded-xl border border-theme text-theme-muted active:scale-90 transition-transform">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-sm font-black tracking-tight text-theme-main uppercase leading-none">Account Points</h1>
              <p className="text-theme-muted font-black text-[8px] mt-1 uppercase tracking-[0.2em]">Balance & Growth Analysis</p>
            </div>
          </div>
        </header>

        <div className="px-6">
          {/* Retention Forecast */}
          <section className="mb-10 bg-theme-card p-8 rounded-[3rem] border border-theme overflow-hidden relative shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none -rotate-12 scale-150 text-theme-primary">
              <LineChart size={200} />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-orange-500" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-orange-600">Season Retention</h2>
              </div>
              {decayPercentage > 50 && (
                 <span className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-[7px] font-black uppercase animate-pulse">Low Retention</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet size={10} className="text-theme-muted" />
                  <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest">Total Points</p>
                </div>
                <h3 className="text-3xl font-black text-theme-main tabular-nums">{state.points}<span className="text-sm opacity-40 ml-0.5">P</span></h3>
              </div>
              <div className="border-l border-theme/20 pl-6">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={10} className="text-theme-primary" />
                  <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest">Carried Over</p>
                </div>
                <h3 className="text-3xl font-black text-theme-primary tabular-nums">{carryOver}<span className="text-sm opacity-40 ml-0.5">P</span></h3>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-theme-muted uppercase tracking-widest">Retention Forecast</span>
                <span className="text-[9px] font-black text-theme-primary uppercase tracking-widest">{100 - decayPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-theme-main rounded-full overflow-hidden border border-theme">
                <div 
                  className="h-full bg-theme-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${100 - decayPercentage}%` }}
                />
              </div>
              <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-center justify-between mt-6 shadow-inner">
                <div className="flex items-center gap-3">
                   <div className="bg-orange-500/20 p-2 rounded-lg">
                      <ArrowDownToLine size={16} className="text-orange-600" />
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest">Monthly Reset</p>
                      <p className="text-[10px] font-bold text-orange-800 uppercase tracking-tight">Lose {loss} P on {resetDate.toLocaleDateString()}</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* History Section */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4 px-2">
              <HistoryIcon size={14} className="text-theme-muted" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-theme-muted">History</h2>
            </div>
            <div className="bg-theme-main/30 border border-theme border-dashed rounded-[2rem] p-6 space-y-4 shadow-inner">
               {latestHistory.length > 0 ? latestHistory.map((item) => {
                 const isPositive = item.amount > 0;
                 return (
                   <div key={item.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                           isPositive 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                         }`}>
                            {getHistoryIcon(item.type)}
                         </div>
                         <div>
                            <h4 className="text-[11px] font-black text-theme-main uppercase tracking-tight">
                              {getHistoryLabel(item.type)}
                            </h4>
                            <p className="text-[7px] font-bold text-theme-muted uppercase tracking-widest">
                              {formatRelativeTime(item.timestamp)}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className={`flex items-center gap-1 font-black text-xs tabular-nums ${isPositive ? 'text-green-500' : 'text-orange-500'}`}>
                            {isPositive ? <ArrowUpRight size={10} strokeWidth={4} /> : <ArrowDownLeft size={10} strokeWidth={4} />}
                            {Math.abs(item.amount)}P
                         </div>
                         <p className="text-[6px] font-black text-theme-muted uppercase tracking-[0.2em]">{item.description}</p>
                      </div>
                   </div>
                 );
               }) : (
                 <div className="py-8 text-center opacity-20 flex flex-col items-center gap-2">
                    <HistoryIcon size={32} />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Activity Logged</p>
                 </div>
               )}
            </div>
          </section>

          {/* Economy Rules */}
          <section className="space-y-6 mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-theme-muted px-2">Account Rules</h2>
            
            <div className="bg-theme-card p-6 rounded-[2.5rem] border border-theme flex gap-5 active:scale-[0.98] transition-all cursor-pointer group shadow-sm">
               <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                  <Zap size={24} className="text-white" fill="currentColor" />
               </div>
               <div>
                  <h4 className="text-xs font-black text-theme-main uppercase mb-1 tracking-tight">Unlock Apps</h4>
                  <p className="text-[10px] text-theme-muted font-bold leading-relaxed uppercase tracking-tight opacity-70">
                    Spend points to unlock tracking for new reward apps. Unlocked apps are yours forever.
                  </p>
               </div>
            </div>

            <div className="bg-theme-card p-6 rounded-[2.5rem] border border-theme flex gap-5 active:scale-[0.98] transition-all cursor-pointer group shadow-sm">
               <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20 group-hover:-rotate-6 transition-transform">
                  <ShieldCheck size={24} className="text-white" />
               </div>
               <div>
                  <h4 className="text-xs font-black text-theme-main uppercase mb-1 tracking-tight">Verified Tracking</h4>
                  <p className="text-[10px] text-theme-muted font-bold leading-relaxed uppercase tracking-tight opacity-70">
                    We check and verify top apps to ensure your tracking timers are accurate and secure.
                  </p>
               </div>
            </div>

            <div className="bg-theme-card p-6 rounded-[2.5rem] border border-theme flex gap-5 active:scale-[0.98] transition-all cursor-pointer group shadow-sm">
               <div className="w-12 h-12 rounded-2xl bg-theme-main flex items-center justify-center shrink-0 border-2 border-theme group-hover:scale-110 transition-transform">
                  <GanttChart size={24} className="text-theme-primary" />
               </div>
               <div>
                  <h4 className="text-xs font-black text-theme-main uppercase mb-1 tracking-tight">Trend Analytics</h4>
                  <p className="text-[10px] text-theme-muted font-bold leading-relaxed uppercase tracking-tight opacity-70">
                    View global app trends to see what other hunters are tracking. Helps you find the best apps.
                  </p>
               </div>
            </div>
          </section>

          <div className="bg-blue-600/5 p-6 rounded-[2.5rem] border border-blue-600/10 flex items-start gap-4 shadow-inner">
            <Info className="text-blue-600 mt-1 shrink-0" size={16} />
            <p className="text-[9px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
              TokenPod rewards active users. Resets at the start of every month keep the point system fair and ensure you spend your points on new features and apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
