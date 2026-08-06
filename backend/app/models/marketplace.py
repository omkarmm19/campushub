from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Text, DateTime, Boolean, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # 'book', 'gadget', 'clothing', 'furniture', 'stationary', 'other'
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    # 'new', 'good', 'fair', 'poor'
    condition: Mapped[str] = mapped_column(String(20), nullable=False)

    price: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    # 'sell', 'rent', 'free'
    listing_type: Mapped[str] = mapped_column(String(20), nullable=False, default="sell")

    whatsapp: Mapped[str] = mapped_column(String(15), nullable=False)

    is_sold: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", backref="marketplace_items")
    images: Mapped[List["MarketplaceImage"]] = relationship(
        "MarketplaceImage", back_populates="item", cascade="all, delete-orphan"
    )


class MarketplaceImage(Base):
    __tablename__ = "marketplace_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("marketplace_items.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationship
    item: Mapped["MarketplaceItem"] = relationship("MarketplaceItem", back_populates="images")
