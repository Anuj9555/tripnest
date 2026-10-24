from typing import List, Optional
from pydantic import BaseModel, Field

class TripSummarySchema(BaseModel):
    destination: str
    title: str
    start_date: str
    end_date: str
    number_of_days: int
    traveler_type: str
    group_size: int

class OverviewSchema(BaseModel):
    summary: str
    travel_style: str
    estimated_total_cost: float
    currency: str = "INR"

class AccommodationSchema(BaseModel):
    name: str
    category: str
    estimated_price_per_night: float
    reason: str

class TransportationSchema(BaseModel):
    primary_mode: str
    recommendation: str

class ActivityItemSchema(BaseModel):
    id: Optional[str] = None
    time: str # e.g. "09:00 AM" or "Morning"
    name: str
    category: str # "Culture", "Sightseeing", "Food", "Adventure", "Nature", "Relaxation"
    location: str
    duration_minutes: int
    estimated_cost: float
    description: str
    reason: str
    travel_time_from_previous: str
    transport: str
    is_locked: Optional[bool] = False

class MealItemSchema(BaseModel):
    type: str # "Breakfast" | "Lunch" | "Dinner"
    restaurant: str
    cuisine: str
    estimated_cost: float
    reason: str

class DayPlanSchema(BaseModel):
    day: int
    date: str
    title: str
    estimated_daily_cost: float
    activities: List[ActivityItemSchema]
    meals: List[MealItemSchema]

class BudgetBreakdownSchema(BaseModel):
    accommodation: float
    food: float
    transportation: float
    activities: float
    miscellaneous: float
    total: float

class AlternativeItemSchema(BaseModel):
    activity: str
    alternative: str
    reason: str

class ItineraryOutputSchema(BaseModel):
    trip_summary: TripSummarySchema
    overview: OverviewSchema
    accommodation: AccommodationSchema
    transportation: TransportationSchema
    days: List[DayPlanSchema]
    budget_breakdown: BudgetBreakdownSchema
    tips: List[str]
    alternatives: List[AlternativeItemSchema]

class RegenerateDayRequest(BaseModel):
    trip_id: str
    day_number: int
    instructions: Optional[str] = None
    locked_activity_ids: Optional[List[str]] = None

class ReplaceActivityRequest(BaseModel):
    trip_id: str
    day_number: int
    activity_name: str
    instructions: Optional[str] = None
