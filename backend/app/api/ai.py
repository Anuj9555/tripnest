from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.itinerary import Itinerary
from app.schemas.trip import TripCreate, TripResponse
from app.schemas.itinerary import ItineraryOutputSchema, RegenerateDayRequest, ReplaceActivityRequest
from app.api.auth import get_current_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Itinerary Engine"])

@router.post("/generate-itinerary", response_model=ItineraryOutputSchema)
async def generate_itinerary_preview(
    trip_in: TripCreate,
    current_user: User = Depends(get_current_user)
):
    """Generates an itinerary preview directly from user parameters"""
    return await AIService.generate_itinerary(
        destination=trip_in.destination,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        traveler_type=trip_in.traveler_type,
        group_size=trip_in.group_size,
        budget=trip_in.budget,
        budget_type=trip_in.budget_type,
        travel_style=trip_in.travel_style,
        interests=trip_in.interests,
        accommodation_preference=trip_in.accommodation_preference,
        transport_preference=trip_in.transport_preference,
        pace=trip_in.pace,
        food_preferences=trip_in.food_preferences,
        additional_preferences=trip_in.additional_preferences
    )

class FullTripRegenerateRequest(BaseModel):
    budget: Optional[float] = None
    budget_type: Optional[str] = None
    travel_style: Optional[List[str]] = None
    accommodation_preference: Optional[str] = None
    transport_preference: Optional[str] = None
    pace: Optional[str] = None
    additional_preferences: Optional[str] = None
    instructions: Optional[str] = None

@router.post("/regenerate-itinerary/{trip_id}", response_model=TripResponse)
async def regenerate_itinerary(
    trip_id: str,
    req: Optional[FullTripRegenerateRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerates the complete itinerary for an existing trip, incrementing version and applying any new budget"""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    # If new budget or preferences provided in request, update the trip record
    if req:
        if req.budget is not None and req.budget > 0:
            trip.budget = req.budget
        if req.budget_type:
            trip.budget_type = req.budget_type
        if req.travel_style:
            trip.travel_style = req.travel_style
        if req.accommodation_preference:
            trip.accommodation_preference = req.accommodation_preference
        if req.transport_preference:
            trip.transport_preference = req.transport_preference
        if req.pace:
            trip.pace = req.pace
        if req.additional_preferences:
            trip.additional_preferences = req.additional_preferences

    # Auto calibrate accommodation preference if not explicitly set
    per_person = trip.budget / max(1, trip.group_size)
    if per_person < 15000 and "5-Star" in (trip.accommodation_preference or ""):
        trip.accommodation_preference = "Hostel"
    elif per_person > 60000 and "Hostel" in (trip.accommodation_preference or ""):
        trip.accommodation_preference = "5-Star Hotel"

    new_ai_itinerary = await AIService.generate_itinerary(
        destination=trip.destination,
        start_date=str(trip.start_date),
        end_date=str(trip.end_date),
        traveler_type=trip.traveler_type,
        group_size=trip.group_size,
        budget=trip.budget,
        budget_type=trip.budget_type,
        travel_style=trip.travel_style or [],
        interests=trip.interests or [],
        accommodation_preference=trip.accommodation_preference or "3-Star Hotel",
        transport_preference=trip.transport_preference or "Mixed",
        pace=trip.pace or "Balanced",
        food_preferences=trip.food_preferences or [],
        additional_preferences=trip.additional_preferences
    )

    # Deactivate previous itineraries
    for itin in trip.itineraries:
        itin.is_active = False

    max_version = max([i.version for i in trip.itineraries], default=0)
    new_version_record = Itinerary(
        trip_id=trip.id,
        version=max_version + 1,
        content=new_ai_itinerary.model_dump(),
        estimated_cost=new_ai_itinerary.overview.estimated_total_cost,
        is_active=True
    )
    db.add(new_version_record)
    db.commit()
    db.refresh(trip)

    resp = TripResponse.model_validate(trip)
    resp.active_itinerary = new_version_record.content
    return resp

@router.post("/regenerate-day", response_model=TripResponse)
def regenerate_single_day(
    req: RegenerateDayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerates a specific day while keeping locked activities intact"""
    trip = db.query(Trip).filter(Trip.id == req.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    active_itin = next((i for i in trip.itineraries if i.is_active), None)
    if not active_itin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active itinerary found")

    updated_content = AIService.regenerate_day(
        current_itinerary=dict(active_itin.content),
        day_number=req.day_number,
        instructions=req.instructions,
        locked_activity_ids=req.locked_activity_ids
    )

    active_itin.content = updated_content
    active_itin.estimated_cost = updated_content.get("overview", {}).get("estimated_total_cost", active_itin.estimated_cost)
    db.commit()
    db.refresh(trip)

    resp = TripResponse.model_validate(trip)
    resp.active_itinerary = updated_content
    return resp

@router.post("/replace-activity", response_model=TripResponse)
def replace_activity(
    req: ReplaceActivityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Replaces a single activity on a given day with an alternative"""
    trip = db.query(Trip).filter(Trip.id == req.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    active_itin = next((i for i in trip.itineraries if i.is_active), None)
    if not active_itin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active itinerary found")

    updated_content = AIService.replace_activity(
        current_itinerary=dict(active_itin.content),
        day_number=req.day_number,
        activity_name=req.activity_name,
        instructions=req.instructions
    )

    active_itin.content = updated_content
    db.commit()
    db.refresh(trip)

    resp = TripResponse.model_validate(trip)
    resp.active_itinerary = updated_content
    return resp
