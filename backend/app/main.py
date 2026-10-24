import os
from datetime import datetime, timedelta, timezone, date
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.models.user import User
from app.models.trip import Trip
from app.models.itinerary import Itinerary
from app.models.saved import SavedItinerary
from app.core.security import get_password_hash
from app.utils.mock_planner import generate_dynamic_fallback_itinerary

from app.api.auth import router as auth_router
from app.api.trips import router as trips_router
from app.api.ai import router as ai_router
from app.api.saved import router as saved_router
from app.api.destinations import router as destinations_router
from app.api.health import router as health_router
from app.api.settings import router as settings_router

def seed_demo_data():
    """Initializes tables and seeds default demo user and initial Bali trip"""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "traveler@tripnest.com").first()
        if not demo_user:
            demo_user = User(
                email="traveler@tripnest.com",
                name="Alex Turner",
                hashed_password=get_password_hash("DemoPass123!"),
                avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        # Check if user has trips, if not seed sample Bali trip
        trip_count = db.query(Trip).filter(Trip.user_id == demo_user.id).count()
        if trip_count == 0:
            today = date.today()
            start_d = today + timedelta(days=14)
            end_d = start_d + timedelta(days=4) # 5 days

            bali_trip = Trip(
                user_id=demo_user.id,
                title="Bali Escape",
                destination="Bali, Indonesia",
                start_date=start_d,
                end_date=end_d,
                traveler_type="Couple",
                group_size=2,
                budget=75000.0,
                budget_type="Total Trip",
                travel_style=["Relaxed", "Comfort"],
                interests=["Nature", "Culture", "Food"],
                accommodation_preference="Resort",
                transport_preference="Private Driver / Taxi",
                pace="Relaxed",
                food_preferences=["Local Cuisine", "Fine Dining"],
                additional_preferences="Focus on scenic sunset viewpoints and uncrowded beach spots.",
                status="planned"
            )
            db.add(bali_trip)
            db.commit()
            db.refresh(bali_trip)

            # Generate itinerary for Bali trip
            itin_data = generate_dynamic_fallback_itinerary(
                destination="Bali, Indonesia",
                start_date_str=str(start_d),
                end_date_str=str(end_d),
                traveler_type="Couple",
                group_size=2,
                budget=75000.0,
                budget_type="Total Trip",
                travel_style=["Relaxed", "Comfort"],
                interests=["Nature", "Culture", "Food"],
                accommodation_preference="Resort",
                transport_preference="Private Driver / Taxi",
                pace="Relaxed",
                food_preferences=["Local Cuisine", "Fine Dining"],
                additional_preferences="Focus on scenic sunset viewpoints and uncrowded beach spots."
            )

            itin_record = Itinerary(
                trip_id=bali_trip.id,
                version=1,
                content=itin_data.model_dump(),
                estimated_cost=itin_data.overview.estimated_total_cost,
                is_active=True
            )
            db.add(itin_record)

            # Add to saved
            saved_rec = SavedItinerary(
                user_id=demo_user.id,
                trip_id=bali_trip.id,
                notes="Book villa in Ubud and Jimbaran sunset dinner ahead of time."
            )
            db.add(saved_rec)
            db.commit()
            print("Successfully seeded demo user and sample Bali Escape trip!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_demo_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-Stack AI-Powered Travel Itinerary Planner Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for seamless local dev & cross-origin testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(trips_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(saved_router, prefix=settings.API_V1_STR)
app.include_router(destinations_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for production frontend build (React SPA)
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist) and os.path.exists(os.path.join(frontend_dist, "index.html")):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(frontend_dist, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "TripNest API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": f"{settings.API_V1_STR}/health"
        }

