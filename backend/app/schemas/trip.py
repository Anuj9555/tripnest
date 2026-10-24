from typing import List, Optional, Any
from datetime import date, datetime
from pydantic import BaseModel, Field
from app.schemas.itinerary import ItineraryOutputSchema

class TripCreate(BaseModel):
    destination: str
    start_date: str # YYYY-MM-DD
    end_date: str   # YYYY-MM-DD
    traveler_type: str = "Solo" # Solo, Couple, Family, Friends, Business
    group_size: int = Field(default=1, ge=1)
    budget: float = Field(default=25000.0, gt=0)
    budget_type: str = "Total Trip" # Total Trip | Per Person
    travel_style: List[str] = ["Balanced"]
    interests: List[str] = ["Culture", "Nature"]
    accommodation_preference: str = "3-Star Hotel"
    transport_preference: str = "Mixed"
    pace: str = "Balanced" # Relaxed, Balanced, Packed
    food_preferences: List[str] = ["Local Cuisine"]
    additional_preferences: Optional[str] = None
    title: Optional[str] = None

class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    traveler_type: Optional[str] = None
    group_size: Optional[int] = None
    budget: Optional[float] = None
    budget_type: Optional[str] = None
    travel_style: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    accommodation_preference: Optional[str] = None
    transport_preference: Optional[str] = None
    pace: Optional[str] = None
    food_preferences: Optional[List[str]] = None
    additional_preferences: Optional[str] = None
    status: Optional[str] = None

class TripResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    destination: str
    start_date: date
    end_date: date
    traveler_type: str
    group_size: int
    budget: float
    budget_type: str
    travel_style: List[str]
    interests: List[str]
    accommodation_preference: Optional[str] = None
    transport_preference: Optional[str] = None
    pace: Optional[str] = None
    food_preferences: Optional[List[str]] = None
    additional_preferences: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    active_itinerary: Optional[Any] = None
    is_saved: Optional[bool] = False

    class Config:
        from_attributes = True

class SavedItineraryCreate(BaseModel):
    trip_id: str
    notes: Optional[str] = None

class SavedItineraryResponse(BaseModel):
    id: str
    trip_id: str
    user_id: str
    notes: Optional[str] = None
    created_at: datetime
    trip: Optional[TripResponse] = None

    class Config:
        from_attributes = True
