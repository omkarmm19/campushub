from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, Text, Date, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class HousingListing(Base):
    __tablename__ = "housing_listings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 'room_available' or 'roommate_needed'
    listing_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    rent_per_person: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    security_deposit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    distance_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)

    # 'single', 'double', 'triple', 'other'
    sharing_type: Mapped[str] = mapped_column(String(20), nullable=False)

    available_from: Mapped[date] = mapped_column(Date, nullable=False)
    amenities: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    whatsapp: Mapped[str] = mapped_column(String(15), nullable=False)

    # Roommate specific preferences
    pref_veg: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    pref_smoking: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    pref_study_friendly: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    pref_sleep_schedule: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", backref="housing_listings")
    images: Mapped[List["HousingImage"]] = relationship("HousingImage", back_populates="listing", cascade="all, delete-orphan")


class HousingImage(Base):
    __tablename__ = "housing_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("housing_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationship
    listing: Mapped["HousingListing"] = relationship("HousingListing", back_populates="images")
