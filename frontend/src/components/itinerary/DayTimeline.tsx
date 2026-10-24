import React, { useState } from 'react';
import { DayPlan, ActivityItem } from '../../types';
import {
  Clock,
  MapPin,
  IndianRupee,
  Navigation,
  Edit2,
  Trash2,
  Shuffle,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { MealCard } from './MealCard';
import { EditActivityModal } from './EditActivityModal';

interface DayTimelineProps {
  day: DayPlan;
  onRegenerateDay: (dayNumber: number, instructions?: string, lockedIds?: string[]) => void;
  onReplaceActivity: (dayNumber: number, activityName: string) => void;
  onUpdateActivity: (dayNumber: number, activity: ActivityItem) => void;
  onRemoveActivity: (dayNumber: number, activityId: string) => void;
  onAddActivity: (dayNumber: number) => void;
  isGenerating?: boolean;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  day,
  onRegenerateDay,
  onReplaceActivity,
  onUpdateActivity,
  onRemoveActivity,
  onAddActivity,
  isGenerating,
}) => {
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [regenPrompt, setRegenPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const toggleLock = (id: string) => {
    const next = new Set(lockedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setLockedIds(next);
  };

  const handleRegenerate = () => {
    onRegenerateDay(day.day, regenPrompt.trim() || undefined, Array.from(lockedIds));
    setShowPromptInput(false);
    setRegenPrompt('');
  };

  return (
    <div className="space-y-6">
      {/* Day Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                Day {day.day}
              </span>
              <span className="text-xs text-slate-500 font-medium">{day.date}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{day.title}</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg bg-slate-100 flex items-center">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>₹{day.estimated_daily_cost.toLocaleString()}</span>
            </span>

            <button
              onClick={() => onAddActivity(day.day)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>

            <button
              onClick={() => setShowPromptInput(!showPromptInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Day</span>
            </button>
          </div>
        </div>

        {/* Optional Custom Instructions Input for Day Regeneration */}
        {showPromptInput && (
          <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 animate-in fade-in duration-150">
            <p className="text-xs text-blue-900 font-semibold mb-1.5">
              Customize Day {day.day} Regeneration
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Focus on quieter nature trails or romantic viewpoints..."
                value={regenPrompt}
                onChange={(e) => setRegenPrompt(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleRegenerate}
                className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Apply AI Update
              </button>
            </div>
            {lockedIds.size > 0 && (
              <p className="text-[11px] text-blue-700 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>{lockedIds.size} locked activity will remain preserved.</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Activities Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {day.activities.map((activity, idx) => {
          const isLocked = lockedIds.has(activity.id);

          return (
            <div key={activity.id || idx} className="relative group">
              {/* Node dot on line */}
              <div
                className={`absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-colors ${
                  isLocked ? 'border-amber-500 bg-amber-50' : 'border-blue-600 group-hover:bg-blue-600'
                }`}
              />

              {/* Transit indicator from previous activity */}
              {activity.travel_time_from_previous && idx > 0 && (
                <div className="mb-3 text-[11px] font-medium text-slate-500 flex items-center gap-2 bg-slate-100/80 px-2.5 py-1 rounded-md max-w-fit">
                  <Navigation className="w-3 h-3 text-slate-400" />
                  <span>
                    Transit: {activity.travel_time_from_previous} via {activity.transport || 'Taxi'}
                  </span>
                </div>
              )}

              {/* Main Activity Card */}
              <div
                className={`bg-white rounded-xl border p-4.5 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 ${
                  isLocked ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {activity.time}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {activity.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activity.duration_minutes} mins
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    {/* Lock Button */}
                    <button
                      type="button"
                      onClick={() => toggleLock(activity.id)}
                      title={isLocked ? 'Unlock (can be regenerated)' : 'Lock (preserve during regeneration)'}
                      className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                        isLocked
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Replace with AI Alternative */}
                    <button
                      type="button"
                      onClick={() => onReplaceActivity(day.day, activity.name)}
                      title="Replace with AI alternative"
                      className="p-1.5 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => setEditingActivity(activity)}
                      title="Edit details"
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => onRemoveActivity(day.day, activity.id)}
                      title="Remove activity"
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Activity Name & Description */}
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {activity.name}
                </h3>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activity.description}
                </p>

                {/* Reason Recommendation Tag */}
                {activity.reason && (
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      <strong className="text-slate-700">Why recommended: </strong>
                      {activity.reason}
                    </span>
                  </div>
                )}

                {/* Location & Cost Footer */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activity.location}</span>
                  </div>

                  <div className="font-semibold text-slate-900 flex items-center">
                    <IndianRupee className="w-3 h-3 text-slate-500" />
                    <span>{activity.estimated_cost > 0 ? `₹${activity.estimated_cost.toLocaleString()}` : 'Free'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meals of the Day */}
      {day.meals && day.meals.length > 0 && <MealCard meals={day.meals} />}

      {/* Modal for editing */}
      <EditActivityModal
        isOpen={!!editingActivity}
        activity={editingActivity}
        onClose={() => setEditingActivity(null)}
        onSave={(updated) => onUpdateActivity(day.day, updated)}
      />
    </div>
  );
};
