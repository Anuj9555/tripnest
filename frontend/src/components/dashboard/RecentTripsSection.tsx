import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types';
import { Calendar, MapPin, IndianRupee, Users, ArrowRight, Copy, Trash2, Sparkles } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';

interface RecentTripsSectionProps {
  trips: Trip[];
}

export const RecentTripsSection: React.FC<RecentTripsSectionProps> = ({ trips }) => {
  const navigate = useNavigate();
  const { duplicateTrip, deleteTrip } = useTripStore();

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Trips Created Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Start your journey! Build your first AI-optimized itinerary with custom pace, stays, and budget.
        </p>
        <button
          onClick={() => navigate('/create-trip')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-xs"
        >
          Create First Trip
        </button>
      </div>
    );
  }

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await duplicateTrip(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      await deleteTrip(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Trips</h2>
          <p className="text-xs text-slate-500">Upcoming adventures and customizable drafts.</p>
        </div>
        <button
          onClick={() => navigate('/my-trips')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View all ({trips.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.slice(0, 3).map((trip) => {
          let statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
          if (trip.status === 'completed') {
            statusBadge = 'bg-slate-100 text-slate-600 border-slate-200';
          } else if (trip.status === 'draft') {
            statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
          }

          const dayCount = trip.active_itinerary?.days?.length || 4;

          return (
            <div
              key={trip.id}
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="group bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${statusBadge}`}>
                    {trip.status}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDuplicate(e, trip.id)}
                      title="Duplicate Trip"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, trip.id)}
                      title="Delete Trip"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {trip.title}
                </h3>

                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{trip.destination}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dayCount} Days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trip.group_size} ({trip.traveler_type})</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Estimated Budget</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center">
                    <IndianRupee className="w-3 h-3" />
                    {trip.budget.toLocaleString()}
                  </span>
                </div>

                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
