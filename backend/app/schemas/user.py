from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    name: str
    reg_number: str
    college_email: EmailStr
    phone: str
    block_number: str
    room_number: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    block_number: Optional[str] = None
    room_number: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_suspended: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
