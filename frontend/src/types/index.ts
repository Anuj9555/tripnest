export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  name: string;
  category: string;
  location: string;
  duration_minutes: number;
  estimated_cost: number;
  description: string;
  reason: string;
  travel_time_from_previous: string;
  transport: string;
  is_locked?: boolean;
}

export interface MealItem {
  type: 'Breakfast' | 'Lunch' | 'Dinner';
  restaurant: string;
  cuisine: string;
  estimated_cost: number;
  reason: string;
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  estimated_daily_cost: number;
  activities: ActivityItem[];
  meals: MealItem[];
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface AccommodationInfo {
  name: string;
  category: string;
  estimated_price_per_night: number;
  reason: string;
}

export interface TransportationInfo {
  primary_mode: string;
  recommendation: string;
}

export interface AlternativeItem {
  activity: string;
  alternative: string;
  reason: string;
}

export interface ItineraryContent {
  trip_summary: {
    destination: string;
    title: string;
    start_date: string;
    end_date: string;
    number_of_days: number;
    traveler_type: string;
    group_size: number;
  };
  overview: {
    summary: string;
    travel_style: string;
    estimated_total_cost: number;
    currency: string;
  };
  accommodation: AccommodationInfo;
  transportation: TransportationInfo;
  days: DayPlan[];
  budget_breakdown: BudgetBreakdown;
  tips: string[];
  alternatives: AlternativeItem[];
}

export interface Trip {
  id: string;
  user_id?: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  traveler_type: string;
  group_size: number;
  budget: number;
  budget_type: string;
  travel_style: string[];
  interests: string[];
  accommodation_preference?: string;
  transport_preference?: string;
  pace?: string;
  food_preferences?: string[];
  additional_preferences?: string;
  status: 'planned' | 'draft' | 'completed';
  created_at?: string;
  updated_at?: string;
  active_itinerary?: ItineraryContent;
  is_saved?: boolean;
}

export interface TripCreateInput {
  title?: string;
  destination: string;
  start_date: string;
  end_date: string;
  traveler_type: string;
  group_size: number;
  budget: number;
  budget_type: string;
  travel_style: string[];
  interests: string[];
  accommodation_preference: string;
  transport_preference: string;
  pace: string;
  food_preferences: string[];
  additional_preferences?: string;
}

export interface Destination {
  id: string;
  name: string;
  region: string;
  country: string;
  tags: string[];
  image_url: string;
  description: string;
  popular_days: number;
  avg_daily_budget: number;
}

export interface SavedItinerary {
  id: string;
  trip_id: string;
  user_id: string;
  notes?: string;
  created_at: string;
  trip?: Trip;
}
