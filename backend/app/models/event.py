from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Text, DateTime, Boolean, Date, Time, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import datetime as dt


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)

    # 'technical', 'cultural', 'sports', 'seminar', 'other'
    event_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    description: Mapped[str] = mapped_column(Text, nullable=False)
    venue: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    event_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    event_time: Mapped[Optional[dt.time]] = mapped_column(Time, nullable=True)

    registration_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    poster_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", backref="events")
