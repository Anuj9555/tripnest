import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types';
import {
  MapPin,
  Calendar,
  Bookmark,
  Share2,
  Printer,
  Edit3,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  IndianRupee
} from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { useUIStore } from '../../store/uiStore';
import { RegenerateBudgetModal } from './RegenerateBudgetModal';

interface TripHeaderProps {
  trip: Trip;
}

export const TripHeader: React.FC<TripHeaderProps> = ({ trip }) => {
  const navigate = useNavigate();
  const { toggleSaveTrip, isGenerating } = useTripStore();
  const { addToast } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip.title,
        text: `Check out my personalized trip to ${trip.destination} on TripNest!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Trip link copied to clipboard!', 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs mb-6 print:border-none print:shadow-none print:p-0">
      {/* Back button */}
      <button
        onClick={() => navigate('/my-trips')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors print:hidden"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to My Trips</span>
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {trip.title}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              {trip.status}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{trip.destination}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{trip.start_date} to {trip.end_date}</span>
            </div>
            <span>•</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors font-medium"
              title="Click to edit budget & regenerate"
            >
              <IndianRupee className="w-3 h-3 text-slate-400" />
              <span>₹{(trip.budget || 0).toLocaleString()} ({trip.budget_type || 'Standard'})</span>
              <span className="text-[10px] text-blue-600 font-bold ml-1">Edit</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          {/* Save / Bookmark Button */}
          <button
            onClick={() => toggleSaveTrip(trip.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              trip.is_saved
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${trip.is_saved ? 'fill-amber-600' : ''}`} />
            <span>{trip.is_saved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Edit Trip */}
          <button
            onClick={() => navigate(`/trip/${trip.id}/edit`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* Regenerate Itinerary with Budget */}
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Regenerate & Budget Recalibration Modal */}
      <RegenerateBudgetModal
        trip={trip}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
