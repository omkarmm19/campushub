from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.housing import router as housing_router
from app.api.v1.marketplace import router as marketplace_router
from app.api.v1.lostfound import router as lostfound_router
from app.api.v1.opportunities import router as opportunities_router
from app.api.v1.events import router as events_router
from app.api.v1.admin import router as admin_router
from app.api.v1.saved import router as saved_router

app = FastAPI(
    title="CampusHub API",
    description="Backend API for CampusHub - A student community platform",
    version="1.0.0",
)

from app.core.config import settings

# CORS — allows the React frontend (local dev & production deployments) to talk to this backend
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4173",
]
if settings.ALLOWED_ORIGINS:
    for custom_origin in settings.ALLOWED_ORIGINS.split(","):
        cleaned = custom_origin.strip()
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.netlify\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1 prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(housing_router, prefix="/api/v1")
app.include_router(marketplace_router, prefix="/api/v1")
app.include_router(lostfound_router, prefix="/api/v1")
app.include_router(opportunities_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(saved_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "CampusHub API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
