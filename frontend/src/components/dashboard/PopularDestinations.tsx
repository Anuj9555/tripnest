import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee, ArrowUpRight } from 'lucide-react';
import { Destination } from '../../types';
import { destinationService } from '../../services/api';

export const PopularDestinations: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeTag, setActiveTag] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const tags = ['All', 'Nature', 'Beaches', 'Culture', 'Adventure', 'Hills'];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await destinationService.getAll(activeTag !== 'All' ? { tag: activeTag } : undefined);
        setDestinations(data);
      } catch {
        // Fallback default destinations
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTag]);

  const handlePlan = (dest: Destination) => {
    navigate(`/create-trip?destination=${encodeURIComponent(dest.name + ', ' + dest.country)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Popular Destinations</h2>
          <p className="text-xs text-slate-500">Curated locations with optimized travel trails and authentic stays.</p>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
                activeTag === tag
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{dest.region}, {dest.country}</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white">{dest.name}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dest.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dest.popular_days} Days</span>
                </div>
                <div className="flex items-center gap-0.5 font-medium text-slate-700">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  <span>₹{dest.avg_daily_budget.toLocaleString()}/day</span>
                </div>
              </div>

              <button
                onClick={() => handlePlan(dest)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Plan Trip</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
