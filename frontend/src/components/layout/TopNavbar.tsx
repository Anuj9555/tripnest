import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  MapPin,
  ChevronDown,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const quickDestinations = [
    { name: 'Goa', tag: 'Beaches & Food' },
    { name: 'Manali', tag: 'Hills & Adventure' },
    { name: 'Jaipur', tag: 'Culture & Palaces' },
    { name: 'Bali', tag: 'Tropical Serenity' },
    { name: 'Darjeeling', tag: 'Tea Gardens & Peaks' },
  ];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDestination = (dest: string) => {
    setSearchQuery(dest);
    setIsSearchFocused(false);
    navigate(`/create-trip?destination=${encodeURIComponent(dest)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/create-trip?destination=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Destination Search */}
        <div ref={searchRef} className="relative w-full">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Where do you want to explore? (e.g. Goa, Manali, Bali...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Trending Destinations
              </div>
              <div className="space-y-0.5">
                {quickDestinations.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => handleSelectDestination(d.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-50 transition-colors text-sm group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span className="font-medium text-slate-800">{d.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{d.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Plan Button (desktop) */}
        <button
          onClick={() => navigate('/create-trip')}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Plan</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] text-blue-600 cursor-pointer">Mark all read</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="text-xs p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                  <p className="font-semibold text-blue-900">Itinerary Optimizer Ready</p>
                  <p className="text-blue-700 mt-0.5">Your Bali Escape day 3 route was updated.</p>
                </div>
                <div className="text-xs p-2 rounded-lg hover:bg-slate-50">
                  <p className="font-semibold text-slate-800">Best Flight Alert</p>
                  <p className="text-slate-500 mt-0.5">Great fare deals detected for Goa next month.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <span className="hidden sm:inline text-sm font-semibold text-slate-800">
              {user?.name?.split(' ')[0] || 'Alex'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Alex Turner'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'traveler@tripnest.com'}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Profile & Preferences</span>
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
