from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.saved import SavedItinerary
from app.schemas.trip import SavedItineraryCreate, SavedItineraryResponse, TripResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/saved-itineraries", tags=["Saved Itineraries"])

@router.get("", response_model=List[SavedItineraryResponse])
def get_saved_itineraries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_records = db.query(SavedItinerary).filter(SavedItinerary.user_id == current_user.id).order_by(SavedItinerary.created_at.desc()).all()
    
    results = []
    for item in saved_records:
        trip = item.trip
        trip_resp = None
        if trip:
            active_itin = next((i for i in trip.itineraries if i.is_active), None)
            trip_resp = TripResponse.model_validate(trip)
            trip_resp.active_itinerary = active_itin.content if active_itin else None
            trip_resp.is_saved = True
            
        results.append(SavedItineraryResponse(
            id=item.id,
            trip_id=item.trip_id,
            user_id=item.user_id,
            notes=item.notes,
            created_at=item.created_at,
            trip=trip_resp
        ))
    return results

@router.post("", response_model=SavedItineraryResponse)
def save_itinerary(
    item_in: SavedItineraryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == item_in.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    existing = db.query(SavedItinerary).filter(
        SavedItinerary.user_id == current_user.id,
        SavedItinerary.trip_id == item_in.trip_id
    ).first()

    if existing:
        return SavedItineraryResponse(
            id=existing.id,
            trip_id=existing.trip_id,
            user_id=existing.user_id,
            notes=existing.notes,
            created_at=existing.created_at,
            trip=TripResponse.model_validate(trip)
        )

    saved = SavedItinerary(
        user_id=current_user.id,
        trip_id=item_in.trip_id,
        notes=item_in.notes
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)

    active_itin = next((i for i in trip.itineraries if i.is_active), None)
    trip_resp = TripResponse.model_validate(trip)
    trip_resp.active_itinerary = active_itin.content if active_itin else None
    trip_resp.is_saved = True

    return SavedItineraryResponse(
        id=saved.id,
        trip_id=saved.trip_id,
        user_id=saved.user_id,
        notes=saved.notes,
        created_at=saved.created_at,
        trip=trip_resp
    )

@router.delete("/{trip_id}")
def delete_saved_itinerary(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedItinerary).filter(
        SavedItinerary.user_id == current_user.id,
        SavedItinerary.trip_id == trip_id
    ).first()
    
    if not saved:
        # Also check if passed ID was the saved_itinerary id directly
        saved = db.query(SavedItinerary).filter(
            SavedItinerary.user_id == current_user.id,
            SavedItinerary.id == trip_id
        ).first()

    if not saved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved itinerary not found")

    db.delete(saved)
    db.commit()
    return {"message": "Saved itinerary removed successfully", "trip_id": trip_id}
