from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, OtpVerificationRequest, ForgotPasswordRequest
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=dict)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    return AuthService.login(db, credentials)

@router.post("/register", response_model=dict)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return AuthService.register(db, request)

@router.post("/verify-otp", response_model=dict)
def verify_otp(request: OtpVerificationRequest):
    if len(request.otp) == 6:
        return {"success": True, "message": "OTP verified successfully"}
    raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter valid 6-digit OTP.")

@router.post("/forgot-password", response_model=dict)
def forgot_password(request: ForgotPasswordRequest):
    return {"success": True, "message": f"Reset link & OTP sent to {request.identifier}"}

@router.get("/me", response_model=dict)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    user_dict = {
        "id": current_user.id,
        "role": current_user.role.value,
        "name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profilePic": current_user.profile_image or 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        "currentLocation": "Home – Mysuru",
        "referralCode": current_user.referral_code or f"AGW{current_user.id[:4].upper()}"
    }
    return user_dict
