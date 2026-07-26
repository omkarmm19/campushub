import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, status
from app.core.config import settings

# Initialize Cloudinary SDK
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

FOLDERS = {
    "housing": "campushub/housing",
    "marketplace": "campushub/marketplace",
    "lost_found": "campushub/lost_found",
    "opportunities": "campushub/opportunities",
    "events": "campushub/events",
}


def upload_image_to_cloudinary(file_bytes: bytes, folder_type: str = "housing") -> str:
    """
    Upload raw image bytes to Cloudinary and return public CDN URL.
    """
    try:
        folder = FOLDERS.get(folder_type, "campushub/misc")
        upload_result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="image",
        )
        return upload_result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}",
        )


def delete_image_from_cloudinary(public_id: str) -> bool:
    """
    Delete image from Cloudinary by public ID.
    """
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception:
        return False
