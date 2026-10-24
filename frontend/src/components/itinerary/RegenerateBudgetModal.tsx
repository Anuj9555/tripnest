import React, { useState } from 'react';
import { Trip } from '../../types';
import { useTripStore } from '../../store/tripStore';
import {
  X,
  Sparkles,
  RefreshCw,
  IndianRupee,
  Check,
  Compass,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface RegenerateBudgetModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

const BUDGET_PRESETS = [
  {
    name: 'Backpacker',
    amount: 12000,
    desc: 'Hostels, local trains & street foods',
    emoji: '🎒',
    color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 text-emerald-800'
  },
  {
    name: 'Comfort',
    amount: 35000,
    desc: '3-Star hotels, AC cabs & cafes',
    emoji: '🏨',
    color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50 text-blue-800'
  },
  {
    name: 'Luxury',
    amount: 85000,
    desc: '4-5 Star stays, private chauffeurs & fine dining',
    emoji: '✨',
    color: 'border-purple-200 hover:border-purple-400 bg-purple-50/50 text-purple-800'
  },
  {
    name: 'Royal VIP',
    amount: 150000,
    desc: 'Heritage suites, helicopter tours & Michelin dinners',
    emoji: '👑',
    color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50 text-amber-800'
  }
];

export const RegenerateBudgetModal: React.FC<RegenerateBudgetModalProps> = ({
  trip,
  isOpen,
  onClose
}) => {
  const { regenerateFullTrip, isGenerating } = useTripStore();
  
  const [budget, setBudget] = useState<number>(trip.budget || 35000);
  const [pace, setPace] = useState<string>(trip.pace || 'Balanced');
  const [accommodation, setAccommodation] = useState<string>(
    trip.accommodation_preference || '3-Star Hotel'
  );
  const [instructions, setInstructions] = useState<string>('');

  if (!isOpen) return null;

  // Calculate days
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const dailyRate = Math.round(budget / diffDays);

  const getTier = (amt: number) => {
    if (amt <= 18000) return { label: 'Backpacker Tier', color: 'text-emerald-700 bg-emerald-100' };
    if (amt <= 55000) return { label: 'Comfort Tier', color: 'text-blue-700 bg-blue-100' };
    if (amt <= 110000) return { label: 'Luxury Tier', color: 'text-purple-700 bg-purple-100' };
    return { label: 'Royal VIP Tier', color: 'text-amber-700 bg-amber-100' };
  };

  const currentTier = getTier(budget);

  const handleApplyPreset = (presetAmount: number, presetName: string) => {
    setBudget(presetAmount);
    if (presetName === 'Backpacker') setAccommodation('Hostel');
    else if (presetName === 'Comfort') setAccommodation('3-Star Hotel');
    else if (presetName === 'Luxury') setAccommodation('4-Star Hotel');
    else if (presetName === 'Royal VIP') setAccommodation('5-Star Luxury Resort');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await regenerateFullTrip(trip.id, {
      budget: Number(budget),
      pace,
      accommodation_preference: accommodation,
      instructions: instructions || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Regenerate Plan with New Budget
              </h3>
              <p className="text-xs text-slate-500">
                Adjust budget or style to generate a tailored itinerary for {trip.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Budget Tier Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BUDGET_PRESETS.map((preset) => {
                const isSelected = budget === preset.amount;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset.amount, preset.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                        : preset.color
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{preset.emoji}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                    </div>
                    <p className="text-xs font-bold text-slate-900">{preset.name}</p>
                    <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                      ₹{preset.amount.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Budget Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Total Budget (INR)
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentTier.color}`}>
                  {currentTier.label}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ≈ ₹{dailyRate.toLocaleString()} / day
                </span>
              </div>
            </div>

            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="5000"
                step="500"
                required
                value={budget}
                onChange={(e) => setBudget(Math.max(1000, Number(e.target.value)))}
                className="w-full pl-9 pr-4 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Enter budget in INR..."
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Estimated total cost for {diffDays} days for {trip.group_size} {trip.group_size > 1 ? 'travelers' : 'traveler'}.
            </p>
          </div>

          {/* Preferences Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Accommodation Preference
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Hostel">Hostel / Dormitory (Budget)</option>
                <option value="3-Star Hotel">3-Star Hotel / Boutique Inn</option>
                <option value="4-Star Hotel">4-Star Premium Hotel</option>
                <option value="5-Star Luxury Resort">5-Star Luxury Resort / Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Travel Pace
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Relaxed">Relaxed (Slow mornings, 2-3 stops)</option>
                <option value="Balanced">Balanced (Optimal sights & leisure)</option>
                <option value="Fast-Paced">Fast-Paced (Action-packed, 4-5 stops)</option>
              </select>
            </div>
          </div>

          {/* AI Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Specific AI Customization (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Include seafood restaurants, more beach cafes, less walking..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Notice */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Regenerating will produce a new optimized itinerary version matching <strong>₹{budget.toLocaleString()}</strong>, updated hotel tiers, realistic activity prices, and categorized expense allocation.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? 'Regenerating Itinerary...'
                  : `Regenerate Plan (₹${budget.toLocaleString()})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
