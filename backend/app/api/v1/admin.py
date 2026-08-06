from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.housing import HousingListing
from app.models.marketplace import MarketplaceItem
from app.models.lostfound import LostFoundPost
from app.models.opportunity import Opportunity
from app.models.event import Event
from app.schemas.user import UserResponse
from app.schemas.housing import HousingListingResponse
from app.schemas.marketplace import MarketplaceItemResponse
from app.schemas.lostfound import LostFoundPostResponse
from app.schemas.opportunity import OpportunityResponse
from app.schemas.event import EventResponse
from app.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user


class StatsResponse(BaseModel):
    total_users: int
    total_housing: int
    total_marketplace: int
    total_lostfound: int
    total_opportunities: int
    total_events: int


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Platform-wide statistics for admin dashboard."""
    return StatsResponse(
        total_users=db.query(User).count(),
        total_housing=db.query(HousingListing).count(),
        total_marketplace=db.query(MarketplaceItem).count(),
        total_lostfound=db.query(LostFoundPost).count(),
        total_opportunities=db.query(Opportunity).count(),
        total_events=db.query(Event).count(),
    )


# ─── Users Management ──────────────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(User).offset(skip).limit(limit).all()


@router.put("/users/{user_id}/toggle-admin", response_model=UserResponse)
def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify your own admin status.")
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself.")
    db.delete(user)
    db.commit()
    return None


# ─── Content Moderation ────────────────────────────────────────────

@router.get("/housing", response_model=List[HousingListingResponse])
def admin_list_housing(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(HousingListing).order_by(HousingListing.created_at.desc()).all()


@router.delete("/housing/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_housing(id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(HousingListing).filter(HousingListing.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")
    db.delete(item)
    db.commit()
    return None


@router.get("/marketplace", response_model=List[MarketplaceItemResponse])
def admin_list_marketplace(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(MarketplaceItem).order_by(MarketplaceItem.created_at.desc()).all()


@router.delete("/marketplace/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_marketplace(id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")
    db.delete(item)
    db.commit()
    return None


@router.get("/lost-found", response_model=List[LostFoundPostResponse])
def admin_list_lostfound(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(LostFoundPost).order_by(LostFoundPost.created_at.desc()).all()


@router.delete("/lost-found/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_lostfound(id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(LostFoundPost).filter(LostFoundPost.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")
    db.delete(item)
    db.commit()
    return None


@router.get("/opportunities", response_model=List[OpportunityResponse])
def admin_list_opportunities(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Opportunity).order_by(Opportunity.created_at.desc()).all()


@router.delete("/opportunities/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_opportunity(id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")
    db.delete(item)
    db.commit()
    return None


@router.get("/events", response_model=List[EventResponse])
def admin_list_events(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Event).order_by(Event.created_at.desc()).all()


@router.delete("/events/{id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_event(id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.query(Event).filter(Event.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")
    db.delete(item)
    db.commit()
    return None
