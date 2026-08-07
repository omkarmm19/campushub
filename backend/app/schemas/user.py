from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
import re


def normalize_phone_number(v: Optional[str]) -> Optional[str]:
    if not v:
        return v
    digits = re.sub(r"\D", "", v)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    return digits


class UserBase(BaseModel):
    name: str
    reg_number: str
    college_email: EmailStr
    phone: str
    block_number: str
    room_number: str

    @field_validator("phone")
    @classmethod
    def validate_and_normalize_phone(cls, v: str) -> str:
        cleaned = normalize_phone_number(v)
        if not cleaned or len(cleaned) != 10:
            raise ValueError("Phone number must be a valid 10-digit number.")
        return cleaned


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    block_number: Optional[str] = None
    room_number: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_and_normalize_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = normalize_phone_number(v)
        if not cleaned or len(cleaned) != 10:
            raise ValueError("Phone number must be a valid 10-digit number.")
        return cleaned


class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_suspended: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
