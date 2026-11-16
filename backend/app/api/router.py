from fastapi import APIRouter

from app.api import health

router = APIRouter()

# One aggregator so `main.py` stays untouched as routes are added.
router.include_router(health.router)
