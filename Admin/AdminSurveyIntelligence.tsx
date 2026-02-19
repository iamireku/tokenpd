import React from 'react';
import { BarChart3, Info, MessageSquare, Activity } from 'lucide-react';

interface SurveyData {
  question: string;
  results: {
    label: string;
    count: number;
    color?: string;
  }[];
}

interface AdminSurveyIntelligenceProps {
  data: SurveyData[];
}

export const AdminSurveyIntelligence: React.FC<AdminSurveyIntelligenceProps> = ({ data }) => {
  // If no real data, show a placeholder
  if (!data || data.length === 0) {
    return (
      <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Community Feedback</h2>
          </div>
        </div>
        <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
          <MessageSquare size={32} className="mb-2" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">No Active Survey Data Found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-blue-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Community Feedback</h2>
        </div>
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[7px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
          <Activity size={10} className="animate-pulse" /> Live Result Count
        </div>
      </div>

      <div className="space-y-10">
        {data.map((poll, i) => {
          const total = poll.results.reduce((acc, curr) => acc + curr.count, 0);
          const maxCountInPoll = Math.max(...poll.results.map(r => r.count), 1);
          
          return (
            <div key={i} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Tag size={14} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[11px] font-black uppercase tracking-tight text-white leading-tight">
                    Topic: {poll.question}
                  </h3>
                  <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {total} Active Responses
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-3 h-32 px-2">
                {poll.results.map((res, j) => {
                  const percent = (res.count / total) * 100;
                  const relativeHeight = (res.count / maxCountInPoll) * 100;
                  const barColor = percent > 50 ? 'bg-green-500' : percent > 25 ? 'bg-blue-500' : 'bg-slate-700';

                  return (
                    <div key={j} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div 
                        className={`w-full rounded-t-xl transition-all duration-1000 ease-out relative ${barColor} group-hover:brightness-125 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                        style={{ height: `${relativeHeight}%` }}
                      >
                        <div className={`absolute inset-0 opacity-40 blur-sm rounded-t-xl ${barColor}`} />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-white tabular-nums">{percent.toFixed(0)}%</span>
                        <span className="text-[6px] font-bold text-slate-500 uppercase tracking-tighter truncate w-full text-center">{res.label}</span>
                      </div>

                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[7px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {res.count} Users
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-start gap-3">
        <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
          User surveys track network opinion in real-time. Results are stored securely in the cloud database and updated automatically as hunters vote.
        </p>
      </div>
    </section>
  );
};
import { Tag } from 'lucide-react';