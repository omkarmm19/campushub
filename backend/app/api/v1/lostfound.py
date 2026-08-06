from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.lostfound import LostFoundPost, LostFoundImage
from app.schemas.lostfound import LostFoundPostCreate, LostFoundPostUpdate, LostFoundPostResponse, LostFoundImageSchema
from app.dependencies import get_current_user
from app.core.cloudinary import upload_image_to_cloudinary

router = APIRouter(prefix="/lost-found", tags=["Lost & Found"])


@router.get("", response_model=List[LostFoundPostResponse])
def list_posts(
    post_type: Optional[str] = Query(None, description="'lost' or 'found'"),
    is_resolved: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(LostFoundPost).filter(LostFoundPost.is_active == True)
    if post_type:
        query = query.filter(LostFoundPost.post_type == post_type)
    if is_resolved is not None:
        query = query.filter(LostFoundPost.is_resolved == is_resolved)
    return query.order_by(LostFoundPost.created_at.desc()).all()


@router.post("", response_model=LostFoundPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_in: LostFoundPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = LostFoundPost(
        user_id=current_user.id,
        post_type=post_in.post_type,
        title=post_in.title,
        description=post_in.description,
        location=post_in.location,
        incident_date=post_in.incident_date,
        whatsapp=post_in.whatsapp,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/{id}", response_model=LostFoundPostResponse)
def get_post(id: int, db: Session = Depends(get_db)):
    post = db.query(LostFoundPost).filter(LostFoundPost.id == id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return post


@router.put("/{id}", response_model=LostFoundPostResponse)
def update_post(
    id: int,
    post_in: LostFoundPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(LostFoundPost).filter(LostFoundPost.id == id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
    for field, value in post_in.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(LostFoundPost).filter(LostFoundPost.id == id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
    db.delete(post)
    db.commit()
    return None


@router.post("/{id}/images", response_model=List[LostFoundImageSchema])
async def upload_post_images(
    id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(LostFoundPost).filter(LostFoundPost.id == id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    uploaded = []
    for idx, file in enumerate(files):
        content = await file.read()
        image_url = upload_image_to_cloudinary(content, folder_type="lost_found")
        img = LostFoundImage(post_id=post.id, image_url=image_url, display_order=idx)
        db.add(img)
        uploaded.append(img)

    db.commit()
    for img in uploaded:
        db.refresh(img)
    return uploaded
