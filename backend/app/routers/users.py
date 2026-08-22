from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate

router = APIRouter(prefix="/users", tags=["Users Profile"])

@router.get("/me", response_model=dict)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "role": current_user.role.value,
        "name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profilePic": current_user.profile_image or 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        "currentLocation": "Home – Mysuru",
        "referralCode": current_user.referral_code
    }

@router.put("/me", response_model=dict)
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.name:
        current_user.full_name = data.name
    if data.email:
        current_user.email = data.email
    if data.phone:
        current_user.phone = data.phone
    if data.profilePic:
        current_user.profile_image = data.profilePic

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "role": current_user.role.value,
        "name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profilePic": current_user.profile_image,
        "currentLocation": data.currentLocation or "Home – Mysuru",
        "referralCode": current_user.referral_code
    }
