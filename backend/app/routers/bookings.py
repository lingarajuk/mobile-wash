from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os, uuid
from datetime import datetime
from app.database.connection import get_db
from app.core.dependencies import get_current_user, require_customer
from app.models.user import User, UserRole
from app.models.booking import Booking, BookingStatus, BookingPhoto
from app.models.review import Review
from app.schemas.booking import BookingCreateRequest, BookingReviewCreate, BookingOut
from app.services.booking_service import BookingService
from app.core.config import settings

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_booking(
    request: BookingCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    return BookingService.create_booking(db, current_user, request)

@router.get("", response_model=List[dict])
def get_user_bookings(
    statusTab: Optional[str] = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Booking)
    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(Booking.customer_id == current_user.id)
    elif current_user.role == UserRole.EMPLOYEE and current_user.employee_profile:
        query = query.filter(Booking.employee_id == current_user.employee_profile.id)

    bookings = query.order_by(Booking.created_at.desc()).all()

    if statusTab and statusTab != 'all':
        st = statusTab.lower()
        if st == 'upcoming':
            bookings = [b for b in bookings if b.status.value.lower() in ['pending', 'confirmed', 'assigned']]
        elif st == 'ongoing':
            bookings = [b for b in bookings if b.status.value.lower() in ['accepted', 'on the way', 'arrived', 'in progress']]
        elif st == 'completed':
            bookings = [b for b in bookings if b.status.value.lower() == 'completed']
        elif st == 'cancelled':
            bookings = [b for b in bookings if b.status.value.lower() == 'cancelled']

    return [BookingService.format_booking_response(b) for b in bookings]

@router.get("/{booking_id}", response_model=dict)
def get_booking_by_id(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == UserRole.CUSTOMER and b.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")

    return BookingService.format_booking_response(b)

@router.put("/{booking_id}/cancel", response_model=dict)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    if b.status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel a booking that is already {b.status.value}")

    b.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(b)
    return BookingService.format_booking_response(b)

@router.post("/{booking_id}/review", response_model=dict)
def submit_review(
    booking_id: str,
    data: BookingReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    b = db.query(Booking).filter(Booking.id == booking_id, Booking.customer_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    if b.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Reviews can only be submitted for completed bookings")

    existing = db.query(Review).filter(Review.booking_id == booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this booking")

    rev = Review(
        id=f"rev-{int(datetime.utcnow().timestamp())}",
        booking_id=booking_id,
        customer_id=current_user.id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(rev)
    db.commit()
    return {"success": True, "reviewId": rev.id}

@router.post("/{booking_id}/photos", response_model=dict)
async def upload_booking_photos(
    booking_id: str,
    photo_type: str = Form("BEFORE"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    filename = f"{booking_id}_{photo_type.lower()}_{uuid.uuid4().hex[:6]}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_DIRECTORY, filename)

    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    photo_url = f"/static/uploads/{filename}"
    photo = BookingPhoto(
        booking_id=booking_id,
        uploaded_by=current_user.id,
        photo_type=photo_type.upper(),
        file_url=photo_url
    )
    db.add(photo)
    db.commit()
    return {"success": True, "photoUrl": photo_url}

@router.get("/{booking_id}/photos", response_model=List[dict])
def get_booking_photos(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    photos = db.query(BookingPhoto).filter(BookingPhoto.booking_id == booking_id).all()
    return [
        {
            "id": p.id,
            "photoType": p.photo_type,
            "fileUrl": p.file_url,
            "createdAt": p.created_at.strftime("%Y-%m-%d %H:%M")
        } for p in photos
    ]
