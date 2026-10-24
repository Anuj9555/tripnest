import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('tripnest_token'),
  isLoading: true,
  isAuthenticated: !!localStorage.getItem('tripnest_token'),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('tripnest_token', data.access_token);
      set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const data = await authService.register({ email, password, name });
      localStorage.setItem('tripnest_token', data.access_token);
      set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  demoLogin: async () => {
    set({ isLoading: true });
    try {
      const data = await authService.demoLogin();
      localStorage.setItem('tripnest_token', data.access_token);
      set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('tripnest_token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initAuth: async () => {
    const token = localStorage.getItem('tripnest_token');
    if (!token) {
      // Auto-load demo user for friction-free exploration if no token
      try {
        const data = await authService.demoLogin();
        localStorage.setItem('tripnest_token', data.access_token);
        set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
        return;
      } catch (err) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }
    }
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('tripnest_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
