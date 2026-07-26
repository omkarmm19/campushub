from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def root():
    return {"message": "CampusHub API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
