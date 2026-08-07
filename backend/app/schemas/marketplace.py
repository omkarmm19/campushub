from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.user import UserResponse, normalize_phone_number


class MarketplaceImageSchema(BaseModel):
    id: int
    image_url: str
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class MarketplaceItemCreate(BaseModel):
    title: str
    description: str
    category: str          # 'book', 'gadget', 'clothing', 'furniture', 'stationary', 'other'
    condition: str         # 'new', 'good', 'fair', 'poor'
    price: int
    listing_type: str = "sell"  # 'sell', 'rent', 'free'
    whatsapp: str

    @field_validator("whatsapp")
    @classmethod
    def validate_whatsapp(cls, v: str) -> str:
        cleaned = normalize_phone_number(v)
        if not cleaned or len(cleaned) != 10:
            raise ValueError("WhatsApp number must be a valid 10-digit number.")
        return cleaned


class MarketplaceItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    price: Optional[int] = None
    listing_type: Optional[str] = None
    whatsapp: Optional[str] = None
    is_sold: Optional[bool] = None
    is_active: Optional[bool] = None

    @field_validator("whatsapp")
    @classmethod
    def validate_whatsapp(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = normalize_phone_number(v)
        if not cleaned or len(cleaned) != 10:
            raise ValueError("WhatsApp number must be a valid 10-digit number.")
        return cleaned


class MarketplaceItemResponse(BaseModel):
    id: int
    user_id: int
    user: UserResponse
    title: str
    description: str
    category: str
    condition: str
    price: int
    listing_type: str
    whatsapp: str
    is_sold: bool
    is_active: bool
    created_at: datetime
    images: List[MarketplaceImageSchema] = []

    model_config = ConfigDict(from_attributes=True)
