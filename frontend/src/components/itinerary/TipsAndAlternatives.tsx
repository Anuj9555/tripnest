import React from 'react';
import { AlternativeItem } from '../../types';
import { Lightbulb, Shuffle, ArrowRight, ShieldAlert } from 'lucide-react';

interface TipsAndAlternativesProps {
  tips: string[];
  alternatives: AlternativeItem[];
  onSelectAlternative?: (alt: AlternativeItem) => void;
}

export const TipsAndAlternatives: React.FC<TipsAndAlternativesProps> = ({
  tips,
  alternatives,
  onSelectAlternative,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Tips */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3.5">
          <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Practical Travel Tips</h3>
            <p className="text-[11px] text-slate-500">Destination safety, tickets, and packing advice.</p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Alternatives */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3.5">
          <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
            <Shuffle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Curated Alternatives</h3>
            <p className="text-[11px] text-slate-500">Swap crowded stops for serene alternatives.</p>
          </div>
        </div>

        <div className="space-y-3">
          {alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Instead of: {alt.activity}
                </span>
                <p className="font-bold text-slate-900">{alt.alternative}</p>
                <p className="text-slate-500 mt-1 leading-relaxed">{alt.reason}</p>
              </div>

              {onSelectAlternative && (
                <button
                  type="button"
                  onClick={() => onSelectAlternative(alt)}
                  className="mt-2.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start"
                >
                  <span>Consider this stop</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
