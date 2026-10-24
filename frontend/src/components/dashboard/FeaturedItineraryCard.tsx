import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types';
import { Compass, Sparkles, MapPin, Calendar, IndianRupee, ArrowRight, Check } from 'lucide-react';

interface FeaturedItineraryCardProps {
  trip?: Trip | null;
}

export const FeaturedItineraryCard: React.FC<FeaturedItineraryCardProps> = ({ trip }) => {
  const navigate = useNavigate();

  // If no trip or Bali Escape not found, show default featured layout
  const title = trip?.title || 'Bali Escape: Culture, Terraces & Coastal Cliffs';
  const destination = trip?.destination || 'Bali, Indonesia';
  const duration = '5 Days / 4 Nights';
  const budget = trip?.budget || 75000;

  const sampleDays = [
    { day: 1, title: 'Arrival & Beach Sunset at Jimbaran' },
    { day: 2, title: 'Ubud Culture, Sacred Monkey Forest & Campuhan' },
    { day: 3, title: 'Tegallalang Rice Terraces & Waterfalls' },
    { day: 4, title: 'Clifftop Uluwatu Temple & Kecak Dance' },
    { day: 5, title: 'Seminyak Artisanal Shopping & Departure' },
  ];

  const handleClick = () => {
    if (trip) {
      navigate(`/trip/${trip.id}`);
    } else {
      navigate('/create-trip?destination=Bali,%20Indonesia');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-50 text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Featured Itinerary</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          Handcrafted AI Plan
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Overview & Image */}
        <div className="lg:w-2/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-3">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{destination}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{duration}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              A balanced escape designed for couples and relaxed travelers, featuring serene rice terraces, tranquil waterfall hikes, clifftop sunset views, and curated dining.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Estimated Cost</span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center">
                <IndianRupee className="w-3.5 h-3.5" />
                {budget.toLocaleString()} INR
              </span>
            </div>

            <button
              onClick={handleClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Explore Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Day Schedule Snapshot */}
        <div className="lg:w-3/5 bg-slate-50/70 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-800 mb-2.5 block">
            Day-by-Day Route Overview
          </span>
          <div className="space-y-2">
            {sampleDays.map((d) => (
              <div
                key={d.day}
                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {d.day}
                </div>
                <span className="text-xs font-medium text-slate-700 truncate">
                  {d.title}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>Includes curated meals, stays, travel time, and daily budget breakdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};
