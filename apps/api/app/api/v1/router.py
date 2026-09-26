from fastapi import APIRouter
from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.community import router as community_router
from app.api.v1.health import router as health_router
from app.api.v1.history import router as history_router
from app.api.v1.reports import router as reports_router
from app.api.v1.scans import router as scans_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(scans_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(history_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(community_router)
api_v1_router.include_router(admin_router)
