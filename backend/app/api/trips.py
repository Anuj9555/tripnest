from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.itinerary import Itinerary
from app.models.saved import SavedItinerary
from app.schemas.trip import TripCreate, TripUpdate, TripResponse
from app.api.auth import get_current_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/trips", tags=["Trips"])

def parse_date(date_str: str) -> date:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        return datetime.now().date()

@router.get("", response_model=List[TripResponse])
def get_trips(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Trip).filter(Trip.user_id == current_user.id)
    if status_filter:
        query = query.filter(Trip.status == status_filter)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter((Trip.title.ilike(search_fmt)) | (Trip.destination.ilike(search_fmt)))
    
    trips = query.order_by(Trip.created_at.desc()).all()
    
    # Enrich with active itinerary and saved state
    results = []
    saved_trip_ids = {s.trip_id for s in db.query(SavedItinerary).filter(SavedItinerary.user_id == current_user.id).all()}
    
    for trip in trips:
        active_itin = next((i for i in trip.itineraries if i.is_active), None)
        trip_resp = TripResponse.model_validate(trip)
        trip_resp.active_itinerary = active_itin.content if active_itin else None
        trip_resp.is_saved = trip.id in saved_trip_ids
        results.append(trip_resp)
        
    return results

@router.post("", response_model=TripResponse)
async def create_trip(
    trip_in: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate dates
    s_date = parse_date(trip_in.start_date)
    e_date = parse_date(trip_in.end_date)
    if s_date > e_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be after end date"
        )
    
    title = trip_in.title or f"{trip_in.destination} Getaway"
    
    new_trip = Trip(
        user_id=current_user.id,
        title=title,
        destination=trip_in.destination,
        start_date=s_date,
        end_date=e_date,
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
        additional_preferences=trip_in.additional_preferences,
        status="planned"
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    
    # Generate structured AI itinerary
    ai_itinerary = await AIService.generate_itinerary(
        destination=new_trip.destination,
        start_date=str(new_trip.start_date),
        end_date=str(new_trip.end_date),
        traveler_type=new_trip.traveler_type,
        group_size=new_trip.group_size,
        budget=new_trip.budget,
        budget_type=new_trip.budget_type,
        travel_style=new_trip.travel_style or [],
        interests=new_trip.interests or [],
        accommodation_preference=new_trip.accommodation_preference or "3-Star Hotel",
        transport_preference=new_trip.transport_preference or "Mixed",
        pace=new_trip.pace or "Balanced",
        food_preferences=new_trip.food_preferences or [],
        additional_preferences=new_trip.additional_preferences
    )
    
    itinerary_record = Itinerary(
        trip_id=new_trip.id,
        version=1,
        content=ai_itinerary.model_dump(),
        estimated_cost=ai_itinerary.overview.estimated_total_cost,
        is_active=True
    )
    db.add(itinerary_record)
    db.commit()
    db.refresh(new_trip)
    
    resp = TripResponse.model_validate(new_trip)
    resp.active_itinerary = itinerary_record.content
    resp.is_saved = False
    return resp

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
        
    active_itin = next((i for i in trip.itineraries if i.is_active), None)
    is_saved = db.query(SavedItinerary).filter(SavedItinerary.trip_id == trip.id, SavedItinerary.user_id == current_user.id).first() is not None
    
    resp = TripResponse.model_validate(trip)
    resp.active_itinerary = active_itin.content if active_itin else None
    resp.is_saved = is_saved
    return resp

@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    trip_update: TripUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
        
    update_data = trip_update.model_dump(exclude_unset=True)
    if "start_date" in update_data and update_data["start_date"]:
        update_data["start_date"] = parse_date(update_data["start_date"])
    if "end_date" in update_data and update_data["end_date"]:
        update_data["end_date"] = parse_date(update_data["end_date"])
        
    for k, v in update_data.items():
        setattr(trip, k, v)
        
    budget_changed = "budget" in update_data and update_data["budget"] is not None
    dates_changed = "start_date" in update_data or "end_date" in update_data

    # If budget or dates changed, automatically regenerate the active itinerary to reflect the new budget
    if budget_changed or dates_changed:
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
        # Deactivate previous
        for itin in trip.itineraries:
            itin.is_active = False

        max_version = max([i.version for i in trip.itineraries], default=0)
        new_itin_record = Itinerary(
            trip_id=trip.id,
            version=max_version + 1,
            content=new_ai_itinerary.model_dump(),
            estimated_cost=new_ai_itinerary.overview.estimated_total_cost,
            is_active=True
        )
        db.add(new_itin_record)
        db.commit()
        db.refresh(trip)
        active_itin = new_itin_record
    else:
        db.commit()
        db.refresh(trip)
        active_itin = next((i for i in trip.itineraries if i.is_active), None)

    is_saved = db.query(SavedItinerary).filter(SavedItinerary.trip_id == trip.id, SavedItinerary.user_id == current_user.id).first() is not None
    
    resp = TripResponse.model_validate(trip)
    resp.active_itinerary = active_itin.content if active_itin else None
    resp.is_saved = is_saved
    return resp

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully", "id": trip_id}

@router.post("/{trip_id}/duplicate", response_model=TripResponse)
def duplicate_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
        
    new_trip = Trip(
        user_id=current_user.id,
        title=f"Copy of {trip.title}",
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        traveler_type=trip.traveler_type,
        group_size=trip.group_size,
        budget=trip.budget,
        budget_type=trip.budget_type,
        travel_style=trip.travel_style,
        interests=trip.interests,
        accommodation_preference=trip.accommodation_preference,
        transport_preference=trip.transport_preference,
        pace=trip.pace,
        food_preferences=trip.food_preferences,
        additional_preferences=trip.additional_preferences,
        status="planned"
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    
    active_itin = next((i for i in trip.itineraries if i.is_active), None)
    if active_itin:
        cloned_itin = Itinerary(
            trip_id=new_trip.id,
            version=1,
            content=active_itin.content,
            estimated_cost=active_itin.estimated_cost,
            is_active=True
        )
        db.add(cloned_itin)
        db.commit()
        
    resp = TripResponse.model_validate(new_trip)
    resp.active_itinerary = active_itin.content if active_itin else None
    return resp
