from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.housing import router as housing_router

app = FastAPI(
    title="CampusHub API",
    description="Backend API for CampusHub - A student community platform",
    version="1.0.0",
)

# CORS — allows the React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1 prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(housing_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "CampusHub API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
