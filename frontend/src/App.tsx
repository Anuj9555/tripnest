import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { SaaSLayout } from './components/layout/SaaSLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { SavedItinerariesPage } from './pages/SavedItinerariesPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { TripEditPage } from './pages/TripEditPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuthStore } from './store/authStore';

export const App: React.FC = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* SaaS Dashboard Layout Shell */}
          <Route element={<SaaSLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-trip" element={<CreateTripPage />} />
            <Route path="/my-trips" element={<MyTripsPage />} />
            <Route path="/saved-itineraries" element={<SavedItinerariesPage />} />
            <Route path="/trip/:id" element={<TripDetailPage />} />
            <Route path="/trip/:id/edit" element={<TripEditPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
    </>
  );
};

export default App;
