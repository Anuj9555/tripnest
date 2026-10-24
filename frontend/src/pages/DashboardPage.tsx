import React, { useEffect } from 'react';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { QuickTripBuilder } from '../components/dashboard/QuickTripBuilder';
import { PopularDestinations } from '../components/dashboard/PopularDestinations';
import { RecentTripsSection } from '../components/dashboard/RecentTripsSection';
import { FeaturedItineraryCard } from '../components/dashboard/FeaturedItineraryCard';
import { WhyChooseSection } from '../components/dashboard/WhyChooseSection';
import { useTripStore } from '../store/tripStore';

export const DashboardPage: React.FC = () => {
  const { trips, fetchTrips, isLoading } = useTripStore();

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const featuredTrip = trips.find((t) => t.title.toLowerCase().includes('bali')) || trips[0] || null;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <HeroBanner />

      {/* Quick Trip Builder */}
      <QuickTripBuilder />

      {/* Popular Destinations Showcase */}
      <PopularDestinations />

      {/* User's Recent Trips */}
      <RecentTripsSection trips={trips} />

      {/* Featured Itinerary Preview */}
      <FeaturedItineraryCard trip={featuredTrip} />

      {/* Why Choose TripNest */}
      <WhyChooseSection />
    </div>
  );
};
