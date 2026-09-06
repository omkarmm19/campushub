from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, ConfigDict
from app.db.session import get_db
from app.models.saved import SavedPost
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/saved", tags=["Saved Posts"])

VALID_MODULES = {"housing", "marketplace", "lostfound", "opportunities", "events"}


class SaveRequest(BaseModel):
    module: str
    post_id: int


class SavedPostOut(BaseModel):
    id: int
    module: str
    post_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[SavedPostOut])
def get_saved_posts(
    module: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all saved posts for the current user, optionally filtered by module."""
    query = db.query(SavedPost).filter(SavedPost.user_id == current_user.id)
    if module:
        query = query.filter(SavedPost.module == module)
    return query.order_by(SavedPost.created_at.desc()).all()


@router.post("", response_model=SavedPostOut, status_code=status.HTTP_201_CREATED)
def save_post(
    body: SaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a post. Silently succeeds if already saved (idempotent)."""
    if body.module not in VALID_MODULES:
        raise HTTPException(status_code=400, detail=f"Invalid module. Choose from: {', '.join(VALID_MODULES)}")

    saved = SavedPost(user_id=current_user.id, module=body.module, post_id=body.post_id)
    db.add(saved)
    try:
        db.commit()
        db.refresh(saved)
    except IntegrityError:
        db.rollback()
        # Already saved — return the existing record
        saved = db.query(SavedPost).filter_by(user_id=current_user.id, module=body.module, post_id=body.post_id).first()
    return saved


@router.delete("/{module}/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_post(
    module: str,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a saved post (unsave/unbookmark)."""
    saved = db.query(SavedPost).filter_by(user_id=current_user.id, module=module, post_id=post_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Not found in saved posts.")
    db.delete(saved)
    db.commit()
    return None


@router.get("/check/{module}/{post_id}")
def check_saved(
    module: str,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check if a post is saved by the current user."""
    exists = db.query(SavedPost).filter_by(user_id=current_user.id, module=module, post_id=post_id).first()
    return {"saved": exists is not None}
