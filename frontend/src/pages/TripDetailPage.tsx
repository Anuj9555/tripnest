import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { TripHeader } from '../components/itinerary/TripHeader';
import { SummaryCards } from '../components/itinerary/SummaryCards';
import { DayTabs } from '../components/itinerary/DayTabs';
import { DayTimeline } from '../components/itinerary/DayTimeline';
import { AccommodationCard } from '../components/itinerary/AccommodationCard';
import { BudgetBreakdownChart } from '../components/itinerary/BudgetBreakdownChart';
import { TipsAndAlternatives } from '../components/itinerary/TipsAndAlternatives';
import { RegenerateBudgetModal } from '../components/itinerary/RegenerateBudgetModal';
import { ActivityItem } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentTrip,
    fetchTripById,
    isLoading,
    isGenerating,
    regenerateDay,
    replaceActivity,
    selectedDay,
    setSelectedDay,
  } = useTripStore();

  const [showAllDays, setShowAllDays] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'budget' | 'tips'>('timeline');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTripById(id);
    }
  }, [id, fetchTripById]);

  if (isLoading && !currentTrip) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading your itinerary...</p>
      </div>
    );
  }

  if (!currentTrip || !currentTrip.active_itinerary) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Trip Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested trip may have been removed or does not exist.
        </p>
        <button
          onClick={() => navigate('/my-trips')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500"
        >
          Return to My Trips
        </button>
      </div>
    );
  }

  const itinerary = currentTrip.active_itinerary;
  const days = itinerary.days || [];
  const currentDayPlan = days.find((d) => d.day === selectedDay) || days[0];

  const handleUpdateActivity = (dayNumber: number, updated: ActivityItem) => {
    // In-memory update + persistence
    if (!currentTrip.active_itinerary) return;
    const updatedDays = currentTrip.active_itinerary.days.map((d) => {
      if (d.day === dayNumber) {
        return {
          ...d,
          activities: d.activities.map((a) => (a.id === updated.id ? updated : a)),
        };
      }
      return d;
    });

    const newItin = {
      ...currentTrip.active_itinerary,
      days: updatedDays,
    };

    useTripStore.setState((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, active_itinerary: newItin } : null,
    }));
  };

  const handleRemoveActivity = (dayNumber: number, activityId: string) => {
    if (!currentTrip.active_itinerary) return;
    const updatedDays = currentTrip.active_itinerary.days.map((d) => {
      if (d.day === dayNumber) {
        return {
          ...d,
          activities: d.activities.filter((a) => a.id !== activityId),
        };
      }
      return d;
    });

    const newItin = {
      ...currentTrip.active_itinerary,
      days: updatedDays,
    };

    useTripStore.setState((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, active_itinerary: newItin } : null,
    }));
  };

  const handleAddCustomActivity = (dayNumber: number) => {
    if (!currentTrip.active_itinerary) return;
    const newAct: ActivityItem = {
      id: Math.random().toString(36).substring(2, 9),
      time: '04:00 PM',
      name: 'Custom Sightseeing Stop',
      category: 'Sightseeing',
      location: currentTrip.destination,
      duration_minutes: 60,
      estimated_cost: 0,
      description: 'Custom activity added by traveler.',
      reason: 'Personal exploration stop.',
      travel_time_from_previous: '15 mins',
      transport: 'Walking',
    };

    const updatedDays = currentTrip.active_itinerary.days.map((d) => {
      if (d.day === dayNumber) {
        return {
          ...d,
          activities: [...d.activities, newAct],
        };
      }
      return d;
    });

    const newItin = {
      ...currentTrip.active_itinerary,
      days: updatedDays,
    };

    useTripStore.setState((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, active_itinerary: newItin } : null,
    }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Flagship Header */}
      <TripHeader trip={currentTrip} />

      {/* KPI Summary Cards */}
      <SummaryCards
        trip={currentTrip}
        itinerary={itinerary}
        onEditBudget={() => setIsBudgetModalOpen(true)}
      />

      {/* Main Navigation Tabs for Itinerary View */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Day-by-Day Timeline
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'budget'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Budget Breakdown & Stays
        </button>

        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'tips'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Tips & Alternatives
        </button>
      </div>

      {/* TAB 1: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Day selection pills */}
          <DayTabs
            days={days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            showAll={showAllDays}
            onToggleShowAll={() => setShowAllDays(!showAllDays)}
          />

          {/* Timeline View */}
          {showAllDays ? (
            <div className="space-y-10">
              {days.map((day) => (
                <DayTimeline
                  key={day.day}
                  day={day}
                  onRegenerateDay={regenerateDay}
                  onReplaceActivity={replaceActivity}
                  onUpdateActivity={handleUpdateActivity}
                  onRemoveActivity={handleRemoveActivity}
                  onAddActivity={handleAddCustomActivity}
                  isGenerating={isGenerating}
                />
              ))}
            </div>
          ) : (
            currentDayPlan && (
              <DayTimeline
                day={currentDayPlan}
                onRegenerateDay={regenerateDay}
                onReplaceActivity={replaceActivity}
                onUpdateActivity={handleUpdateActivity}
                onRemoveActivity={handleRemoveActivity}
                onAddActivity={handleAddCustomActivity}
                isGenerating={isGenerating}
              />
            )
          )}
        </div>
      )}

      {/* TAB 2: BUDGET & STAYS */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {itinerary.accommodation && itinerary.transportation && (
            <AccommodationCard
              accommodation={itinerary.accommodation}
              transportation={itinerary.transportation}
            />
          )}

          {itinerary.budget_breakdown && (
            <BudgetBreakdownChart
              breakdown={itinerary.budget_breakdown}
              targetBudget={currentTrip.budget}
              onEditBudget={() => setIsBudgetModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* TAB 3: TIPS & ALTERNATIVES */}
      {activeTab === 'tips' && (
        <TipsAndAlternatives
          tips={itinerary.tips || []}
          alternatives={itinerary.alternatives || []}
          onSelectAlternative={(alt) => {
            if (currentDayPlan) {
              replaceActivity(currentDayPlan.day, alt.activity);
              setActiveTab('timeline');
            }
          }}
        />
      )}

      {/* Direct Budget Recalibration Modal */}
      <RegenerateBudgetModal
        trip={currentTrip}
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />
    </div>
  );
};
