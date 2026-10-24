import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { Bookmark, MapPin, Calendar, IndianRupee, ArrowRight, Trash2, Sparkles } from 'lucide-react';

export const SavedItinerariesPage: React.FC = () => {
  const navigate = useNavigate();
  const { savedTrips, fetchSavedTrips, toggleSaveTrip } = useTripStore();

  useEffect(() => {
    fetchSavedTrips();
  }, [fetchSavedTrips]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Itineraries</h1>
        <p className="text-xs text-slate-500 mt-1">
          Your bookmarked trips, favorite routes, and inspiration drafts.
        </p>
      </div>

      {savedTrips.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Saved Itineraries Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click the "Save" button on any generated trip to bookmark it here for quick offline reference.
          </p>
          <button
            onClick={() => navigate('/create-trip')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
          >
            Create Itinerary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedTrips.map((saved) => {
            const trip = saved.trip;
            if (!trip) return null;

            return (
              <div
                key={saved.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="group bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Bookmark className="w-3 h-3 fill-amber-600" />
                      <span>Bookmarked</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveTrip(trip.id);
                      }}
                      title="Remove Bookmark"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{trip.destination}</span>
                  </div>

                  {saved.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-3 leading-relaxed">
                      "{saved.notes}"
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.start_date}</span>
                    </div>
                    <div className="flex items-center font-bold text-slate-800">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
