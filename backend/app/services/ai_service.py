import json
import logging
import uuid
import httpx
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.schemas.itinerary import (
    ItineraryOutputSchema,
    DayPlanSchema,
    ActivityItemSchema,
    MealItemSchema,
    AlternativeItemSchema
)
from app.utils.mock_planner import generate_dynamic_fallback_itinerary

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert travel itinerary planning engine.
Create practical, personalized, geographically efficient and budget-aware travel itineraries.

Requirements:
- Analyze every user preference before generating the itinerary.
- Optimize the sequence of activities to reduce unnecessary travel.
- Create a day-by-day schedule.
- Provide morning, afternoon and evening activities.
- Include estimated duration for activities.
- Include estimated travel time between activities.
- Recommend restaurants matching the user's food preferences and budget.
- Recommend accommodation matching the user's accommodation preference.
- Estimate daily and total costs in INR (Indian Rupee).
- Explain why important recommendations match the user's preferences.
- Allow individual days to be regenerated and individual activities to be replaced.
- Return structured JSON only strictly conforming to the following JSON schema:
{
  "trip_summary": {
    "destination": "string",
    "title": "string",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "number_of_days": 0,
    "traveler_type": "string",
    "group_size": 1
  },
  "overview": {
    "summary": "string",
    "travel_style": "string",
    "estimated_total_cost": 0.0,
    "currency": "INR"
  },
  "accommodation": {
    "name": "string",
    "category": "string",
    "estimated_price_per_night": 0.0,
    "reason": "string"
  },
  "transportation": {
    "primary_mode": "string",
    "recommendation": "string"
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "string",
      "estimated_daily_cost": 0.0,
      "activities": [
        {
          "time": "09:00 AM",
          "name": "string",
          "category": "string",
          "location": "string",
          "duration_minutes": 60,
          "estimated_cost": 0.0,
          "description": "string",
          "reason": "string",
          "travel_time_from_previous": "string",
          "transport": "string"
        }
      ],
      "meals": [
        {
          "type": "Breakfast",
          "restaurant": "string",
          "cuisine": "string",
          "estimated_cost": 0.0,
          "reason": "string"
        }
      ]
    }
  ],
  "budget_breakdown": {
    "accommodation": 0.0,
    "food": 0.0,
    "transportation": 0.0,
    "activities": 0.0,
    "miscellaneous": 0.0,
    "total": 0.0
  },
  "tips": ["string"],
  "alternatives": [
    {
      "activity": "string",
      "alternative": "string",
      "reason": "string"
    }
  ]
}
"""

class AIService:
    @staticmethod
    async def generate_itinerary(
        destination: str,
        start_date: str,
        end_date: str,
        traveler_type: str,
        group_size: int,
        budget: float,
        budget_type: str,
        travel_style: List[str],
        interests: List[str],
        accommodation_preference: str,
        transport_preference: str,
        pace: str,
        food_preferences: List[str],
        additional_preferences: Optional[str] = None
    ) -> ItineraryOutputSchema:
        """
        Generates an itinerary using Gemini / external LLM if API key is provided,
        or deterministic local fallback engine.
        """
        api_key = settings.AI_API_KEY.strip()
        
        # If API key is available, call Gemini API
        if api_key:
            try:
                tier = "Backpacker / Budget" if (budget / max(1, group_size)) < 15000 else ("Comfort / Mid-Range" if (budget / max(1, group_size)) <= 50000 else "Luxury / Premium")
                user_prompt = f"""Generate a personalized travel plan with the following inputs:
- Destination: {destination}
- Dates: {start_date} to {end_date}
- Traveler Type: {traveler_type}
- Group Size: {group_size}
- Budget: ₹{budget:,.0f} ({budget_type}) -> CLASSIFIED TIER: {tier}
- Travel Style: {', '.join(travel_style)}
- Interests: {', '.join(interests)}
- Accommodation: {accommodation_preference}
- Transport: {transport_preference}
- Pace: {pace}
- Food Preferences: {', '.join(food_preferences)}
- Additional Preferences: {additional_preferences or 'None'}

CRITICAL BUDGET CONSTRAINTS:
1. The estimated_total_cost MUST closely match the requested ₹{budget:,.0f} budget (within +/- 5%).
2. If tier is Backpacker (< ₹15k), recommend verified hostels, local dhabas, street food, and free/inexpensive public sights.
3. If tier is Comfort (₹15k-₹50k), recommend 3/4-star boutique hotels, authentic regional restaurants, and private cabs.
4. If tier is Luxury (> ₹50k), recommend 5-star luxury resorts/palaces, fine dining, private chauffeur transport, and exclusive VIP experiences.
5. All prices and breakdowns must be in INR.
"""
                # Call Gemini REST API
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={api_key}"
                payload = {
                    "contents": [{
                        "parts": [{"text": f"{SYSTEM_PROMPT}\n\nUser Request:\n{user_prompt}"}]
                    }],
                    "generationConfig": {
                        "response_mime_type": "application/json",
                        "temperature": 0.7
                    }
                }
                
                async with httpx.AsyncClient(timeout=35.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text_response = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text_response)
                        # Validate with Pydantic
                        return ItineraryOutputSchema(**parsed)
                    else:
                        logger.warning(f"AI API returned {resp.status_code}: {resp.text}. Falling back to dynamic planner.")
            except Exception as e:
                logger.error(f"External AI generation error: {e}. Utilizing dynamic planner fallback.")

        # Always fallback cleanly and produce a high quality result
        return generate_dynamic_fallback_itinerary(
            destination=destination,
            start_date_str=start_date,
            end_date_str=end_date,
            traveler_type=traveler_type,
            group_size=group_size,
            budget=budget,
            budget_type=budget_type,
            travel_style=travel_style,
            interests=interests,
            accommodation_preference=accommodation_preference,
            transport_preference=transport_preference,
            pace=pace,
            food_preferences=food_preferences,
            additional_preferences=additional_preferences
        )

    @staticmethod
    def regenerate_day(
        current_itinerary: Dict[str, Any],
        day_number: int,
        instructions: Optional[str] = None,
        locked_activity_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Regenerates only the requested day in the itinerary, preserving locked activities.
        """
        locked_set = set(locked_activity_ids or [])
        days = current_itinerary.get("days", [])
        
        target_day_index = -1
        for idx, d in enumerate(days):
            if d.get("day") == day_number:
                target_day_index = idx
                break
        
        if target_day_index == -1:
            return current_itinerary
            
        old_day = days[target_day_index]
        destination = current_itinerary.get("trip_summary", {}).get("destination", "City")
        
        # Keep locked activities
        retained_activities = [act for act in old_day.get("activities", []) if act.get("id") in locked_set or act.get("is_locked")]
        
        # Fresh replacements
        new_activity_samples = [
            {
                "id": str(uuid.uuid4()),
                "time": "10:00 AM",
                "name": f"Hidden Architectural Gem & Botanical Walk",
                "category": "Culture",
                "location": f"Historic Quarter, {destination}",
                "duration_minutes": 100,
                "estimated_cost": 150.0,
                "description": f"Refreshed experience: tranquil shaded gardens and classical architecture.",
                "reason": instructions or "Alternative scenic cultural point with lower visitor density.",
                "travel_time_from_previous": "15 mins",
                "transport": "Walking",
                "is_locked": False
            },
            {
                "id": str(uuid.uuid4()),
                "time": "03:00 PM",
                "name": f"Artisanal Coffee Tasting & Rooftop Gallery",
                "category": "Relaxation",
                "location": f"Art District, {destination}",
                "duration_minutes": 90,
                "estimated_cost": 250.0,
                "description": "Sample single-origin regional brews with local photography exhibition.",
                "reason": "Relaxed pacing and contemporary cultural insight.",
                "travel_time_from_previous": "20 mins",
                "transport": "Taxi",
                "is_locked": False
            },
            {
                "id": str(uuid.uuid4()),
                "time": "06:30 PM",
                "name": f"Sunset Hilltop Twilight Lookout",
                "category": "Nature",
                "location": f"High Ridge, {destination}",
                "duration_minutes": 75,
                "estimated_cost": 0.0,
                "description": f"Spectacular twilight vantage point overlooking the illuminated {destination} skyline.",
                "reason": "Golden hour vista away from traffic.",
                "travel_time_from_previous": "20 mins",
                "transport": "Taxi",
                "is_locked": False
            }
        ]
        
        combined_activities = retained_activities + new_activity_samples[:max(1, 3 - len(retained_activities))]
        
        # Recalculate day cost
        day_cost = sum(a.get("estimated_cost", 0) for a in combined_activities) + sum(m.get("estimated_cost", 0) for m in old_day.get("meals", []))
        
        new_day = {
            "day": day_number,
            "date": old_day.get("date"),
            "title": f"Refreshed Day {day_number}: Custom Exploration of {destination}",
            "estimated_daily_cost": day_cost,
            "activities": combined_activities,
            "meals": old_day.get("meals", [])
        }
        
        days[target_day_index] = new_day
        current_itinerary["days"] = days
        
        # Recalculate total budget
        total_act = sum(sum(a.get("estimated_cost", 0) for a in d.get("activities", [])) for d in days)
        current_itinerary["budget_breakdown"]["activities"] = total_act
        current_itinerary["budget_breakdown"]["total"] = (
            current_itinerary["budget_breakdown"].get("accommodation", 0) +
            current_itinerary["budget_breakdown"].get("food", 0) +
            current_itinerary["budget_breakdown"].get("transportation", 0) +
            total_act +
            current_itinerary["budget_breakdown"].get("miscellaneous", 0)
        )
        current_itinerary["overview"]["estimated_total_cost"] = current_itinerary["budget_breakdown"]["total"]
        
        return current_itinerary

    @staticmethod
    def replace_activity(
        current_itinerary: Dict[str, Any],
        day_number: int,
        activity_name: str,
        instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Replaces a single activity on a specific day with a curated alternative.
        """
        destination = current_itinerary.get("trip_summary", {}).get("destination", "City")
        days = current_itinerary.get("days", [])
        
        for d in days:
            if d.get("day") == day_number:
                for act in d.get("activities", []):
                    if act.get("name") == activity_name:
                        # Find alternative if in alternatives list
                        alt_name = f"Curated Alternative: Riverside Promenade & Cafe in {destination}"
                        alt_reason = "Alternative recommendation with relaxed pacing."
                        
                        for item in current_itinerary.get("alternatives", []):
                            if item.get("activity") == activity_name or activity_name in item.get("activity", ""):
                                alt_name = item.get("alternative", alt_name)
                                alt_reason = item.get("reason", alt_reason)
                                break
                        
                        act["name"] = alt_name
                        act["reason"] = f"Replaced: {alt_reason}"
                        act["description"] = f"Fresh alternative experience tailored to your itinerary preferences."
                        act["category"] = "Sightseeing"
                        break
                break
                
        current_itinerary["days"] = days
        return current_itinerary
