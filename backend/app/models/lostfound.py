from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Text, DateTime, Boolean, Date, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class LostFoundPost(Base):
    __tablename__ = "lostfound_posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 'lost' or 'found'
    post_type: Mapped[str] = mapped_column(String(10), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Where it was lost/found
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Date when it was lost/found
    incident_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    whatsapp: Mapped[str] = mapped_column(String(15), nullable=False)

    # Resolved = item returned to owner / case closed
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship("User", backref="lostfound_posts")
    images: Mapped[List["LostFoundImage"]] = relationship(
        "LostFoundImage", back_populates="post", cascade="all, delete-orphan"
    )


class LostFoundImage(Base):
    __tablename__ = "lostfound_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("lostfound_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    post: Mapped["LostFoundPost"] = relationship("LostFoundPost", back_populates="images")
