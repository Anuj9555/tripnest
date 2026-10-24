import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    traveler_type = Column(String(50), default="Solo") # Solo, Couple, Family, Friends, Business
    group_size = Column(Integer, default=1)
    budget = Column(Float, default=0.0)
    budget_type = Column(String(50), default="Total Trip") # Total Trip, Per Person
    travel_style = Column(JSON, default=list) # ["Budget", "Relaxed"]
    interests = Column(JSON, default=list) # ["Nature", "Food"]
    accommodation_preference = Column(String(100), default="3-Star Hotel")
    transport_preference = Column(String(100), default="Mixed")
    pace = Column(String(50), default="Balanced") # Relaxed, Balanced, Packed
    food_preferences = Column(JSON, default=list)
    additional_preferences = Column(Text, nullable=True)
    status = Column(String(50), default="planned") # draft, planned, completed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="trips")
    itineraries = relationship("Itinerary", back_populates="trip", cascade="all, delete-orphan", order_by="desc(Itinerary.version)")
    saved_by = relationship("SavedItinerary", back_populates="trip", cascade="all, delete-orphan")
