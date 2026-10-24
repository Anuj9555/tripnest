-- TripNest Supabase PostgreSQL Database Schema
-- Provides full compatibility with Supabase Auth, PostgreSQL RLS, and JSONB storage

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Linked to Supabase Auth or standalone)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    traveler_type TEXT NOT NULL DEFAULT 'Solo', -- Solo, Couple, Family, Friends, Business
    group_size INTEGER NOT NULL DEFAULT 1,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    budget_type TEXT NOT NULL DEFAULT 'Total Trip', -- Total Trip | Per Person
    travel_style JSONB DEFAULT '[]'::jsonb, -- e.g. ["Budget", "Relaxed"]
    interests JSONB DEFAULT '[]'::jsonb, -- e.g. ["Nature", "Food"]
    accommodation_preference TEXT DEFAULT '3-Star Hotel',
    transport_preference TEXT DEFAULT 'Mixed',
    pace TEXT DEFAULT 'Balanced',
    food_preferences JSONB DEFAULT '["Local Cuisine"]'::jsonb,
    additional_preferences TEXT,
    status TEXT NOT NULL DEFAULT 'planned', -- draft, planned, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ITINERARIES TABLE (Stores versioned structured AI itineraries)
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    content JSONB NOT NULL,
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SAVED ITINERARIES (Bookmarks & Favorites)
CREATE TABLE IF NOT EXISTS public.saved_itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, trip_id)
);

-- 5. ACTIVITIES TABLE (Individual activities with lock state for editing)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT,
    start_time TEXT,
    duration INTEGER NOT NULL DEFAULT 60, -- minutes
    estimated_cost NUMERIC(10, 2) DEFAULT 0.0,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for high query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_trip_id ON public.itineraries(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_user_id ON public.saved_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_itinerary_day ON public.activities(itinerary_id, day_number);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Trips Policies
CREATE POLICY "Users can view their own trips" 
    ON public.trips FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own trips" 
    ON public.trips FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own trips" 
    ON public.trips FOR UPDATE 
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own trips" 
    ON public.trips FOR DELETE 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Itineraries Policies
CREATE POLICY "Users can manage itineraries for their trips" 
    ON public.itineraries FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.trips 
            WHERE public.trips.id = public.itineraries.trip_id 
            AND (public.trips.user_id = auth.uid() OR public.trips.user_id IS NULL)
        )
    );

-- Saved Itineraries Policies
CREATE POLICY "Users can manage their saved itineraries" 
    ON public.saved_itineraries FOR ALL 
    USING (auth.uid() = user_id OR user_id IS NULL);
