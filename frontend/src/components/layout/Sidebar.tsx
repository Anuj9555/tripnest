import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Home,
  PlusCircle,
  Briefcase,
  Bookmark,
  User,
  Settings,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const { trips, savedTrips } = useTripStore();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', route: '/dashboard', icon: Home },
    { label: 'Create Trip', route: '/create-trip', icon: PlusCircle, highlight: true },
    { label: 'My Trips', route: '/my-trips', icon: Briefcase, badge: trips.length },
    { label: 'Saved Itineraries', route: '/saved-itineraries', icon: Bookmark, badge: savedTrips.length },
    { label: 'Profile', route: '/profile', icon: User },
    { label: 'Settings', route: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#102A43' }}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/60">
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  TripNest
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    AI
                  </span>
                </span>
              </div>
            </NavLink>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick AI Planner CTA */}
          <div className="px-4 pt-5 pb-2">
            <NavLink
              to="/create-trip"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan New Trip</span>
            </NavLink>
          </div>

          {/* Nav Links */}
          <nav className="px-3 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.route}
                to={item.route}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-white border-l-3 border-blue-500 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-700/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
            <div className="flex items-center gap-3 truncate">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-slate-600"
              />
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {user?.name || 'Traveler'}
                </p>
                <p className="text-xs text-slate-400 truncate leading-tight mt-0.5">
                  {user?.email || 'traveler@tripnest.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
