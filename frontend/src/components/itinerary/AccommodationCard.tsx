import React from 'react';
import { AccommodationInfo, TransportationInfo } from '../../types';
import { Building2, Navigation, IndianRupee, ShieldCheck } from 'lucide-react';

interface AccommodationCardProps {
  accommodation: AccommodationInfo;
  transportation: TransportationInfo;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  transportation,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      {/* Accommodation Details */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Stay</h3>
              <p className="text-[11px] text-slate-500">Selected based on location proximity and budget.</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {accommodation.category}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{accommodation.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{accommodation.reason}</p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Est. Price / Night</span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center sm:justify-end">
              <IndianRupee className="w-3.5 h-3.5" />
              {accommodation.estimated_price_per_night.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Transit Details */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Primary Transit Mode</h3>
            <span className="text-xs font-semibold text-emerald-700">{transportation.primary_mode}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed pl-8">
          {transportation.recommendation}
        </p>
      </div>
    </div>
  );
};
