import React from 'react';
import { BudgetBreakdown } from '../../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { IndianRupee, PieChart as ChartIcon } from 'lucide-react';

interface BudgetBreakdownChartProps {
  breakdown: BudgetBreakdown;
  targetBudget?: number;
  onEditBudget?: () => void;
}

export const BudgetBreakdownChart: React.FC<BudgetBreakdownChartProps> = ({
  breakdown,
  targetBudget,
  onEditBudget,
}) => {
  const data = [
    { name: 'Accommodation', value: breakdown.accommodation, color: '#1677FF' },
    { name: 'Food & Dining', value: breakdown.food, color: '#F59E0B' },
    { name: 'Transportation', value: breakdown.transportation, color: '#10B981' },
    { name: 'Activities & Passes', value: breakdown.activities, color: '#8B5CF6' },
    { name: 'Miscellaneous', value: breakdown.miscellaneous, color: '#64748B' },
  ].filter((item) => item.value > 0);

  const totalCalculated = breakdown.total || data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
            <ChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Estimated Budget Breakdown</h3>
            <p className="text-[11px] text-slate-500">
              Categorized expense modeling optimized for your total budget.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Grand Total</span>
          <span className="text-base font-extrabold text-slate-900 flex items-center justify-end">
            <IndianRupee className="w-4 h-4" />
            {totalCalculated.toLocaleString()} INR
          </span>
          {onEditBudget && (
            <button
              onClick={onEditBudget}
              className="mt-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              Change Budget & Regenerate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Pie Donut Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Estimate']}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Metric Rows */}
        <div className="space-y-2.5">
          {data.map((item) => {
            const pct = Math.round((item.value / totalCalculated) * 100) || 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="text-slate-400 font-normal">({pct}%)</span>
                </div>
                <span className="font-bold text-slate-900 flex items-center">
                  <IndianRupee className="w-3 h-3" />
                  {item.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
