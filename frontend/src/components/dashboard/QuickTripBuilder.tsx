import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee, Sparkles, SlidersHorizontal, Compass } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';

export const QuickTripBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { createTripWithAI, isGenerating } = useTripStore();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 14);
  const fiveDaysLater = new Date(tomorrow);
  fiveDaysLater.setDate(fiveDaysLater.getDate() + 4);

  const [destination, setDestination] = useState('Goa, India');
  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(fiveDaysLater.toISOString().split('T')[0]);
  const [budget, setBudget] = useState('35000');
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Beaches', 'Food']);

  const popularInterests = ['Beaches', 'Nature', 'Food', 'Culture', 'Adventure', 'Relaxation'];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    try {
      const trip = await createTripWithAI({
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        traveler_type: 'Couple',
        group_size: 2,
        budget: parseFloat(budget) || 35000,
        budget_type: 'Total Trip',
        travel_style: [travelStyle],
        interests: selectedInterests,
        accommodation_preference: '3-Star Hotel',
        transport_preference: 'Mixed',
        pace: 'Balanced',
        food_preferences: ['Local Cuisine'],
        additional_preferences: 'Generated via Quick Builder',
      });
      navigate(`/trip/${trip.id}`);
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Quick Trip Builder</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure key preferences to generate an instant travel plan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/create-trip')}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          <span>Advanced Mode</span>
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={handleQuickSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Destination */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Bali, Goa"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Travel Dates
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Budget (INR)
              </label>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                parseFloat(budget) < 20000 ? 'bg-amber-100 text-amber-800' :
                parseFloat(budget) <= 55000 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {parseFloat(budget) < 20000 ? '🎒 Backpacker' :
                 parseFloat(budget) <= 55000 ? '🌟 Comfort' : '👑 Luxury'}
              </span>
            </div>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="5000"
                step="1000"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => {
                  setBudget('12000');
                  setTravelStyle('Budget');
                }}
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  budget === '12000' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ₹12k
              </button>
              <button
                type="button"
                onClick={() => {
                  setBudget('35000');
                  setTravelStyle('Balanced');
                }}
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  budget === '35000' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ₹35k
              </button>
              <button
                type="button"
                onClick={() => {
                  setBudget('85000');
                  setTravelStyle('Luxury');
                }}
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  budget === '85000' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ₹85k
              </button>
            </div>
          </div>

          {/* Travel Style */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Travel Style
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Budget">Budget Backpacker</option>
              <option value="Comfort">Comfort & Boutique</option>
              <option value="Balanced">Balanced Mix</option>
              <option value="Relaxed">Relaxed & Leisure</option>
              <option value="Luxury">Luxury Resort</option>
            </select>
          </div>
        </div>

        {/* Interests Chips & Submit Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-600">Interests:</span>
            {popularInterests.map((interest) => {
              const active = selectedInterests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Itinerary...' : 'Generate Itinerary'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
