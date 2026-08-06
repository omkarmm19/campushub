from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class OpportunityCreate(BaseModel):
    title: str
    opp_type: str           # 'internship', 'hackathon', 'workshop', 'competition', 'other'
    organization: Optional[str] = None
    description: str
    deadline: Optional[date] = None
    apply_link: Optional[str] = None


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    opp_type: Optional[str] = None
    organization: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    apply_link: Optional[str] = None
    is_active: Optional[bool] = None


class OpportunityResponse(BaseModel):
    id: int
    user_id: int
    user: UserResponse
    title: str
    opp_type: str
    organization: Optional[str] = None
    description: str
    deadline: Optional[date] = None
    apply_link: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
