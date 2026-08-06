from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.marketplace import MarketplaceItem, MarketplaceImage
from app.schemas.marketplace import MarketplaceItemCreate, MarketplaceItemUpdate, MarketplaceItemResponse, MarketplaceImageSchema
from app.dependencies import get_current_user
from app.core.cloudinary import upload_image_to_cloudinary

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


@router.get("", response_model=List[MarketplaceItemResponse])
def list_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    listing_type: Optional[str] = Query(None, description="sell, rent, or free"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    condition: Optional[str] = Query(None, description="Item condition"),
    db: Session = Depends(get_db),
):
    """
    List all active marketplace items with optional filters.
    """
    query = db.query(MarketplaceItem).filter(
        MarketplaceItem.is_active == True,
        MarketplaceItem.is_sold == False,
    )

    if category:
        query = query.filter(MarketplaceItem.category == category)
    if listing_type:
        query = query.filter(MarketplaceItem.listing_type == listing_type)
    if max_price is not None:
        query = query.filter(MarketplaceItem.price <= max_price)
    if condition:
        query = query.filter(MarketplaceItem.condition == condition)

    return query.order_by(MarketplaceItem.created_at.desc()).all()


@router.post("", response_model=MarketplaceItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item_in: MarketplaceItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new marketplace listing.
    """
    item = MarketplaceItem(
        user_id=current_user.id,
        title=item_in.title,
        description=item_in.description,
        category=item_in.category,
        condition=item_in.condition,
        price=item_in.price,
        listing_type=item_in.listing_type,
        whatsapp=item_in.whatsapp,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{id}", response_model=MarketplaceItemResponse)
def get_item(id: int, db: Session = Depends(get_db)):
    """
    Get a single marketplace item by ID.
    """
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    return item


@router.put("/{id}", response_model=MarketplaceItemResponse)
def update_item(
    id: int,
    item_in: MarketplaceItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update a marketplace listing. Owner or admin only.
    """
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    if item.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete a marketplace listing. Owner or admin only.
    """
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    if item.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    db.delete(item)
    db.commit()
    return None


@router.post("/{id}/images", response_model=List[MarketplaceImageSchema])
async def upload_item_images(
    id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload images for a marketplace item to Cloudinary.
    """
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    if item.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    uploaded = []
    for idx, file in enumerate(files):
        content = await file.read()
        image_url = upload_image_to_cloudinary(content, folder_type="marketplace")
        image_record = MarketplaceImage(
            item_id=item.id,
            image_url=image_url,
            display_order=idx,
        )
        db.add(image_record)
        uploaded.append(image_record)

    db.commit()
    for img in uploaded:
        db.refresh(img)

    return uploaded
