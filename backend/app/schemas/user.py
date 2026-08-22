from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    profile_image: Optional[str] = None
    referral_code: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profilePic: Optional[str] = None
    currentLocation: Optional[str] = None

class UserOut(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Frontend compatible shape wrapper
class FrontendUserOut(BaseModel):
    id: str
    role: str
    name: str
    email: str
    phone: str
    profilePic: Optional[str] = None
    currentLocation: Optional[str] = None
    referralCode: Optional[str] = None
    membership: Optional[dict] = None
