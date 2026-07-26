from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.housing import HousingListing, HousingImage
from app.schemas.housing import HousingListingCreate, HousingListingUpdate, HousingListingResponse, HousingImageSchema
from app.dependencies import get_current_user
from app.core.cloudinary import upload_image_to_cloudinary

router = APIRouter(prefix="/housing", tags=["Housing"])


@router.get("", response_model=List[HousingListingResponse])
def list_housing(
    listing_type: Optional[str] = Query(None, description="room_available or roommate_needed"),
    max_rent: Optional[int] = Query(None, description="Maximum rent per person"),
    max_distance: Optional[float] = Query(None, description="Maximum distance from college in km"),
    sharing_type: Optional[str] = Query(None, description="single, double, or triple"),
    db: Session = Depends(get_db),
):
    """
    List all active housing listings with optional filters.
    """
    query = db.query(HousingListing).filter(HousingListing.is_active == True)

    if listing_type:
        query = query.filter(HousingListing.listing_type == listing_type)
    if max_rent is not None:
        query = query.filter(HousingListing.rent_per_person <= max_rent)
    if max_distance is not None:
        query = query.filter(HousingListing.distance_km <= max_distance)
    if sharing_type:
        query = query.filter(HousingListing.sharing_type == sharing_type)

    listings = query.order_by(HousingListing.created_at.desc()).all()
    return listings


@router.post("", response_model=HousingListingResponse, status_code=status.HTTP_201_CREATED)
def create_housing(
    listing_in: HousingListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new housing listing (Room Available or Roommate Needed).
    """
    listing = HousingListing(
        user_id=current_user.id,
        listing_type=listing_in.listing_type,
        rent_per_person=listing_in.rent_per_person,
        security_deposit=listing_in.security_deposit,
        location=listing_in.location,
        distance_km=listing_in.distance_km,
        sharing_type=listing_in.sharing_type,
        available_from=listing_in.available_from,
        amenities=listing_in.amenities,
        description=listing_in.description,
        whatsapp=listing_in.whatsapp,
        pref_veg=listing_in.pref_veg,
        pref_smoking=listing_in.pref_smoking,
        pref_study_friendly=listing_in.pref_study_friendly,
        pref_sleep_schedule=listing_in.pref_sleep_schedule,
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get("/{id}", response_model=HousingListingResponse)
def get_housing(id: int, db: Session = Depends(get_db)):
    """
    Get detailed information for a single housing listing.
    """
    listing = db.query(HousingListing).filter(HousingListing.id == id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Housing listing not found.",
        )
    return listing


@router.put("/{id}", response_model=HousingListingResponse)
def update_housing(
    id: int,
    listing_in: HousingListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update own housing listing.
    """
    listing = db.query(HousingListing).filter(HousingListing.id == id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    if listing.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this listing.")

    update_data = listing_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_housing(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete own housing listing (or admin moderation delete).
    """
    listing = db.query(HousingListing).filter(HousingListing.id == id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    if listing.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this listing.")

    db.delete(listing)
    db.commit()
    return None


@router.post("/{id}/images", response_model=List[HousingImageSchema])
async def upload_housing_images(
    id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload photos for a housing listing to Cloudinary.
    """
    listing = db.query(HousingListing).filter(HousingListing.id == id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    if listing.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload images for this listing.")

    uploaded_images = []
    for idx, file in enumerate(files):
        content = await file.read()
        image_url = upload_image_to_cloudinary(content, folder_type="housing")
        image_record = HousingImage(
            listing_id=listing.id,
            image_url=image_url,
            display_order=idx,
        )
        db.add(image_record)
        uploaded_images.append(image_record)

    db.commit()
    for img in uploaded_images:
        db.refresh(img)

    return uploaded_images
