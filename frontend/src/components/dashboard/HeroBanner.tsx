import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Compass } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#102A43] via-[#1A365D] to-[#0F2942] text-white p-6 sm:p-8 md:p-10 shadow-lg border border-slate-700/40">
      {/* Background Subtle Map Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>AI-Powered Itinerary Engine</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Your Next Adventure Starts Here
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          Personalized itineraries tailored to your exact travel preferences, budget, pace, and travel style. Skip the hours of research and enjoy optimized day-by-day itineraries.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/create-trip')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all hover:translate-y-[-1px]"
          >
            <span>Plan Personalized Trip</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/my-trips')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>View Saved Itineraries</span>
          </button>
        </div>

        {/* Value Highlights */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Generate day schedules in seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Budget-aware calculations</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Geographically grouped attractions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
