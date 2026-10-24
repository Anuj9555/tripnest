import React from 'react';
import { DayPlan } from '../../types';
import { IndianRupee, Layers } from 'lucide-react';

interface DayTabsProps {
  days: DayPlan[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({
  days,
  selectedDay,
  onSelectDay,
  showAll,
  onToggleShowAll,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none print:hidden">
      {/* All Days button */}
      <button
        onClick={onToggleShowAll}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors border ${
          showAll
            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All Days ({days.length})</span>
      </button>

      {/* Individual Day Tabs */}
      {days.map((day) => {
        const isActive = !showAll && selectedDay === day.day;
        return (
          <button
            key={day.day}
            onClick={() => {
              if (showAll) onToggleShowAll();
              onSelectDay(day.day);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
              isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Day {day.day}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center ${
                isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <IndianRupee className="w-2.5 h-2.5" />
              {day.estimated_daily_cost.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
};
