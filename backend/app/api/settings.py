from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings
import httpx

router = APIRouter(prefix="/settings", tags=["Settings"])

class AIConfigRequest(BaseModel):
    api_key: Optional[str] = None
    model: Optional[str] = "gemini-1.5-flash"

@router.get("/ai-config")
def get_ai_config():
    masked_key = ""
    if settings.AI_API_KEY:
        masked_key = settings.AI_API_KEY[:4] + "..." + settings.AI_API_KEY[-4:] if len(settings.AI_API_KEY) > 8 else "***"
    return {
        "is_configured": bool(settings.AI_API_KEY),
        "model": settings.AI_MODEL,
        "masked_key": masked_key
    }

@router.post("/ai-config")
async def update_ai_config(req: AIConfigRequest):
    if req.api_key is not None:
        key_clean = req.api_key.strip()
        settings.AI_API_KEY = key_clean

    if req.model:
        settings.AI_MODEL = req.model.strip()

    # If key was provided, verify it with a lightweight test call
    verification_status = "untested"
    if settings.AI_API_KEY:
        try:
            test_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}?key={settings.AI_API_KEY}"
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(test_url)
                if resp.status_code == 200:
                    verification_status = "verified_working"
                else:
                    verification_status = f"api_error_{resp.status_code}"
        except Exception as e:
            verification_status = f"connection_error: {str(e)}"

    return {
        "message": "AI configuration updated successfully",
        "is_configured": bool(settings.AI_API_KEY),
        "model": settings.AI_MODEL,
        "verification_status": verification_status
    }
