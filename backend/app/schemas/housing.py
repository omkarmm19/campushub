from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class HousingImageSchema(BaseModel):
    id: int
    image_url: str
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class HousingListingCreate(BaseModel):
    listing_type: str  # 'room_available' or 'roommate_needed'
    rent_per_person: int
    security_deposit: Optional[int] = None
    location: Optional[str] = None
    distance_km: Optional[float] = None
    sharing_type: str  # 'single', 'double', 'triple'
    available_from: date
    amenities: Optional[List[str]] = []
    description: str
    whatsapp: str
    pref_veg: Optional[bool] = None
    pref_smoking: Optional[bool] = None
    pref_study_friendly: Optional[bool] = None
    pref_sleep_schedule: Optional[str] = None


class HousingListingUpdate(BaseModel):
    rent_per_person: Optional[int] = None
    security_deposit: Optional[int] = None
    location: Optional[str] = None
    distance_km: Optional[float] = None
    sharing_type: Optional[str] = None
    available_from: Optional[date] = None
    amenities: Optional[List[str]] = None
    description: Optional[str] = None
    whatsapp: Optional[str] = None
    pref_veg: Optional[bool] = None
    pref_smoking: Optional[bool] = None
    pref_study_friendly: Optional[bool] = None
    pref_sleep_schedule: Optional[str] = None
    is_active: Optional[bool] = None


class HousingListingResponse(BaseModel):
    id: int
    user_id: int
    user: UserResponse
    listing_type: str
    rent_per_person: int
    security_deposit: Optional[int] = None
    location: Optional[str] = None
    distance_km: Optional[float] = None
    sharing_type: str
    available_from: date
    amenities: Optional[List[str]] = []
    description: str
    whatsapp: str
    pref_veg: Optional[bool] = None
    pref_smoking: Optional[bool] = None
    pref_study_friendly: Optional[bool] = None
    pref_sleep_schedule: Optional[str] = None
    is_active: bool
    created_at: datetime
    images: List[HousingImageSchema] = []

    model_config = ConfigDict(from_attributes=True)
