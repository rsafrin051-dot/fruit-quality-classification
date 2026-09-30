"""
Fruit Quality guidance and recommendations module.
Provides edibility, health safety, and storage advice based on classification results.
"""

FRUIT_QUALITY_INFO = {
    "Fresh": {
        "status": "Safe & Healthy to Consume",
        "quality_level": "Premium Freshness",
        "description": "The fruit appears firm, naturally colored, and free from surface degradation, mold, or rotting patches.",
        "storage_tips": [
            "Store in a cool, dry place or refrigerate at 4°C to prolong freshness.",
            "Keep away from high-ethylene producing fruits (like overripe bananas) if trying to delay ripening.",
            "Wash thoroughly under running water immediately before consumption."
        ],
        "shelf_life": "Estimated 4 - 7 days under standard refrigeration.",
        "action": "Ready for direct consumption, juices, salads, or cooking."
    },
    "Rotten": {
        "status": "Not Safe for Consumption",
        "quality_level": "Spoiled / Degraded",
        "description": "Visual indicators suggest microbial decay, discoloration, fungal growth, or tissue softening.",
        "storage_tips": [
            "Discard or separate immediately from fresh produce to prevent cross-contamination.",
            "Do not consume raw or cooked, as mycotoxins can penetrate deeply into soft fruit tissue.",
            "Ideal for organic composting or biogas production rather than landfill disposal."
        ],
        "shelf_life": "Expired / Unsafe.",
        "action": "Safely compost or dispose of in organic waste."
    }
}


def get_fruit_quality_info(category: str) -> dict:
    """
    Retrieve fruit quality advice and recommendations.
    Supports binary categories ('Fresh', 'Rotten') as well as
    compound fruit categories (e.g., 'Apple_Fresh', 'Banana_Rotten', 'Orange Fresh').
    """
    # Direct match
    if category in FRUIT_QUALITY_INFO:
        return FRUIT_QUALITY_INFO[category]

    # Compound name parsing (e.g. 'Apple_Fresh' -> 'Fresh', 'Banana_Rotten' -> 'Rotten')
    normalized = category.lower().replace("-", "_").replace(" ", "_")
    if "fresh" in normalized:
        base = FRUIT_QUALITY_INFO["Fresh"].copy()
        fruit_name = category.replace("_Fresh", "").replace(" Fresh", "").title()
        base["fruit_detected"] = fruit_name
        return base
    elif "rotten" in normalized or "bad" in normalized or "spoiled" in normalized:
        base = FRUIT_QUALITY_INFO["Rotten"].copy()
        fruit_name = category.replace("_Rotten", "").replace(" Rotten", "").title()
        base["fruit_detected"] = fruit_name
        return base

    # Fallback default
    return {
        "status": "Evaluated",
        "quality_level": "Standard Assessment",
        "description": f"Classified as {category}. Inspect fruit texture and aroma before consumption.",
        "storage_tips": [
            "Store in a cool, well-ventilated environment.",
            "Check for firm texture and natural aroma."
        ],
        "shelf_life": "Inspect individual fruit condition.",
        "action": "Verify visually and follow food safety standards."
    }
