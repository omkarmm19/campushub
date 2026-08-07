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

# High-quality fallback images when real Cloudinary API keys are not yet configured
FALLBACK_IMAGES = {
    "housing": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    "marketplace": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    "lost_found": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80",
    "opportunities": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    "events": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
}


def is_dummy_cloudinary_config() -> bool:
    key = (settings.CLOUDINARY_API_KEY or "").strip()
    return not key or key == "your_api_key" or "your_" in key


def upload_image_to_cloudinary(file_bytes: bytes, folder_type: str = "housing") -> str:
    """
    Upload raw image bytes to Cloudinary and return public CDN URL.
    If Cloudinary API keys are not configured yet, returns a demo fallback image.
    """
    if is_dummy_cloudinary_config():
        print(f"Cloudinary API key not configured. Using demo fallback image for {folder_type}.")
        return FALLBACK_IMAGES.get(folder_type, FALLBACK_IMAGES["housing"])

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
        # Fallback to demo image on error so form submission does not fail completely
        return FALLBACK_IMAGES.get(folder_type, FALLBACK_IMAGES["housing"])


def delete_image_from_cloudinary(public_id: str) -> bool:
    """
    Delete image from Cloudinary by public ID.
    """
    if is_dummy_cloudinary_config():
        return True
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception:
        return False
