import os
import uuid
import shutil
from fastapi import UploadFile
from app.core.config import settings

class StorageService:
    @staticmethod
    def upload_image(file: UploadFile, folder: str = "aquago/vehicles") -> str:
        """
        Uploads image to Cloudinary if configured in environment variables;
        otherwise saves to local persistent upload directory.
        """
        cloudinary_url = os.getenv("CLOUDINARY_URL")
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        api_key = os.getenv("CLOUDINARY_API_KEY")
        api_secret = os.getenv("CLOUDINARY_API_SECRET")

        # If Cloudinary credentials are provided, use Cloudinary cloud storage
        if cloudinary_url or (cloud_name and api_key and api_secret):
            try:
                import cloudinary
                import cloudinary.uploader

                if not cloudinary_url:
                    cloudinary.config(
                        cloud_name=cloud_name,
                        api_key=api_key,
                        api_secret=api_secret,
                        secure=True
                    )
                
                # Upload to Cloudinary
                result = cloudinary.uploader.upload(
                    file.file,
                    folder=folder,
                    resource_type="image",
                    transformation=[
                        {"quality": "auto:good"},
                        {"fetch_format": "auto"}
                    ]
                )
                return result.get("secure_url") or result.get("url")
            except Exception as e:
                print(f"[StorageService] Cloudinary upload fallback to local: {e}")

        # Local storage fallback
        os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_filename = f"{uuid.uuid4().hex[:12]}{ext}"
        destination_path = os.path.join(settings.UPLOAD_DIRECTORY, unique_filename)

        file.file.seek(0)
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return f"/static/uploads/{unique_filename}"
