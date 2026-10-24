import React from 'react';
import { MealItem } from '../../types';
import { Utensils, Coffee, Sun, Moon, IndianRupee } from 'lucide-react';

interface MealCardProps {
  meals: MealItem[];
}

export const MealCard: React.FC<MealCardProps> = ({ meals }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
        <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
          <Utensils className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recommended Dining</h3>
          <p className="text-[11px] text-slate-500">Curated meals matching dietary and budget preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {meals.map((meal, idx) => {
          let Icon = Coffee;
          let badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
          if (meal.type === 'Lunch') {
            Icon = Sun;
            badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
          } else if (meal.type === 'Dinner') {
            Icon = Moon;
            badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
          }

          return (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">{meal.type}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                    {meal.cuisine}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 mt-1">{meal.restaurant}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{meal.reason}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Est. Cost:</span>
                <span className="font-bold text-slate-800 flex items-center">
                  <IndianRupee className="w-3 h-3" />
                  {meal.estimated_cost.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
