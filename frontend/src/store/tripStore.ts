import { create } from 'zustand';
import { Trip, TripCreateInput, SavedItinerary } from '../types';
import { tripService, aiService, savedService } from '../services/api';
import { useUIStore } from './uiStore';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  savedTrips: SavedItinerary[];
  isLoading: boolean;
  isGenerating: boolean;
  generationStep: string;
  selectedDay: number;
  
  fetchTrips: (status?: string, search?: string) => Promise<void>;
  fetchTripById: (id: string) => Promise<Trip | null>;
  createTripWithAI: (data: TripCreateInput) => Promise<Trip>;
  updateTrip: (id: string, data: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  duplicateTrip: (id: string) => Promise<Trip>;
  
  regenerateFullTrip: (id: string, data?: { budget?: number; budget_type?: string; travel_style?: string[]; accommodation_preference?: string; transport_preference?: string; pace?: string; additional_preferences?: string; instructions?: string }) => Promise<void>;
  regenerateDay: (dayNumber: number, instructions?: string, lockedIds?: string[]) => Promise<void>;
  replaceActivity: (dayNumber: number, activityName: string, instructions?: string) => Promise<void>;
  
  fetchSavedTrips: () => Promise<void>;
  toggleSaveTrip: (tripId: string) => Promise<void>;
  setSelectedDay: (day: number) => void;
}

const GENERATION_STEPS = [
  'Understanding your preferences...',
  'Finding suitable experiences & places...',
  'Optimizing schedule & travel routes...',
  'Calculating estimated costs & budgets...'
];

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  savedTrips: [],
  isLoading: false,
  isGenerating: false,
  generationStep: GENERATION_STEPS[0],
  selectedDay: 1,

  setSelectedDay: (day: number) => set({ selectedDay: day }),

  fetchTrips: async (status, search) => {
    set({ isLoading: true });
    try {
      const trips = await tripService.getAll({ status, search });
      set({ trips, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      useUIStore.getState().addToast(err.message || 'Failed to load trips', 'error');
    }
  },

  fetchTripById: async (id: string) => {
    set({ isLoading: true });
    try {
      const trip = await tripService.getById(id);
      set({ currentTrip: trip, isLoading: false, selectedDay: 1 });
      return trip;
    } catch (err: any) {
      set({ isLoading: false });
      useUIStore.getState().addToast(err.message || 'Failed to load trip', 'error');
      return null;
    }
  },

  createTripWithAI: async (data: TripCreateInput) => {
    set({ isGenerating: true, generationStep: GENERATION_STEPS[0] });

    // Step cycle animation simulation while awaiting API
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % GENERATION_STEPS.length;
      set({ generationStep: GENERATION_STEPS[stepIndex] });
    }, 1200);

    try {
      const newTrip = await tripService.create(data);
      clearInterval(interval);
      set((state) => ({
        trips: [newTrip, ...state.trips],
        currentTrip: newTrip,
        isGenerating: false,
        selectedDay: 1,
      }));
      useUIStore.getState().addToast('Itinerary created successfully!', 'success');
      return newTrip;
    } catch (err: any) {
      clearInterval(interval);
      set({ isGenerating: false });
      useUIStore.getState().addToast(err.message || 'Failed to generate itinerary', 'error');
      throw err;
    }
  },

  updateTrip: async (id: string, data: Partial<Trip>) => {
    set({ isLoading: true });
    try {
      const updated = await tripService.update(id, data);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? updated : t)),
        currentTrip: updated,
        isLoading: false,
      }));
      useUIStore.getState().addToast('Trip details updated successfully', 'success');
    } catch (err: any) {
      set({ isLoading: false });
      useUIStore.getState().addToast(err.message || 'Update failed', 'error');
      throw err;
    }
  },

  deleteTrip: async (id: string) => {
    try {
      await tripService.delete(id);
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== id),
        currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
      }));
      useUIStore.getState().addToast('Trip deleted', 'info');
    } catch (err: any) {
      useUIStore.getState().addToast(err.message || 'Delete failed', 'error');
      throw err;
    }
  },

  duplicateTrip: async (id: string) => {
    try {
      const cloned = await tripService.duplicate(id);
      set((state) => ({
        trips: [cloned, ...state.trips],
      }));
      useUIStore.getState().addToast('Trip duplicated successfully', 'success');
      return cloned;
    } catch (err: any) {
      useUIStore.getState().addToast(err.message || 'Duplication failed', 'error');
      throw err;
    }
  },

  regenerateFullTrip: async (id: string, data?: { budget?: number; budget_type?: string; travel_style?: string[]; accommodation_preference?: string; transport_preference?: string; pace?: string; additional_preferences?: string; instructions?: string }) => {
    set({ isGenerating: true, generationStep: 'Regenerating complete itinerary...' });
    try {
      const regenerated = await aiService.regenerateTrip(id, data);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? regenerated : t)),
        currentTrip: regenerated,
        isGenerating: false,
      }));
      useUIStore.getState().addToast('Full itinerary regenerated with new budget!', 'success');
    } catch (err: any) {
      set({ isGenerating: false });
      useUIStore.getState().addToast(err.message || 'Regeneration failed', 'error');
      throw err;
    }
  },

  regenerateDay: async (dayNumber: number, instructions?: string, lockedIds?: string[]) => {
    const trip = get().currentTrip;
    if (!trip) return;
    set({ isLoading: true });
    try {
      const updated = await aiService.regenerateDay({
        trip_id: trip.id,
        day_number: dayNumber,
        instructions,
        locked_activity_ids: lockedIds,
      });
      set((state) => ({
        currentTrip: updated,
        trips: state.trips.map((t) => (t.id === trip.id ? updated : t)),
        isLoading: false,
      }));
      useUIStore.getState().addToast(`Day ${dayNumber} successfully regenerated!`, 'success');
    } catch (err: any) {
      set({ isLoading: false });
      useUIStore.getState().addToast(err.message || 'Day regeneration failed', 'error');
    }
  },

  replaceActivity: async (dayNumber: number, activityName: string, instructions?: string) => {
    const trip = get().currentTrip;
    if (!trip) return;
    set({ isLoading: true });
    try {
      const updated = await aiService.replaceActivity({
        trip_id: trip.id,
        day_number: dayNumber,
        activity_name: activityName,
        instructions,
      });
      set((state) => ({
        currentTrip: updated,
        trips: state.trips.map((t) => (t.id === trip.id ? updated : t)),
        isLoading: false,
      }));
      useUIStore.getState().addToast(`Activity replaced with alternative`, 'success');
    } catch (err: any) {
      set({ isLoading: false });
      useUIStore.getState().addToast(err.message || 'Activity replacement failed', 'error');
    }
  },

  fetchSavedTrips: async () => {
    try {
      const saved = await savedService.getAll();
      set({ savedTrips: saved });
    } catch (err: any) {
      useUIStore.getState().addToast(err.message || 'Could not fetch saved trips', 'error');
    }
  },

  toggleSaveTrip: async (tripId: string) => {
    const trip = get().currentTrip;
    const isCurrentlySaved = trip?.is_saved || get().savedTrips.some((s) => s.trip_id === tripId);
    
    try {
      if (isCurrentlySaved) {
        await savedService.remove(tripId);
        set((state) => ({
          savedTrips: state.savedTrips.filter((s) => s.trip_id !== tripId),
          currentTrip: state.currentTrip?.id === tripId ? { ...state.currentTrip, is_saved: false } : state.currentTrip,
          trips: state.trips.map((t) => (t.id === tripId ? { ...t, is_saved: false } : t)),
        }));
        useUIStore.getState().addToast('Removed from saved itineraries', 'info');
      } else {
        const saved = await savedService.save(tripId);
        set((state) => ({
          savedTrips: [saved, ...state.savedTrips],
          currentTrip: state.currentTrip?.id === tripId ? { ...state.currentTrip, is_saved: true } : state.currentTrip,
          trips: state.trips.map((t) => (t.id === tripId ? { ...t, is_saved: true } : t)),
        }));
        useUIStore.getState().addToast('Saved to your saved itineraries', 'success');
      }
    } catch (err: any) {
      useUIStore.getState().addToast(err.message || 'Save operation failed', 'error');
    }
  },
}));
