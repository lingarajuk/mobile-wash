import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.employee import Employee, EmployeeStatus
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.auth import LoginRequest, RegisterRequest

class AuthService:
    @staticmethod
    def login(db: Session, credentials: LoginRequest) -> dict:
        # Search by email or phone
        user = db.query(User).filter(
            (User.email == credentials.identifier) | (User.phone == credentials.identifier)
        ).first()
        
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/phone or password credentials."
            )
            
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been deactivated. Please contact support."
            )
            
        access_token = create_access_token(subject=user.id, role=user.role.value)
        
        user_dict = {
            "id": user.id,
            "role": user.role.value,
            "name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "profilePic": user.profile_image or 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            "currentLocation": "Home - Mysuru",
            "referralCode": user.referral_code or f"AGW{user.id[:4].upper()}"
        }
        
        if user.role == UserRole.EMPLOYEE and user.employee_profile:
            user_dict.update({
                "rating": user.employee_profile.rating,
                "completedJobs": user.employee_profile.completed_jobs,
                "todayEarnings": float(user.employee_profile.today_earnings),
                "totalEarnings": float(user.employee_profile.total_earnings),
                "status": user.employee_profile.status.value,
                "location": user.employee_profile.current_location or "Mysuru"
            })
            
        return {
            "success": True,
            "token": access_token,
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.role.value,
            "user": user_dict
        }

    @staticmethod
    def register(db: Session, request: RegisterRequest) -> dict:
        existing = db.query(User).filter(
            (User.email == request.email) | (User.phone == request.phone)
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address or phone number already exists."
            )
            
        role_enum = UserRole.CUSTOMER
        if request.role.lower() == "employee":
            role_enum = UserRole.EMPLOYEE
        elif request.role.lower() == "admin":
            role_enum = UserRole.ADMIN

        ref_code = f"AGW{request.phone[-4:]}"
        new_user = User(
            id=str(uuid.uuid4()),
            full_name=request.full_name,
            email=request.email,
            phone=request.phone,
            password_hash=get_password_hash(request.password),
            role=role_enum,
            referral_code=ref_code,
            is_active=True
        )
        db.add(new_user)
        
        if role_enum == UserRole.EMPLOYEE:
            emp = Employee(
                id=f"emp-{int(uuid.uuid4().int % 10000)}",
                user_id=new_user.id,
                designation="Wash Specialist",
                status=EmployeeStatus.AVAILABLE
            )
            db.add(emp)

        db.commit()
        db.refresh(new_user)
        
        access_token = create_access_token(subject=new_user.id, role=new_user.role.value)
        
        user_dict = {
            "id": new_user.id,
            "role": new_user.role.value,
            "name": new_user.full_name,
            "email": new_user.email,
            "phone": new_user.phone,
            "profilePic": 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            "currentLocation": "Home - Mysuru",
            "referralCode": new_user.referral_code
        }
        
        return {
            "success": True,
            "token": access_token,
            "user": user_dict
        }
