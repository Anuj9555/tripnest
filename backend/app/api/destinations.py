from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/destinations", tags=["Destinations"])

class DestinationItem(BaseModel):
    id: str
    name: str
    region: str
    country: str
    tags: List[str]
    image_url: str
    description: str
    popular_days: int
    avg_daily_budget: float

POPULAR_DESTINATIONS: List[DestinationItem] = [
    DestinationItem(
        id="manali",
        name="Manali",
        region="Himachal Pradesh",
        country="India",
        tags=["Nature", "Adventure", "Hills"],
        image_url="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
        description="Snow-capped alpine peaks, pine-scented valleys, apple orchards, and trans-Himalayan adventures.",
        popular_days=4,
        avg_daily_budget=3500.0
    ),
    DestinationItem(
        id="goa",
        name="Goa",
        region="Goa",
        country="India",
        tags=["Beaches", "Food", "Nightlife", "Culture"],
        image_url="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
        description="Golden tropical beaches, vibrant Portuguese heritage, aromatic spice farms, and coastal seafood.",
        popular_days=5,
        avg_daily_budget=4200.0
    ),
    DestinationItem(
        id="jaipur",
        name="Jaipur",
        region="Rajasthan",
        country="India",
        tags=["Culture", "History", "Architecture", "Shopping"],
        image_url="https://images.unsplash.com/photo-1603288940316-24f4e24eb57c?auto=format&fit=crop&w=800&q=80",
        description="The famed Pink City known for grand Rajput hilltop forts, ornate palaces, and buzzing craft bazaars.",
        popular_days=3,
        avg_daily_budget=3800.0
    ),
    DestinationItem(
        id="bali",
        name="Bali",
        region="Bali",
        country="Indonesia",
        tags=["Relaxation", "Nature", "Beaches", "Spiritual"],
        image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        description="Lush terraced rice paddies, ancient cliffside water temples, surf beaches, and holistic retreats.",
        popular_days=5,
        avg_daily_budget=5500.0
    ),
    DestinationItem(
        id="darjeeling",
        name="Darjeeling",
        region="West Bengal",
        country="India",
        tags=["Hills", "Tea Gardens", "Nature", "Culture"],
        image_url="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        description="Queen of the Hills framing Mt. Kanchenjunga, emerald tea estates, and colonial mountain rail history.",
        popular_days=4,
        avg_daily_budget=3200.0
    ),
    DestinationItem(
        id="kerala",
        name="Munnar & Alleppey",
        region="Kerala",
        country="India",
        tags=["Nature", "Relaxation", "Food", "Spiritual"],
        image_url="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
        description="Serene backwaters, rolling tea plantations, tranquil houseboats, and ayurvedic sanctuaries.",
        popular_days=5,
        avg_daily_budget=4000.0
    )
]

@router.get("", response_model=List[DestinationItem])
def get_destinations(
    search: Optional[str] = Query(None),
    tag: Optional[str] = Query(None)
):
    results = POPULAR_DESTINATIONS
    if search:
        s = search.lower()
        results = [d for d in results if s in d.name.lower() or s in d.region.lower() or s in d.country.lower()]
    if tag:
        t = tag.lower()
        results = [d for d in results if any(t == item.lower() for item in d.tags)]
    return results
