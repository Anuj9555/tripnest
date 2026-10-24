import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { useUIStore } from '../store/uiStore';
import {
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Compass,
  ArrowLeft,
  Save,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const TripEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrip, fetchTripById, updateTrip, regenerateFullTrip, isGenerating } = useTripStore();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('0');
  const [travelerType, setTravelerType] = useState('Solo');
  const [groupSize, setGroupSize] = useState(1);
  const [pace, setPace] = useState('Balanced');
  const [status, setStatus] = useState('planned');
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  useEffect(() => {
    if (id) {
      fetchTripById(id).then((t) => {
        if (t) {
          setTitle(t.title || '');
          setDestination(t.destination || '');
          setStartDate(t.start_date || '');
          setEndDate(t.end_date || '');
          setBudget(String(t.budget || 0));
          setTravelerType(t.traveler_type || 'Solo');
          setGroupSize(t.group_size || 1);
          setPace(t.pace || 'Balanced');
          setStatus(t.status || 'planned');
          setAdditionalPreferences(t.additional_preferences || '');
        }
      });
    }
  }, [id, fetchTripById]);

  if (!currentTrip) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Loading trip details...</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateTrip(id, {
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: parseFloat(budget) || 0,
        traveler_type: travelerType,
        group_size: groupSize,
        pace,
        status: status as any,
        additional_preferences: additionalPreferences,
      });
      navigate(`/trip/${id}`);
    } catch {
      // Handled in store
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    const parsedBudget = parseFloat(budget) || 0;
    try {
      await updateTrip(id, {
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: parsedBudget,
        traveler_type: travelerType,
        group_size: groupSize,
        pace,
        additional_preferences: additionalPreferences,
      });
      await regenerateFullTrip(id, {
        budget: parsedBudget,
        pace,
        additional_preferences: additionalPreferences,
      });
      navigate(`/trip/${id}`);
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/trip/${id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Itinerary</span>
        </button>

        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>Save & Regenerate Plan</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Trip Details</h1>
        <p className="text-xs text-slate-500 mt-1">
          Update trip metadata, destinations, travel dates, or budget parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Trip Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Budget (INR)
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { name: '₹12k', val: 12000 },
                  { name: '₹35k', val: 35000 },
                  { name: '₹85k', val: 85000 },
                  { name: '₹1.5L', val: 150000 },
                ].map((tier) => (
                  <button
                    key={tier.name}
                    type="button"
                    onClick={() => setBudget(String(tier.val))}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      Number(budget) === tier.val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <IndianRupee className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Traveler Type
            </label>
            <select
              value={travelerType}
              onChange={(e) => setTravelerType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Solo">Solo</option>
              <option value="Couple">Couple</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Group Size
            </label>
            <input
              type="number"
              min="1"
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Trip Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="planned">Planned</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Special Instructions / Preferences
          </label>
          <textarea
            rows={3}
            value={additionalPreferences}
            onChange={(e) => setAdditionalPreferences(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/trip/${id}`)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
