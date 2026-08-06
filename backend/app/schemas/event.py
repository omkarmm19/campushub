import datetime as dt
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class EventCreate(BaseModel):
    title: str
    event_type: str        # 'technical', 'cultural', 'sports', 'seminar', 'other'
    description: str
    venue: Optional[str] = None
    event_date: Optional[date] = None
    event_time: Optional[dt.time] = None
    registration_link: Optional[str] = None
    poster_url: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[date] = None
    event_time: Optional[dt.time] = None
    registration_link: Optional[str] = None
    poster_url: Optional[str] = None
    is_active: Optional[bool] = None


class EventResponse(BaseModel):
    id: int
    user_id: int
    user: UserResponse
    title: str
    event_type: str
    description: str
    venue: Optional[str] = None
    event_date: Optional[date] = None
    event_time: Optional[dt.time] = None
    registration_link: Optional[str] = None
    poster_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
