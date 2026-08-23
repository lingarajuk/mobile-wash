from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os, uuid
from datetime import datetime
from app.database.connection import get_db
from app.core.dependencies import get_current_user, require_customer, require_admin
from app.models.user import User, UserRole
from app.models.booking import Booking, BookingPhoto
from app.models.review import Review
from app.schemas.booking import (
    BookingCreateRequest,
    BookingReviewCreate,
    BookingStatusUpdateRequest,
    RejectBookingRequest,
    AssignTechnicianRequest,
    RescheduleBookingRequest,
    CancelBookingRequest,
    BookingLocationUpdate,
    VehicleInspectionCreate
)
from app.services.booking_service import BookingService
from app.core.config import settings

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/upload-photo", response_model=dict)
async def upload_general_photo(
    file: UploadFile = File(...),
    photo_type: str = Form("VEHICLE_PHOTO")
):
    """Uploads a vehicle photo before or during booking creation and returns the static URL."""
    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_name = f"{photo_type.lower()}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIRECTORY, unique_name)

    content = await file.read()
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 15MB.")

    with open(filepath, "wb") as buffer:
        buffer.write(content)

    photo_url = f"/static/uploads/{unique_name}"
    return {"success": True, "fileUrl": photo_url, "photoType": photo_type}

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
            bookings = [b for b in bookings if str(b.status).lower() in ['pending verification', 'pending', 'verified', 'confirmed', 'assigned']]
        elif st == 'ongoing':
            bookings = [b for b in bookings if str(b.status).lower() in ['accepted', 'on the way', 'arrived', 'in progress']]
        elif st == 'completed':
            bookings = [b for b in bookings if str(b.status).lower() == 'completed']
        elif st == 'cancelled':
            bookings = [b for b in bookings if str(b.status).lower() in ['cancelled', 'rejected']]

    return [BookingService.format_booking_response(db, b) for b in bookings]

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

    return BookingService.format_booking_response(db, b)

@router.get("/{booking_id}/timeline", response_model=List[dict])
def get_booking_timeline_api(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.get_booking_timeline(db, booking_id)

@router.put("/{booking_id}/verify", response_model=dict)
def verify_booking_api(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return BookingService.verify_booking(db, booking_id, current_user)

@router.put("/{booking_id}/reject", response_model=dict)
def reject_booking_api(
    booking_id: str,
    request: RejectBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return BookingService.reject_booking(db, booking_id, current_user, request.reason)

@router.put("/{booking_id}/assign", response_model=dict)
def assign_technician_api(
    booking_id: str,
    request: AssignTechnicianRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return BookingService.assign_technician(db, booking_id, request.employeeId, current_user)

@router.put("/{booking_id}/status", response_model=dict)
def update_booking_status_general(
    booking_id: str,
    data: BookingStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.update_status(
        db,
        booking_id=booking_id,
        new_status=data.status,
        progress_step=data.progressStep,
        changed_by_user=current_user,
        note=data.notes
    )

@router.put("/{booking_id}/reschedule", response_model=dict)
def reschedule_booking_api(
    booking_id: str,
    data: RescheduleBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.reschedule_booking(
        db,
        booking_id=booking_id,
        new_date=data.date,
        new_slot=data.timeSlot,
        user=current_user,
        reason=data.reason
    )

@router.put("/{booking_id}/cancel", response_model=dict)
def cancel_booking_api(
    booking_id: str,
    data: Optional[CancelBookingRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reason = data.reason if data else "User requested cancellation"
    return BookingService.cancel_booking(db, booking_id, current_user, reason)

@router.post("/{booking_id}/photos", response_model=dict)
async def upload_booking_photos_api(
    booking_id: str,
    photo_type: str = Form("BEFORE"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{booking_id}_{photo_type.lower()}_{uuid.uuid4().hex[:6]}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIRECTORY, filename)

    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    photo_url = f"/static/uploads/{filename}"
    emp_id = current_user.employee_profile.id if current_user.employee_profile else None
    res = BookingService.add_booking_photo(
        db,
        booking_id=booking_id,
        photo_type=photo_type,
        file_url=photo_url,
        employee_id=emp_id,
        user_id=current_user.id
    )
    return {"success": True, "photo": res, "fileUrl": photo_url}

@router.get("/{booking_id}/photos", response_model=List[dict])
def get_booking_photos_api(
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

@router.post("/{booking_id}/location", response_model=dict)
def update_booking_location_api(
    booking_id: str,
    location_data: BookingLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    emp_id = current_user.employee_profile.id if current_user.employee_profile else None
    return BookingService.update_live_location(db, booking_id, location_data, emp_id)

@router.get("/{booking_id}/location", response_model=dict)
def get_booking_location_api(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.get_live_location(db, booking_id)

@router.post("/{booking_id}/inspection", response_model=dict)
def save_vehicle_inspection_api(
    booking_id: str,
    inspection_data: VehicleInspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BookingService.save_vehicle_inspection(
        db,
        booking_id=booking_id,
        data=inspection_data,
        inspector_name=current_user.full_name
    )

@router.get("/{booking_id}/inspection", response_model=dict)
def get_vehicle_inspection_api(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = BookingService.get_vehicle_inspection(db, booking_id)
    return res or {}

@router.post("/{booking_id}/review", response_model=dict)
def submit_customer_review_api(
    booking_id: str,
    data: BookingReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    return BookingService.create_customer_review(db, booking_id, current_user, data)

@router.get("/{booking_id}/review", response_model=dict)
def get_customer_review_api(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rev = db.query(Review).filter(Review.booking_id == booking_id).first()
    if not rev:
        return {}
    return {
        "id": rev.id,
        "rating": rev.rating,
        "comment": rev.comment,
        "customerName": rev.customer.full_name if rev.customer else "Customer",
        "createdAt": rev.created_at.strftime("%Y-%m-%d")
    }
