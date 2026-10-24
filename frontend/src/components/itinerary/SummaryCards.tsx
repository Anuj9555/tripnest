import React from 'react';
import { Calendar, Users, IndianRupee, Compass, Gauge } from 'lucide-react';
import { Trip, ItineraryContent } from '../../types';

interface SummaryCardsProps {
  trip: Trip;
  itinerary: ItineraryContent;
  onEditBudget?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ trip, itinerary, onEditBudget }) => {
  const dayCount = itinerary.days?.length || trip.active_itinerary?.days?.length || 4;
  const nights = Math.max(1, dayCount - 1);
  const totalCost = itinerary.overview.estimated_total_cost || trip.budget;

  const cards = [
    {
      label: 'Duration',
      value: `${dayCount} Days / ${nights} Nights`,
      sub: `${trip.start_date} to ${trip.end_date}`,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Travelers',
      value: `${trip.group_size} ${trip.group_size > 1 ? 'People' : 'Person'}`,
      sub: `${trip.traveler_type} Trip`,
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Estimated Budget',
      value: `₹${totalCost.toLocaleString()}`,
      sub: `${trip.budget_type} (${itinerary.overview.currency || 'INR'}) • Click to edit`,
      icon: IndianRupee,
      color: 'text-indigo-600 bg-indigo-50',
      action: onEditBudget,
    },
    {
      label: 'Travel Style & Pace',
      value: trip.travel_style?.join(', ') || 'Balanced',
      sub: `${trip.pace || 'Balanced'} Pace`,
      icon: Gauge,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          onClick={c.action}
          className={`bg-white rounded-xl border border-slate-200/90 p-4.5 shadow-2xs flex items-center gap-3.5 ${
            c.action ? 'cursor-pointer hover:border-blue-300 hover:shadow-xs transition-all' : ''
          }`}
        >
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
            <c.icon className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="truncate">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {c.label}
            </span>
            <p className="text-base font-bold text-slate-900 truncate mt-0.5">{c.value}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
