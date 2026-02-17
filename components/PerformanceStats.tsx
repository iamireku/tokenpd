
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  getReadinessDistribution, 
  getAverageEfficiency, 
  getDaysUntilSeasonEnd 
} from '../utils';
import { 
  Zap, 
  Layers, 
  CalendarDays, 
  Trophy, 
  BarChart3
} from 'lucide-react';

export const PerformanceStats: React.FC = () => {
  const { state } = useApp();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const efficiency = useMemo(() => getAverageEfficiency(state.tasks), [state.tasks]);
  const daysRemaining = useMemo(() => getDaysUntilSeasonEnd(), []);
  
  const distribution = useMemo(() => 
    getReadinessDistribution(state.tasks, now), 
    [state.tasks, now]
  );
  
  const maxReady = useMemo(() => 
    Math.max(...distribution, 1), 
    [distribution]
  );

  return (
    <section className="mb-8 solid-card rounded-[2rem] p-6">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Trophy size={11} className="text-theme-muted" />
            <span className="text-[8px] font-black uppercase tracking-widest text-theme-muted">Account status</span>
          </div>
          <p className="text-base font-black uppercase tracking-tight text-theme-main leading-tight tabular-nums">
            {state.rank}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Layers size={11} className="text-theme-muted" />
            <span className="text-[8px] font-black uppercase tracking-widest text-theme-muted">Active Pods</span>
          </div>
          <p className="text-base font-black tabular-nums text-theme-main leading-tight">
            {state.apps.length}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-green-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-theme-muted">Efficiency</span>
          </div>
          <p className="text-base font-black tabular-nums text-green-500 leading-tight">
            {efficiency}%
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={11} className="text-orange-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-theme-muted">Season deadline</span>
          </div>
          <p className="text-base font-black tabular-nums text-orange-500 leading-tight">
            {daysRemaining} Days
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-theme/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <BarChart3 size={11} className="text-theme-muted" />
            <span className="text-[8px] font-black uppercase tracking-widest text-theme-muted">Readiness Timeline (12H)</span>
          </div>
        </div>
        <div className="flex items-end gap-[3px] h-10">
          {distribution.map((count, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-t-[1px] transition-all duration-500 ${count > 0 ? 'bg-theme-primary' : 'bg-theme-muted opacity-10'}`} 
              style={{ 
                height: `${(count / maxReady) * 100}%`, 
                minHeight: count > 0 ? '4px' : '1px' 
              }} 
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 px-0.5">
           <span className="text-[7px] font-black text-theme-muted uppercase tracking-widest">NOW</span>
           <span className="text-[7px] font-black text-theme-muted uppercase tracking-widest">+12H</span>
        </div>
      </div>
    </section>
  );
};
