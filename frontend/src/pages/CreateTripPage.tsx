import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Building2,
  Navigation,
  Utensils,
  Gauge,
  Info,
  Clock
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createTripWithAI, isGenerating, generationStep } = useTripStore();
  const { addToast } = useUIStore();

  const urlDest = searchParams.get('destination') || '';

  // Dates setup
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 10);
  const fourDaysLater = new Date(tomorrow);
  fourDaysLater.setDate(fourDaysLater.getDate() + 3);

  // Form State
  const [destination, setDestination] = useState(urlDest || 'Goa, India');
  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(fourDaysLater.toISOString().split('T')[0]);
  const [travelerType, setTravelerType] = useState('Solo');
  const [groupSize, setGroupSize] = useState(1);
  const [budget, setBudget] = useState('25000');
  const [budgetType, setBudgetType] = useState('Total Trip');
  const [travelStyles, setTravelStyles] = useState<string[]>(['Balanced', 'Comfort']);
  const [interests, setInterests] = useState<string[]>(['Culture', 'Food', 'Nature']);
  const [accommodation, setAccommodation] = useState('3-Star Hotel');
  const [transport, setTransport] = useState('Mixed');
  const [pace, setPace] = useState('Balanced');
  const [foodPreferences, setFoodPreferences] = useState<string[]>(['Local Cuisine']);
  const [additionalPreferences, setAdditionalPreferences] = useState(
    'Prefer scenic locations, relaxed meal times, and avoiding overcrowded peak-hour queues.'
  );

  // Options from specification
  const travelerTypeOptions = ['Solo', 'Couple', 'Family', 'Friends', 'Business'];
  const travelStyleOptions = ['Budget', 'Comfort', 'Luxury', 'Relaxed', 'Fast-paced', 'Balanced'];
  const interestOptions = [
    'Nature', 'Adventure', 'Food', 'Culture', 'History',
    'Shopping', 'Nightlife', 'Beaches', 'Photography', 'Spiritual',
    'Wildlife', 'Architecture'
  ];
  const accommodationOptions = [
    'Hostel', 'Budget Hotel', '3-Star Hotel', '4-Star Hotel',
    '5-Star Hotel', 'Resort', 'Homestay'
  ];
  const transportOptions = ['Walking', 'Public Transport', 'Taxi', 'Rental Car', 'Mixed'];
  const paceOptions = ['Relaxed', 'Balanced', 'Packed'];
  const foodOptions = [
    'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Local Cuisine',
    'Fine Dining', 'Street Food', 'No Preference'
  ];

  // Auto adjust group size based on traveler type
  const handleTravelerTypeChange = (type: string) => {
    setTravelerType(type);
    if (type === 'Solo') setGroupSize(1);
    else if (type === 'Couple') setGroupSize(2);
    else if (type === 'Family') setGroupSize(4);
    else if (type === 'Friends') setGroupSize(4);
  };

  const toggleMultiSelect = (item: string, currentList: string[], setList: (val: string[]) => void) => {
    if (currentList.includes(item)) {
      if (currentList.length > 1) {
        setList(currentList.filter((i) => i !== item));
      }
    } else {
      setList([...currentList, item]);
    }
  };

  // Duration calculation
  const getDaysCount = () => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!destination.trim()) {
      addToast('Destination is required', 'error');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      addToast('Start date cannot be after end date', 'error');
      return;
    }
    if (parseFloat(budget) <= 0) {
      addToast('Budget must be greater than zero', 'error');
      return;
    }
    if (groupSize < 1) {
      addToast('Group size must be at least 1', 'error');
      return;
    }
    if (interests.length === 0) {
      addToast('Please select at least one interest', 'error');
      return;
    }

    try {
      const newTrip = await createTripWithAI({
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        traveler_type: travelerType,
        group_size: groupSize,
        budget: parseFloat(budget),
        budget_type: budgetType,
        travel_style: travelStyles,
        interests,
        accommodation_preference: accommodation,
        transport_preference: transport,
        pace,
        food_preferences: foodPreferences,
        additional_preferences: additionalPreferences.trim(),
      });
      navigate(`/trip/${newTrip.id}`);
    } catch {
      // Store shows toast
    }
  };

  // If currently generating, show the full-screen progressive loading experience!
  if (isGenerating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs animate-spin">
            <Compass className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Planning your trip to {destination}...
        </h2>
        <p className="text-sm font-medium text-blue-600 mt-2 h-6 animate-fade-in">
          {generationStep}
        </p>

        {/* Progressive checklist */}
        <div className="mt-8 max-w-sm w-full bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left space-y-3">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Analyzing traveler preferences & budget</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Curating verified regional attractions & timing</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
            <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
            <span className="text-blue-900 font-semibold">Grouping locations & minimizing transit</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
            <span>Calculating meal costs and day breakdown</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Your Trip
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tell us where you want to go and your preferred travel style. TripNest AI will generate an optimized, day-by-day plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Destination & Dates */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Destination & Timeline</h2>
              <p className="text-[11px] text-slate-500">Where are you traveling and for how long?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Destination <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Manali, Bali, Jaipur, Goa"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="text-xs text-blue-700 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
            <span>Total Duration: <strong>{getDaysCount()} Days / {Math.max(1, getDaysCount() - 1)} Nights</strong></span>
            <span className="text-slate-500 text-[11px]">Daily pace will be optimized accordingly.</span>
          </div>
        </div>

        {/* Section 2: Travelers & Budget */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Travelers & Budget</h2>
              <p className="text-[11px] text-slate-500">Group size and target expense boundaries.</p>
            </div>
          </div>

          {/* Budget Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select a Budget Tier (or type custom amount below):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setBudget('12000');
                  setTravelStyles(['Budget']);
                  setAccommodation('Hostel');
                  setTransport('Public Transport');
                  setFoodPreferences(['Street Food', 'Local Cuisine']);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  parseFloat(budget) <= 15000
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">🎒 Backpacker</span>
                  <span className="text-[11px] font-bold text-amber-700">₹12k</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Hostels, street food, public transport</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBudget('35000');
                  setTravelStyles(['Balanced', 'Comfort']);
                  setAccommodation('3-Star Hotel');
                  setTransport('Mixed');
                  setFoodPreferences(['Local Cuisine']);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  parseFloat(budget) > 15000 && parseFloat(budget) <= 55000
                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">🌟 Comfort</span>
                  <span className="text-[11px] font-bold text-blue-700">₹35k</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">3/4-Star stays, popular bistros, cabs</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBudget('85000');
                  setTravelStyles(['Luxury', 'Relaxed']);
                  setAccommodation('5-Star Hotel');
                  setTransport('Taxi');
                  setFoodPreferences(['Fine Dining', 'Local Cuisine']);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  parseFloat(budget) > 55000 && parseFloat(budget) <= 120000
                    ? 'border-purple-500 bg-purple-50/70 ring-1 ring-purple-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">👑 Luxury</span>
                  <span className="text-[11px] font-bold text-purple-700">₹85k</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">5-Star hotels, private driver, chef dining</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBudget('150000');
                  setTravelStyles(['Luxury']);
                  setAccommodation('Resort');
                  setTransport('Rental Car');
                  setFoodPreferences(['Fine Dining']);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  parseFloat(budget) > 120000
                    ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">💎 Royal VIP</span>
                  <span className="text-[11px] font-bold text-indigo-700">₹1.5L</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Private villas, helicopter/yacht, VIP access</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Traveler Type
              </label>
              <select
                value={travelerType}
                onChange={(e) => handleTravelerTypeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {travelerTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Travelers
              </label>
              <input
                type="number"
                min="1"
                required
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Custom Budget (INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="3000"
                  step="500"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Budget Type
              </label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Total Trip">Total Trip Budget</option>
                <option value="Per Person">Per Person Budget</option>
              </select>
            </div>
          </div>

          {/* Dynamic Budget Calculation Preview */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Estimated Daily Burn Rate:</span>
              <span className="font-bold text-slate-900">
                ₹{Math.round((parseFloat(budget) || 0) / (getDaysCount() * Math.max(1, groupSize))).toLocaleString()} / person / day
              </span>
            </div>
            <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] self-start sm:self-auto ${
              (parseFloat(budget) || 0) / (getDaysCount() * Math.max(1, groupSize)) < 2500
                ? 'bg-amber-100 text-amber-800'
                : (parseFloat(budget) || 0) / (getDaysCount() * Math.max(1, groupSize)) <= 7500
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              Tier:{' '}
              {(parseFloat(budget) || 0) / (getDaysCount() * Math.max(1, groupSize)) < 2500
                ? 'Backpacker / Shoestring'
                : (parseFloat(budget) || 0) / (getDaysCount() * Math.max(1, groupSize)) <= 7500
                ? 'Comfort / Smart Explorer'
                : 'Luxury / Royal Premium'}
            </span>
          </div>
        </div>

        {/* Section 3: Style & Interests */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Travel Style & Interests</h2>
              <p className="text-[11px] text-slate-500">Pick experiences you enjoy most.</p>
            </div>
          </div>

          {/* Travel Style Multi-select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Travel Style (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {travelStyleOptions.map((style) => {
                const active = travelStyles.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => toggleMultiSelect(style, travelStyles, setTravelStyles)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests Multi-select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Key Interests & Activities <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleMultiSelect(interest, interests, setInterests)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Stay, Transit, Pace & Food */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Preferences & Food</h2>
              <p className="text-[11px] text-slate-500">Fine-tune your stay tier, transit mode, and dietary style.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Accommodation Preference
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {accommodationOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Transportation Mode
              </label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {transportOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Travel Pace
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {paceOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Food Preferences Chips */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Food & Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {foodOptions.map((diet) => {
                const active = foodPreferences.includes(diet);
                return (
                  <button
                    type="button"
                    key={diet}
                    onClick={() => toggleMultiSelect(diet, foodPreferences, setFoodPreferences)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      active
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Preferences Textarea */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Preferences & Notes
            </label>
            <textarea
              rows={3}
              value={additionalPreferences}
              onChange={(e) => setAdditionalPreferences(e.target.value)}
              placeholder="e.g. Prefer scenic spots with photography opportunities, avoid high physical exertion, prefer authentic street food."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all hover:translate-y-[-1px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Personalized Itinerary</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
