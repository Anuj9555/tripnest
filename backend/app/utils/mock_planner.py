import math
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.schemas.itinerary import (
    ItineraryOutputSchema,
    TripSummarySchema,
    OverviewSchema,
    AccommodationSchema,
    TransportationSchema,
    DayPlanSchema,
    ActivityItemSchema,
    MealItemSchema,
    BudgetBreakdownSchema,
    AlternativeItemSchema
)

# Budget Tier Definitions based on per-person-per-day spending
# Backpacker: < ₹2,500 / day
# Comfort: ₹2,500 - ₹7,500 / day
# Luxury: > ₹7,500 / day

DESTINATION_TIERED_DATA: Dict[str, Dict[str, Any]] = {
    "goa": {
        "title": "Goa Coastal Experience",
        "Backpacker": {
            "stay": ("The Lost Hostel / Zostel South Goa (Bunk Bed)", "Hostel", "Social atmosphere, beach walking distance, and budget-friendly."),
            "transport": ("Rented Scooter / Shared Auto", "Rent a 110cc scooter (~₹350/day) for high mobility at low cost."),
            "days": [
                {
                    "title": "North Goa Budget Beach & Cliff Walk",
                    "activities": [
                        ("09:00 AM", "Sinquerim Fort Ramparts & Free Ocean Point", "History", "Sinquerim", 90, "Scenic Portuguese sea-wall walking tour with zero entrance fees."),
                        ("02:00 PM", "Anjuna Beach & Flea Market Stroll", "Shopping", "Anjuna", 120, "Window shop handcrafted jewelry and local souvenirs."),
                        ("05:30 PM", "Chapora Fort Ramparts Sunset", "Nature", "Vagator", 90, "Panoramic red-rock sunset views made famous by Dil Chahta Hai.")
                    ],
                    "meals": [
                        ("Breakfast", "Infantaria Bakery Corner", "Goan Poi & Tea", "Fresh Goan bread with eggs and chai under budget."),
                        ("Lunch", "Anand Seafood & Veg Dhaba", "Local Goan Fish / Veg Thali", "Authentic local thali packed with fish curry or lentil stew."),
                        ("Dinner", "Curlies Beach Shack Stalls", "Street Wraps & Local Bites", "Affordable beachside quick dinner with ocean sounds.")
                    ]
                },
                {
                    "title": "Old Goa Latin Quarter & UNESCO Churches",
                    "activities": [
                        ("09:30 AM", "Basilica of Bom Jesus & Se Cathedral", "Culture", "Old Goa", 100, "Walk through monumental 16th-century Manueline and Baroque church architecture."),
                        ("02:00 PM", "Fontainhas Latin Quarter Walking Tour", "Culture", "Panaji", 110, "Walk through cobbled lanes lined with colourful Portuguese houses and art."),
                        ("05:30 PM", "Miramar Beach Stroll & Mandovi Promenade", "Relaxation", "Panaji", 75, "Breezy twilight walk along the riverfront public promenade.")
                    ],
                    "meals": [
                        ("Breakfast", "Cafe Tato Panaji", "Puri Bhaji & Chai", "Historic Panaji cafe serving Goan breakfast classics."),
                        ("Lunch", "Viva Panjim Budget Corner", "Traditional Home-style Xacuti", "Homestyle curry and rice plates at affordable rates."),
                        ("Dinner", "Panaji Night Food Street", "Street Shawarma & Cutlet Pao", "Bustling street stalls serving evening Goan snacks.")
                    ]
                }
            ]
        },
        "Comfort": {
            "stay": ("BloomSuites Calangute / Santana Beach Resort", "3-Star Hotel", "Boutique comfort with outdoor pool, central coastal access, and breakfast."),
            "transport": ("Private AC Cab / Self-Drive Sedan", "Air-conditioned taxi or self-drive vehicle for seamless coastal transit."),
            "days": [
                {
                    "title": "Heritage Forts, Boutique Markets & Cliffside Dining",
                    "activities": [
                        ("09:00 AM", "Aguada Fort & Portuguese Lighthouse Guided Tour", "History", "Sinquerim", 90, "Explore the 17th-century fortress and lighthouse with coastal historian."),
                        ("01:30 PM", "Anjuna Artisan Village & Boutique Shopping", "Shopping", "Anjuna", 120, "Browse curated regional textiles, organic oils, and coastal souvenirs."),
                        ("05:30 PM", "Vagator Golden Hour Cliff Lookout", "Nature", "Vagator", 90, "Spectacular twilight views across Ozran and Vagator beaches.")
                    ],
                    "meals": [
                        ("Breakfast", "Cafe Bodega Courtyard", "Bakery & Specialty Coffee", "Art gallery courtyard cafe with fresh artisanal sourdough and bakes."),
                        ("Lunch", "Vinayak Family Restaurant", "Authentic Goan Seafood Thali", "Renowned family spot for fresh catch of the day and coconut curries."),
                        ("Dinner", "Thalassa Greek Taverna", "Mediterranean & Seafood", "Greek flavours and live acoustic sets on open wooden decks overlooking Siolim river.")
                    ]
                },
                {
                    "title": "Latin Quarter Heritage & Mandovi Evening Cruise",
                    "activities": [
                        ("09:30 AM", "Old Goa UNESCO Cathedral Complex & Museum", "Culture", "Old Goa", 100, "Guided exploration of Se Cathedral and archaeological exhibits."),
                        ("02:00 PM", "Fontainhas Heritage Walk & Tile Painting Studio", "Culture", "Panaji", 110, "Intimate guided walk with Azulejos hand-painted ceramic tile demonstrations."),
                        ("06:00 PM", "Mandovi River Evening Catamaran Cruise", "Relaxation", "Panaji Jetty", 75, "Sunset catamaran cruise on the river with folk music and cooling breezes.")
                    ],
                    "meals": [
                        ("Breakfast", "The Project Cafe", "Artisan Breakfast & Smoothies", "Charming heritage villa cafe serving fresh tropical breakfast plates."),
                        ("Lunch", "The Black Sheep Bistro", "Contemporary Goan Fusion", "Farm-to-table cuisine celebrating local Goan produce."),
                        ("Dinner", "The Fisherman's Wharf", "Coastal Fine Dining & Music", "Riverside dining with live music and fresh coastal hospitality.")
                    ]
                }
            ]
        },
        "Luxury": {
            "stay": ("Taj Exotica Resort & Spa / Alila Diwa Luxury Villa", "5-Star Hotel", "Sprawling luxury oceanfront sanctuary with private pool villas, butler service, and private beach access."),
            "transport": ("Chauffeur-Driven Luxury SUV / Private Yacht", "Dedicated chauffeur in a premium Mercedes/BMW sedan with private yacht charters."),
            "days": [
                {
                    "title": "Private Coastal Cruise & Exclusive Sunset Clifftop",
                    "activities": [
                        ("09:30 AM", "Private Catamaran Charter along Arabian Sea", "Adventure", "Panaji Marina", 120, "Private chartered catamaran with champagne breakfast and dolphin spotting."),
                        ("02:30 PM", "Curated Private Art Gallery & Antique Collection Tour", "Culture", "Fontainhas", 90, "Private viewing of colonial Goan heirlooms and contemporary Indo-Portuguese art."),
                        ("06:00 PM", "Sunset Clifftop Champagne Experience", "Relaxation", "Vagator Cliff", 90, "Reserved VIP daybed with panoramic Arabian Sea sunset and vintage wine.")
                    ],
                    "meals": [
                        ("Breakfast", "Private Villa Garden Breakfast", "Gourmet Continental & Tropical", "Five-star chef-curated morning spread served in private poolside pavilion."),
                        ("Lunch", "Cavatina by Chef Avinash Martins", "Modern Goan Gastronomy", "Acclaimed 7-course tasting menu reinventing indigenous culinary heritage."),
                        ("Dinner", "Thalassa VIP Waterfront Reserve", "Greek Gourmet & Fine Wine", "Prime front-row sunset lounge with grilled tiger prawns and imported vintage wines.")
                    ]
                },
                {
                    "title": "South Goa Organic Plantation & Luxury Ayurvedic Spa",
                    "activities": [
                        ("09:30 AM", "Private Guided VIP Spice Plantation & Herbal Alchemy", "Nature", "Ponda", 120, "Personalized tour with master botanist followed by exclusive organic spice tasting."),
                        ("03:00 PM", "Taj Jiva Spa Signature Ayurvedic Therapy", "Relaxation", "Benaulim", 120, "Holistic therapeutic wellness massage with warm medicinal oils and herbal scrubs."),
                        ("06:30 PM", "Candlelit Private Beach Dinner & Stargazing", "Relaxation", "Private Beach", 90, "Customized candlelit canopy setup directly on the sand with dedicated private butler.")
                    ],
                    "meals": [
                        ("Breakfast", "Miguel's Cocktails & Gourmet Toast", "European Artisanal", "Signature specialty cafe serving poached eggs with truffle oil and barista brews."),
                        ("Lunch", "Spice Plantation Royal Banquet", "Royal Saraswat Cuisine", "Private wooden pavilion luncheon cooked on clay pots over coconut husks."),
                        ("Dinner", "Riverside Seafood Grill & Oyster Bar", "Seafood & Champagne", "Private beachfront table with grilled rock lobsters, crab thermidor, and chilled champagne.")
                    ]
                }
            ]
        }
    },
    "jaipur": {
        "title": "Jaipur Royal City Experience",
        "Backpacker": {
            "stay": ("Moustache Hostel Jaipur / Zostel", "Hostel", "Vibrant rooftop pool, backpacker community, and walking distance to transit."),
            "transport": ("Electric Auto-Rickshaw & Metro", "Economical e-rickshaws and Jaipur Metro for rapid navigation."),
            "days": [
                {
                    "title": "Pink City Free Heritage Walk & Amber Fortress",
                    "activities": [
                        ("08:30 AM", "Amber Fort Hilltop Architecture Walk", "History", "Amer", 150, "Explore the grand Rajput ramparts, mirror hall courtyards, and palace gates."),
                        ("01:30 PM", "Panna Meena ka Kund Stepwell", "Architecture", "Amer Town", 45, "Marvel at symmetrical 16th-century geometric staircases with zero entry fee."),
                        ("04:30 PM", "Nahargarh Fort Hill Sunset Point", "Nature", "Nahargarh Hills", 120, "Panoramic evening view of the entire illuminated Pink City below.")
                    ],
                    "meals": [
                        ("Breakfast", "Rawat Mishthan Bhandar", "Pyaaz Kachori & Chai", "Legendary Jaipur crisp onion kachoris and sweet masala chai."),
                        ("Lunch", "Thali House Old City", "Authentic Rajasthani Dal Baati", "Traditional dal baati churma thali at friendly local rates."),
                        ("Dinner", "Masala Chowk Food Court", "Street Delicacies & Chaat", "Open-air heritage food court offering 20+ celebrated local street vendors.")
                    ]
                }
            ]
        },
        "Comfort": {
            "stay": ("Alsisar Haveli / Hotel Pearl Palace Heritage", "3-Star Hotel", "Authentic Rajput haveli with restored frescoes, courtyard pool, and regal decor."),
            "transport": ("Private AC Cab / Uber City Access", "Dedicated AC sedan for smooth transfers across hill forts and old city bazaars."),
            "days": [
                {
                    "title": "Royal Forts, Palaces & Textile Bazaars",
                    "activities": [
                        ("08:30 AM", "Amber Fort & Sheesh Mahal Guided Tour", "History", "Amer", 150, "Full guided tour of Rajput halls of mirrors and Mughal garden courtyards."),
                        ("01:30 PM", "City Palace & Astronomical Jantar Mantar", "Culture", "Old City", 120, "Visit the Maharaja's palace complex and UNESCO astronomical stone instruments."),
                        ("04:30 PM", "Nahargarh Sunset & Johari Bazaar Stroll", "Shopping", "Old City", 120, "Catch sunset over the city ramparts followed by block-print shopping.")
                    ],
                    "meals": [
                        ("Breakfast", "LMB (Laxmi Misthan Bhandar)", "Rajasthani Sweets & Kachori", "Historic culinary institution famous for royal kachoris and lassi."),
                        ("Lunch", "1135 AD inside Amber Fort", "Heritage Rajput Dining", "Regal dining amidst silver doors, crystal chandeliers, and rich curries."),
                        ("Dinner", "Handi Restaurant on MI Road", "North Indian Curries & Naan", "Celebrated culinary spot known for authentic Mughlai and Rajasthani dishes.")
                    ]
                }
            ]
        },
        "Luxury": {
            "stay": ("Rambagh Palace / The Oberoi Rajvilas", "5-Star Hotel", "Former royal residence of the Maharaja of Jaipur set in 47 acres of Mughal gardens with royal peacocks."),
            "transport": ("Chauffeur-Driven Luxury Mercedes / Private Chariot", "Personal chauffeur in luxury sedan with royal palace greeting and private transfers."),
            "days": [
                {
                    "title": "Private Royal Palace Access & Vintage Car Excursion",
                    "activities": [
                        ("08:30 AM", "Exclusive VIP Access to Amber Fort & Royal Quarters", "History", "Amer", 150, "Private royal entry before public opening accompanied by senior heritage curator."),
                        ("01:30 PM", "Private Chandra Mahal Inner Palace Tour", "Culture", "City Palace", 120, "Exclusive VIP access to the private 7-storey inner chambers of the living Royal Family."),
                        ("05:30 PM", "Nahargarh Hill Sunset with Private High Tea", "Relaxation", "Nahargarh", 90, "Private champagne high tea overlooking the illuminated Jaipur skyline.")
                    ],
                    "meals": [
                        ("Breakfast", "Suvarna Mahal Palace Dining", "Royal Continental & Indian", "Gold-plated tableware, Florentine frescoes, and personalized royal service."),
                        ("Lunch", "Baradari Restaurant inside City Palace", "Modern Rajasthani Cuisine", "Courtyard fine dining within the marble colonnades of the Royal Palace."),
                        ("Dinner", "Peshawri at ITC Rajputana", "Tandoori Cuisine & Rare Malts", "Legendary Dal Bukhara and clay-oven culinary masterpieces paired with rare malts.")
                    ]
                }
            ]
        }
    },
    "bali": {
        "title": "Bali Island Exploration",
        "Backpacker": {
            "stay": ("Arya Wellness Retreat / Ubud Backpacker Hub", "Hostel", "Shared eco-dorm with yoga decks, pool, and central Ubud access."),
            "transport": ("Rented Scooter / Gojek Rides", "Automatic scooter rental (~₹400/day) for traversing green mountain roads."),
            "days": [
                {
                    "title": "Ubud Jungle Walks & Sacred Temples",
                    "activities": [
                        ("09:00 AM", "Campuhan Ridge Walk", "Nature", "Campuhan", 90, "Free sunrise ridge trek flanking lush river valleys with zero entrance cost."),
                        ("01:30 PM", "Sacred Monkey Forest Sanctuary", "Nature", "Padangtegal", 90, "Walk beneath towering trees with playful long-tailed macaques."),
                        ("05:00 PM", "Ubud Art Market Stroll", "Shopping", "Ubud Center", 90, "Explore local woven rattan bags, handicrafts, and paintings.")
                    ],
                    "meals": [
                        ("Breakfast", "Warung Semesta", "Tropical Smoothie & Banana Pancake", "Fresh tropical fruit bowls and local Balinese coffee."),
                        ("Lunch", "Warung Babi Guling Ibu Oka", "Authentic Balinese Plates", "Famous roasted pork or seasoned jackfruit rice plates."),
                        ("Dinner", "Warung Pondok Madu", "Nasi Campur & Balinese Curry", "Generous traditional portions of Balinese spiced curries.")
                    ]
                }
            ]
        },
        "Comfort": {
            "stay": ("Ubud Village Hotel / Padma Resort Legian", "3-Star Hotel", "Authentic Balinese garden resort with river valley views and infinity pool."),
            "transport": ("Private AC Day Driver", "Comfortable private day driver with itinerary flexibility."),
            "days": [
                {
                    "title": "Rice Terraces, Sacred Springs & Clifftop Sunsets",
                    "activities": [
                        ("08:30 AM", "Tegallalang Rice Terraces & Jungle Swing", "Nature", "Gianyar", 120, "Trek through stepped emerald rice paddies with optional swing experience."),
                        ("01:30 PM", "Tirta Empul Holy Water Spring Temple", "Culture", "Tampaksiring", 90, "Witness sacred spiritual water purification rituals in holy mountain springs."),
                        ("05:30 PM", "Uluwatu Clifftop Temple & Sunset", "Culture", "Uluwatu", 90, "Marvel at the 11th-century temple perched atop a sheer 70-meter sea cliff.")
                    ],
                    "meals": [
                        ("Breakfast", "Tis Cafe overlooking Terraces", "Modern Balinese Cafe", "Fresh roasted Kintamani coffee and tropical avocado toasts."),
                        ("Lunch", "Clear Cafe Ubud", "Tropical Healthy Dining", "Multi-level bamboo architectural sanctuary serving fresh fish and bowls."),
                        ("Dinner", "Jimbaran Bay Candlelit Seafood", "Grilled Seafood on Beach", "Fresh grilled snapper and prawns with sambal matah seated on the sand.")
                    ]
                }
            ]
        },
        "Luxury": {
            "stay": ("Ayana Resort & Spa / Kamandalu Private Pool Villa", "5-Star Hotel", "Private cliffside villa with infinity pool, dedicated butler, and panoramic Indian Ocean views."),
            "transport": ("Private Luxury Van with Chauffeur", "Dedicated luxury chauffeur-driven Alphard van with chilled towels and refreshments."),
            "days": [
                {
                    "title": "Private Helicopter Rice Flight & Clifftop Ocean Dining",
                    "activities": [
                        ("09:00 AM", "Helicopter Aerial Tour of Mount Batur & Caldera", "Adventure", "Air Charter", 60, "Scenic helicopter flight over active volcanic caldera and emerald terraces."),
                        ("02:00 PM", "Private Luxury Spa Treatment at Rock Bar Resort", "Relaxation", "Jimbaran", 120, "Thalassotherapy saltwater spa pool treatment with ocean views."),
                        ("06:00 PM", "VIP Reserved Lounge at Iconic Rock Bar", "Relaxation", "Ayana Cliff", 90, "Perched on natural rocks 14 meters above the crashing Indian Ocean.")
                    ],
                    "meals": [
                        ("Breakfast", "Floating Pool Breakfast", "Gourmet Tropical & Champagne", "Floating breakfast tray in your private villa pool with sparkling wine."),
                        ("Lunch", "Locavore Herbivore", "Modern Culinary Art", "Acclaimed multi-course gastronomic menu utilizing hyper-local ingredients."),
                        ("Dinner", "Kisik Seafood Bar & Clifftop Grill", "Live Lobster & Fine Wine", "Torch-lit tables on private ocean sand with fresh grilled rock lobster.")
                    ]
                }
            ]
        }
    },
    "manali": {
        "title": "Manali Mountain Experience",
        "Backpacker": {
            "stay": ("Zostel Old Manali / Backpacker Pod", "Hostel", "Wooden dorm rooms surrounded by apple orchards, live music, and backpackers."),
            "transport": ("Walking & Shared Taxis", "Old Manali is best explored on foot with shared cabs to Solang."),
            "days": [
                {
                    "title": "Old Manali Forest Walks & Ancient Cedars",
                    "activities": [
                        ("09:00 AM", "Hadimba Devi Ancient Cedar Woods", "Culture", "Dhungri", 90, "Walk through giant deodar pine forest to the 1553 pagoda temple."),
                        ("01:30 PM", "Old Manali Village & Manu Temple", "Culture", "Old Manali", 120, "Wander stone alleys, riverside cafes, and apple farms."),
                        ("05:00 PM", "Jogini Waterfall Short Hike", "Nature", "Vashisht", 90, "Hike past natural hot sulfur springs to the cascading falls.")
                    ],
                    "meals": [
                        ("Breakfast", "Drifters' Cafe", "Himachali Eggs & Chai", "Warm wooden cafe with hearty breakfast plates."),
                        ("Lunch", "Chopsticks Old Corner", "Tibetan Thukpa & Momos", "Steaming bowls of vegetable or mutton thukpa."),
                        ("Dinner", "Cafe 1947 Riverside", "Italian Pasta & Trout", "Cozy riverside tables next to the gushing Manalsu river.")
                    ]
                }
            ]
        },
        "Comfort": {
            "stay": ("The Himalayan Resort & Spa / Snow Valley", "3-Star Hotel", "Castle-style boutique mountain resort with heated outdoor pool and deodar views."),
            "transport": ("Dedicated Union Taxi", "Private approved tourist taxi for full mountain valley access."),
            "days": [
                {
                    "title": "Solang Valley Adventures & Alpine Waterfalls",
                    "activities": [
                        ("08:30 AM", "Solang Valley Paragliding & Ropeway", "Adventure", "Solang", 180, "Tandem paragliding and scenic gondola ride across snow-dusted ridges."),
                        ("02:00 PM", "Atal Tunnel Drive to Sissu Cascades", "Nature", "Lahaul", 150, "Drive through engineering marvel into dramatic Trans-Himalayan valleys."),
                        ("06:00 PM", "Mall Road Evening Shopping", "Shopping", "Mall Road", 90, "Browse authentic Kullu woolen shawls, dried fruits, and honey.")
                    ],
                    "meals": [
                        ("Breakfast", "Johnson's Cafe", "Trout & Artisan Coffee", "Fresh bakes and mountain espresso in English garden."),
                        ("Lunch", "Sissu Riverside Dhaba", "Himachali Siddu & Stew", "Traditional steamed wheat dumplings with ghee and lentil dal."),
                        ("Dinner", "The Lazy Dog Lounge", "Continental & Local Trout", "Riverside dining with live acoustic music and baked trout.")
                    ]
                }
            ]
        },
        "Luxury": {
            "stay": ("Span Resort & Spa / The Tamara Luxury Chalet", "5-Star Hotel", "Exclusive riverside luxury chalets set in 10 acres of pine woodlands with private helipad."),
            "transport": ("Chauffeur-Driven 4x4 Luxury SUV", "Private 4x4 Toyota Fortuner with experienced high-altitude mountain driver."),
            "days": [
                {
                    "title": "Private Heli-Sightseeing & Luxury Alpine Spa",
                    "activities": [
                        ("09:00 AM", "Helicopter Sightseeing over Rohtang Glacier", "Adventure", "Helipad", 60, "Private helicopter flight over glaciers and Rohtang snowfields."),
                        ("02:00 PM", "Span Ayurvedic Wellness Spa Treatment", "Relaxation", "Baragarh", 120, "Rejuvenating Himalayan cedar aromatherapy and deep tissue massage."),
                        ("06:00 PM", "Private Riverside Bonfire & Stargazing", "Relaxation", "Beas River", 90, "Private riverside setup with roaring woodfire, barbecue, and telescope.")
                    ],
                    "meals": [
                        ("Breakfast", "Chalet Veranda Champagne Breakfast", "Gourmet Alpine Spread", "Artisan cheeses, fresh orchard honey, and champagne on your private sun-deck."),
                        ("Lunch", "The Cedar Luxury Dining Room", "Gourmet Himachali Tasting", "Seven-course culinary showcase of rare mountain herbs and wild mushrooms."),
                        ("Dinner", "Riverside Barbecue Pavilion", "Grilled River Trout & Malts", "Flame-grilled Beas river trout paired with single malt whiskies under pine canopy.")
                    ]
                }
            ]
        }
    }
}

def determine_budget_tier(total_budget: float, num_days: int, group_size: int) -> str:
    """Classifies budget into Backpacker, Comfort, or Luxury tier"""
    per_person_per_day = total_budget / (max(1, num_days) * max(1, group_size))
    if per_person_per_day < 2500:
        return "Backpacker"
    elif per_person_per_day <= 7500:
        return "Comfort"
    else:
        return "Luxury"

def generate_dynamic_fallback_itinerary(
    destination: str,
    start_date_str: str,
    end_date_str: str,
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
    Intelligent, budget-adaptive itinerary generator that scales accommodations,
    dining, transportation, and activities dynamically to match the user's EXACT budget tier.
    """
    dest_clean = destination.strip()
    dest_key = dest_clean.lower().split(",")[0].strip()

    # Calculate days
    try:
        s_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        e_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        num_days = max(1, (e_date - s_date).days + 1)
    except Exception:
        s_date = datetime.now().date()
        num_days = 3
        e_date = s_date + timedelta(days=num_days - 1)
        start_date_str = s_date.strftime("%Y-%m-%d")
        end_date_str = e_date.strftime("%Y-%m-%d")

    # Calculate total and per-person budget
    if budget_type == "Per Person":
        total_budget = float(budget * group_size)
    else:
        total_budget = float(budget)

    # Determine Budget Tier: Backpacker, Comfort, or Luxury
    tier = determine_budget_tier(total_budget, num_days, group_size)

    # Overwrite tier if user explicitly picked Luxury or Budget travel styles
    if "Luxury" in travel_style:
        tier = "Luxury"
    elif "Budget" in travel_style and total_budget / (num_days * group_size) < 4000:
        tier = "Backpacker"

    # Dynamic Budget Allocation:
    # Accommodation: ~38%
    # Food: ~26%
    # Transportation: ~14%
    # Activities: ~14%
    # Miscellaneous: ~8%
    accommodation_budget = round(total_budget * 0.38, 2)
    food_budget = round(total_budget * 0.26, 2)
    transport_budget = round(total_budget * 0.14, 2)
    activity_budget = round(total_budget * 0.14, 2)
    misc_budget = round(total_budget * 0.08, 2)

    stay_nights = max(1, num_days - 1)
    daily_stay_price = round(accommodation_budget / stay_nights, 2)
    daily_food_budget_per_person = round((food_budget / num_days) / max(1, group_size), 2)
    daily_activity_pool = round(activity_budget / num_days, 2)
    daily_transport_price = round(transport_budget / num_days, 2)

    # Match Knowledge base or synthesize
    known_data = None
    for k, v in DESTINATION_TIERED_DATA.items():
        if k in dest_key or dest_key in k:
            known_data = v
            break

    # Determine stay name and reason based on tier
    if known_data and tier in known_data:
        stay_name, stay_cat, stay_reason = known_data[tier]["stay"]
        primary_transport, transport_recommendation = known_data[tier]["transport"]
    else:
        if tier == "Backpacker":
            stay_name = f"Zostel & Backpacker Eco-Hub {dest_clean}"
            stay_cat = "Hostel / Budget Stay"
            stay_reason = f"Budget-friendly stay calibrated to your ₹{total_budget:,.0f} backpacker budget with prime social atmosphere."
            primary_transport = "Scooter Rental / Shared Transit"
            transport_recommendation = f"Affordable shared auto-rickshaws, city buses, and walking around {dest_clean}."
        elif tier == "Luxury":
            stay_name = f"The Oberoi / Taj Royal Sanctuary {dest_clean}"
            stay_cat = "5-Star Luxury Resort"
            stay_reason = f"World-class 5-star royal hospitality with private pool villas tailored to your ₹{total_budget:,.0f} luxury budget."
            primary_transport = "Chauffeur-Driven Luxury Sedan"
            transport_recommendation = f"Dedicated private luxury car with professional chauffeur throughout your stay in {dest_clean}."
        else:
            stay_name = f"Grand Heritage Boutique Hotel {dest_clean}"
            stay_cat = "3-Star / 4-Star Hotel"
            stay_reason = f"Comfortable boutique stay with high guest ratings matching your ₹{total_budget:,.0f} budget."
            primary_transport = "Private AC Cab / Uber"
            transport_recommendation = f"Private air-conditioned app taxis for comfortable, flexible sightseeing in {dest_clean}."

    # Build Day Plans
    days_list: List[DayPlanSchema] = []

    # Calculate meal splits: Breakfast (25%), Lunch (35%), Dinner (40%)
    b_cost = max(60.0, round(daily_food_budget_per_person * 0.25, 2))
    l_cost = max(100.0, round(daily_food_budget_per_person * 0.35, 2))
    d_cost = max(120.0, round(daily_food_budget_per_person * 0.40, 2))

    # Activity cost per slot (3 slots per day)
    act_cost_1 = max(0.0, round(daily_activity_pool * 0.40, 2))
    act_cost_2 = max(0.0, round(daily_activity_pool * 0.35, 2))
    act_cost_3 = max(0.0, round(daily_activity_pool * 0.25, 2))

    for i in range(num_days):
        day_num = i + 1
        current_date = (s_date + timedelta(days=i)).strftime("%Y-%m-%d")

        if known_data and tier in known_data and i < len(known_data[tier]["days"]):
            day_template = known_data[tier]["days"][i]
            day_title = day_template["title"]
            act_templates = day_template["activities"]
            meal_templates = day_template["meals"]

            activities = [
                ActivityItemSchema(
                    id=str(uuid.uuid4()),
                    time=act_templates[0][0],
                    name=act_templates[0][1],
                    category=act_templates[0][2],
                    location=act_templates[0][3],
                    duration_minutes=act_templates[0][4],
                    estimated_cost=act_cost_1,
                    description=act_templates[0][5],
                    reason=f"Selected for {tier} style with budget allocation of ₹{act_cost_1:,.0f}.",
                    travel_time_from_previous="15 mins",
                    transport=primary_transport.split("/")[0].strip(),
                    is_locked=False
                ),
                ActivityItemSchema(
                    id=str(uuid.uuid4()),
                    time=act_templates[1][0],
                    name=act_templates[1][1],
                    category=act_templates[1][2],
                    location=act_templates[1][3],
                    duration_minutes=act_templates[1][4],
                    estimated_cost=act_cost_2,
                    description=act_templates[1][5],
                    reason=f"Curated {tier} activity matching your pace and interests.",
                    travel_time_from_previous="20 mins",
                    transport=primary_transport.split("/")[0].strip(),
                    is_locked=False
                ),
                ActivityItemSchema(
                    id=str(uuid.uuid4()),
                    time=act_templates[2][0] if len(act_templates) > 2 else "05:30 PM",
                    name=act_templates[2][1] if len(act_templates) > 2 else f"Sunset Vista at {dest_clean}",
                    category=act_templates[2][2] if len(act_templates) > 2 else "Nature",
                    location=act_templates[2][3] if len(act_templates) > 2 else f"{dest_clean} Ridge",
                    duration_minutes=act_templates[2][4] if len(act_templates) > 2 else 90,
                    estimated_cost=act_cost_3,
                    description=act_templates[2][5] if len(act_templates) > 2 else "Evening sunset transition over the horizon.",
                    reason="Golden hour transition point.",
                    travel_time_from_previous="20 mins",
                    transport="Walking",
                    is_locked=False
                )
            ]

            meals = [
                MealItemSchema(
                    type=meal_templates[0][0],
                    restaurant=meal_templates[0][1],
                    cuisine=meal_templates[0][2],
                    estimated_cost=b_cost,
                    reason=meal_templates[0][3]
                ),
                MealItemSchema(
                    type=meal_templates[1][0],
                    restaurant=meal_templates[1][1],
                    cuisine=meal_templates[1][2],
                    estimated_cost=l_cost,
                    reason=meal_templates[1][3]
                ),
                MealItemSchema(
                    type=meal_templates[2][0],
                    restaurant=meal_templates[2][1],
                    cuisine=meal_templates[2][2],
                    estimated_cost=d_cost,
                    reason=meal_templates[2][3]
                )
            ]
        else:
            # Procedural synthesis
            primary_interest = interests[i % len(interests)] if interests else "Culture"
            day_title = f"{tier} Day {day_num}: {primary_interest} Highlights in {dest_clean}"

            if tier == "Backpacker":
                activities = [
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="09:00 AM",
                        name=f"Historic {dest_clean} Heritage Quarter Walk",
                        category="Culture",
                        location=f"Central {dest_clean}",
                        duration_minutes=120,
                        estimated_cost=act_cost_1,
                        description=f"Self-guided walking trail through ancient alleys, historic temples, and artisan quarters.",
                        reason=f"Cost-efficient exploration matching {tier} budget.",
                        travel_time_from_previous="15 mins",
                        transport="Walking",
                        is_locked=False
                    ),
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="02:00 PM",
                        name=f"{dest_clean} Local Bazaar & Street Artisans",
                        category="Shopping",
                        location=f"Old Bazaar, {dest_clean}",
                        duration_minutes=110,
                        estimated_cost=act_cost_2,
                        description="Browse local spices, handicrafts, and regional textiles directly from street craftsmen.",
                        reason="Authentic local vibe without expensive ticket barriers.",
                        travel_time_from_previous="15 mins",
                        transport="Shared Auto",
                        is_locked=False
                    ),
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="05:30 PM",
                        name=f"Public Panoramic Sunset Hilltop",
                        category="Nature",
                        location=f"Upper Ridge, {dest_clean}",
                        duration_minutes=90,
                        estimated_cost=act_cost_3,
                        description=f"Watch the sunset from the highest public viewpoint overlooking {dest_clean}.",
                        reason="Spectacular view point with free public access.",
                        travel_time_from_previous="20 mins",
                        transport="Walking",
                        is_locked=False
                    )
                ]
                meals = [
                    MealItemSchema(type="Breakfast", restaurant=f"Local Chai & Breakfast Stall, {dest_clean}", cuisine="Local Breakfast", estimated_cost=b_cost, reason="Fresh local morning staples and hot tea."),
                    MealItemSchema(type="Lunch", restaurant=f"Traditional Dhaba & Thali House, {dest_clean}", cuisine="Authentic Thali", estimated_cost=l_cost, reason="Budget-friendly authentic vegetarian or fish thali."),
                    MealItemSchema(type="Dinner", restaurant=f"Evening Night Food Market, {dest_clean}", cuisine="Street Food", estimated_cost=d_cost, reason="Vibrant evening street food stalls loved by locals.")
                ]
            elif tier == "Luxury":
                activities = [
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="09:30 AM",
                        name=f"Private VIP Heritage & Architecture Tour",
                        category="Culture",
                        location=f"Royal Quarter, {dest_clean}",
                        duration_minutes=120,
                        estimated_cost=act_cost_1,
                        description=f"Exclusive private guided tour of {dest_clean}'s most celebrated palaces with priority entry.",
                        reason=f"Luxury private concierge access tailored to ₹{total_budget:,.0f} budget.",
                        travel_time_from_previous="15 mins",
                        transport="Chauffeur Luxury Sedan",
                        is_locked=False
                    ),
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="02:30 PM",
                        name=f"Private Yacht Cruise / Exclusive Mountain Spa",
                        category="Relaxation",
                        location=f"Waterfront / Hilltop Spa, {dest_clean}",
                        duration_minutes=120,
                        estimated_cost=act_cost_2,
                        description="Bespoke luxury relaxation with personalized wellness therapies and champagne.",
                        reason="Top-tier luxury leisure experience.",
                        travel_time_from_previous="20 mins",
                        transport="Chauffeur Luxury Sedan",
                        is_locked=False
                    ),
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="06:00 PM",
                        name=f"VIP Clifftop Sunset & Rare Vintage Wine Tasting",
                        category="Nature",
                        location=f"Private Deck, {dest_clean}",
                        duration_minutes=90,
                        estimated_cost=act_cost_3,
                        description="Private reserved lounge deck with sweeping panoramic sunset views and sommelier tasting.",
                        reason="Unrivaled sunset indulgence.",
                        travel_time_from_previous="15 mins",
                        transport="Chauffeur Luxury Sedan",
                        is_locked=False
                    )
                ]
                meals = [
                    MealItemSchema(type="Breakfast", restaurant=f"The Grand Veranda at Palace Hotel", cuisine="Gourmet Continental & Champagne", estimated_cost=b_cost, reason="Lavish champagne buffet with private terrace views."),
                    MealItemSchema(type="Lunch", restaurant=f"Royal Heritage Dining Pavilion", cuisine="Fine Dining Regional", estimated_cost=l_cost, reason="Multi-course royal menu served with silver service."),
                    MealItemSchema(type="Dinner", restaurant=f"The Clifftop Candlelit Sanctuary", cuisine="Chef Tasting Menu & Wine Pairing", estimated_cost=d_cost, reason="Romantic candlelit ambiance with sommelier wine pairing.")
                ]
            else:
                activities = [
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="09:30 AM",
                        name=f"Monument & Culture Exploration in {dest_clean}",
                        category="Culture",
                        location=f"Central {dest_clean}",
                        duration_minutes=120,
                        estimated_cost=act_cost_1,
                        description=f"Visit prime monuments and museums in {dest_clean} with audio guide.",
                        reason=f"Balanced comfort schedule matching ₹{total_budget:,.0f} budget.",
                        travel_time_from_previous="15 mins",
                        transport="Private AC Cab",
                        is_locked=False
                    ),
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="02:30 PM",
                        name=f"{dest_clean} Artisan Village & Scenic Trails",
                        category="Shopping",
                        location=f"Heritage Quarter, {dest_clean}",
                        duration_minutes=110,
                        estimated_cost=act_cost_2,
                        description="Explore boutique craft galleries and scenic neighborhood lookouts.",
                        reason="Comfortable pacing with rich regional immersion.",
                        travel_time_from_previous="20 mins",
                        transport="Private AC Cab",
                        is_locked=False
                    ),
                    ActivityItemSchema(
                        id=str(uuid.uuid4()),
                        time="05:45 PM",
                        name=f"Sunset Ridge & Evening Promenade",
                        category="Nature",
                        location=f"Ridge Promenade, {dest_clean}",
                        duration_minutes=90,
                        estimated_cost=act_cost_3,
                        description=f"Sunset walk with ambient cafe stops overlooking {dest_clean}.",
                        reason="Golden hour transition with scenic evening lighting.",
                        travel_time_from_previous="15 mins",
                        transport="Walking",
                        is_locked=False
                    )
                ]
                meals = [
                    MealItemSchema(type="Breakfast", restaurant=f"The Morning Roast Artisanal Cafe", cuisine="Modern Breakfast & Coffee", estimated_cost=b_cost, reason="Fresh sourdough, tropical fruit, and barista coffee."),
                    MealItemSchema(type="Lunch", restaurant=f"Heritage Family Thali & Grill", cuisine="Authentic Local Cuisine", estimated_cost=l_cost, reason="Celebrated local dining spot with rich curries and fresh catch."),
                    MealItemSchema(type="Dinner", restaurant=f"Terrace View Bistro & Garden Bar", cuisine="Multi-cuisine & Cocktails", estimated_cost=d_cost, reason="Ambient rooftop setting with acoustic music.")
                ]

        day_total_cost = sum(a.estimated_cost for a in activities) + sum(m.estimated_cost for m in meals) + (daily_stay_price / max(1, group_size)) + daily_transport_price

        days_list.append(DayPlanSchema(
            day=day_num,
            date=current_date,
            title=day_title,
            estimated_daily_cost=round(day_total_cost, 2),
            activities=activities,
            meals=meals
        ))

    # Calculate actual totals perfectly matching budget breakdown
    total_activity_cost = sum(sum(a.estimated_cost for a in d.activities) for d in days_list)
    total_meals_cost = sum(sum(m.estimated_cost for m in d.meals) for d in days_list) * group_size
    total_stay_cost = daily_stay_price * stay_nights
    total_trans_cost = daily_transport_price * num_days
    grand_total = round(total_stay_cost + total_meals_cost + total_activity_cost + total_trans_cost + misc_budget, 2)

    tips = [
        f"Budget Tier: Classified as {tier} based on your ₹{total_budget:,.0f} budget for {group_size} travelers over {num_days} days.",
        f"Keep small denominations of local currency handy for local vendors and transport in {dest_clean}.",
        f"Pre-book popular attractions 24-48 hours in advance during peak season to skip long queues.",
        f"Wear comfortable shoes suitable for walking tours and historic cobblestone paths."
    ]

    alternatives = [
        AlternativeItemSchema(
            activity="Panoramic Sunset Point",
            alternative=f"{dest_clean} Riverside Promenade / Cultural Cafe",
            reason="A flatter, less crowded option ideal for relaxing without stairs."
        ),
        AlternativeItemSchema(
            activity="Local Artisan Market",
            alternative=f"{dest_clean} Heritage Textile & Museum Exhibition",
            reason="Indoor air-conditioned cultural experience perfect for warm afternoons."
        )
    ]

    # Dynamic Title
    trip_title = f"{num_days}-Day {tier} Adventure in {dest_clean} (₹{total_budget:,.0f})"

    summary_text = (
        f"Customized {num_days}-day itinerary calibrated for {traveler_type.lower()} travelers visiting {dest_clean}. "
        f"Optimized specifically for a {tier} budget of ₹{total_budget:,.0f} ({budget_type}), "
        f"featuring {stay_name}, {primary_transport}, and geographically coherent daily schedules."
    )

    return ItineraryOutputSchema(
        trip_summary=TripSummarySchema(
            destination=dest_clean,
            title=trip_title,
            start_date=start_date_str,
            end_date=end_date_str,
            number_of_days=num_days,
            traveler_type=traveler_type,
            group_size=group_size
        ),
        overview=OverviewSchema(
            summary=summary_text,
            travel_style=f"{tier} ({', '.join(travel_style)})",
            estimated_total_cost=grand_total,
            currency="INR"
        ),
        accommodation=AccommodationSchema(
            name=stay_name,
            category=stay_cat,
            estimated_price_per_night=daily_stay_price,
            reason=stay_reason
        ),
        transportation=TransportationSchema(
            primary_mode=primary_transport,
            recommendation=transport_recommendation
        ),
        days=days_list,
        budget_breakdown=BudgetBreakdownSchema(
            accommodation=round(total_stay_cost, 2),
            food=round(total_meals_cost, 2),
            transportation=round(total_trans_cost, 2),
            activities=round(total_activity_cost, 2),
            miscellaneous=round(misc_budget, 2),
            total=grand_total
        ),
        tips=tips,
        alternatives=alternatives
    )
