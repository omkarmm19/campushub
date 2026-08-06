from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class LostFoundImageSchema(BaseModel):
    id: int
    image_url: str
    display_order: int
    model_config = ConfigDict(from_attributes=True)


class LostFoundPostCreate(BaseModel):
    post_type: str          # 'lost' or 'found'
    title: str
    description: str
    location: Optional[str] = None
    incident_date: Optional[date] = None
    whatsapp: str


class LostFoundPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    incident_date: Optional[date] = None
    whatsapp: Optional[str] = None
    is_resolved: Optional[bool] = None
    is_active: Optional[bool] = None


class LostFoundPostResponse(BaseModel):
    id: int
    user_id: int
    user: UserResponse
    post_type: str
    title: str
    description: str
    location: Optional[str] = None
    incident_date: Optional[date] = None
    whatsapp: str
    is_resolved: bool
    is_active: bool
    created_at: datetime
    images: List[LostFoundImageSchema] = []

    model_config = ConfigDict(from_attributes=True)
