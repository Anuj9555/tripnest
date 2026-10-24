import axios from 'axios';
import {
  Trip,
  TripCreateInput,
  ItineraryContent,
  Destination,
  SavedItinerary,
  User
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tripnest_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    const res = await apiClient.post<{ access_token: string; user: User }>('/auth/register', data);
    return res.data;
  },
  async login(data: { email: string; password: string }) {
    const res = await apiClient.post<{ access_token: string; user: User }>('/auth/login', data);
    return res.data;
  },
  async demoLogin() {
    const res = await apiClient.post<{ access_token: string; user: User }>('/auth/demo');
    return res.data;
  },
  async getMe() {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

export const tripService = {
  async getAll(params?: { status?: string; search?: string }) {
    const res = await apiClient.get<Trip[]>('/trips', { params });
    return res.data;
  },
  async getById(id: string) {
    const res = await apiClient.get<Trip>(`/trips/${id}`);
    return res.data;
  },
  async create(data: TripCreateInput) {
    const res = await apiClient.post<Trip>('/trips', data);
    return res.data;
  },
  async update(id: string, data: Partial<Trip>) {
    const res = await apiClient.put<Trip>(`/trips/${id}`, data);
    return res.data;
  },
  async delete(id: string) {
    const res = await apiClient.delete(`/trips/${id}`);
    return res.data;
  },
  async duplicate(id: string) {
    const res = await apiClient.post<Trip>(`/trips/${id}/duplicate`);
    return res.data;
  },
};

export const aiService = {
  async generatePreview(data: TripCreateInput) {
    const res = await apiClient.post<ItineraryContent>('/ai/generate-itinerary', data);
    return res.data;
  },
  async regenerateTrip(tripId: string, data?: { budget?: number; budget_type?: string; travel_style?: string[]; accommodation_preference?: string; transport_preference?: string; pace?: string; additional_preferences?: string; instructions?: string }) {
    const res = await apiClient.post<Trip>(`/ai/regenerate-itinerary/${tripId}`, data || {});
    return res.data;
  },
  async regenerateDay(data: { trip_id: string; day_number: number; instructions?: string; locked_activity_ids?: string[] }) {
    const res = await apiClient.post<Trip>('/ai/regenerate-day', data);
    return res.data;
  },
  async replaceActivity(data: { trip_id: string; day_number: number; activity_name: string; instructions?: string }) {
    const res = await apiClient.post<Trip>('/ai/replace-activity', data);
    return res.data;
  },
};

export const savedService = {
  async getAll() {
    const res = await apiClient.get<SavedItinerary[]>('/saved-itineraries');
    return res.data;
  },
  async save(tripId: string, notes?: string) {
    const res = await apiClient.post<SavedItinerary>('/saved-itineraries', { trip_id: tripId, notes });
    return res.data;
  },
  async remove(tripId: string) {
    const res = await apiClient.delete(`/saved-itineraries/${tripId}`);
    return res.data;
  },
};

export const destinationService = {
  async getAll(params?: { search?: string; tag?: string }) {
    const res = await apiClient.get<Destination[]>('/destinations', { params });
    return res.data;
  },
};
