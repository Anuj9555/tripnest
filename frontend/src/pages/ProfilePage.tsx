import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTripStore } from '../store/tripStore';
import {
  User,
  Mail,
  Calendar,
  Compass,
  MapPin,
  IndianRupee,
  Sparkles,
  Heart,
  Users,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips } = useTripStore();

  const totalTrips = trips.length;
  const uniqueDestinations = new Set(trips.map((t) => t.destination)).size;
  const totalBudgetManaged = trips.reduce((acc, t) => acc + (t.budget || 0), 0);

  const scenarios = [
    {
      title: 'Solo Weekend Explorer',
      type: 'Solo',
      destination: 'Manali, Himachal Pradesh',
      duration: '3 Days',
      budget: 15000,
      tags: ['Efficient Schedule', 'Affordable Dining', 'Nearby Trails'],
      desc: 'Optimized for quick turnaround, low planning friction, and scenic mountain views.',
    },
    {
      title: 'Romantic Couple Escape',
      type: 'Couple',
      destination: 'Bali, Indonesia',
      duration: '5 Days',
      budget: 75000,
      tags: ['Scenic Vistas', 'Relaxed Pacing', 'Curated Dining'],
      desc: 'Balanced leisure with private beach sunsets, boutique villas, and candlelit dinners.',
    },
    {
      title: 'Group Friends Adventure',
      type: 'Friends',
      destination: 'Goa, India',
      duration: '4 Days',
      budget: 45000,
      tags: ['Group Coordination', 'Water Sports', 'Nightlife'],
      desc: 'Action-packed coastal adventures, beach shacks, and group dining with zero hassle.',
    },
  ];

  const handleLaunchScenario = (sc: typeof scenarios[0]) => {
    navigate(`/create-trip?destination=${encodeURIComponent(sc.destination)}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}
            alt={user?.name || 'User'}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 p-0.5 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Alex Turner'}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Pro Traveler
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email || 'traveler@tripnest.com'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors self-start sm:self-auto"
        >
          Edit Profile
        </button>
      </div>

      {/* Travel Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Trips</span>
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalTrips}</p>
          <p className="text-[11px] text-slate-400 mt-1">Generated and customized itineraries</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Destinations</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{uniqueDestinations}</p>
          <p className="text-[11px] text-slate-400 mt-1">Unique travel regions explored</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Managed</span>
            <IndianRupee className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalBudgetManaged.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Optimized travel spending</p>
        </div>
      </div>

      {/* Instant Scenario Presets */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Traveler Personas & Scenarios</h2>
          <p className="text-xs text-slate-500">
            Launch pre-configured travel archetypes with verified pacing and dining tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {scenarios.map((sc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {sc.type} Archetype
                  </span>
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {sc.budget.toLocaleString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">{sc.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{sc.desc}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLaunchScenario(sc)}
                className="mt-5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                <span>Plan This Scenario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
