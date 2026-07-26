from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch the currently authenticated student's profile information.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update student profile details (Name, Phone, Block, Room number).
    """
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.block_number is not None:
        current_user.block_number = user_update.block_number
    if user_update.room_number is not None:
        current_user.room_number = user_update.room_number

    db.commit()
    db.refresh(current_user)
    return current_user
