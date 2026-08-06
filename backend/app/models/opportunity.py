from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Text, DateTime, Boolean, Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)

    # 'internship', 'hackathon', 'workshop', 'competition', 'other'
    opp_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    organization: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    apply_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", backref="opportunities")
