from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.core.dependencies import require_employee
from app.models.user import User
from app.models.employee import Employee, EmployeeStatus
from app.models.booking import Booking, BookingStatus
from app.services.booking_service import BookingService
from app.schemas.booking import BookingStatusUpdateRequest

router = APIRouter(prefix="/employee", tags=["Employee Portal"])

@router.get("/profile", response_model=dict)
def get_employee_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile record not found")

    return {
        "id": emp.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "photo": current_user.profile_image or "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
        "rating": emp.rating,
        "completedJobs": emp.completed_jobs,
        "todayEarnings": float(emp.today_earnings),
        "totalEarnings": float(emp.total_earnings),
        "status": emp.status.value,
        "location": emp.current_location or "Saraswathipuram, Mysuru"
    }

@router.put("/profile", response_model=dict)
def update_employee_profile(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")

    if "status" in data:
        st = data["status"]
        if st in ["Available", "On Job", "Offline"]:
            emp.status = EmployeeStatus(st)
    if "location" in data:
        emp.current_location = data["location"]

    db.commit()
    db.refresh(emp)

    return {
        "id": emp.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "photo": current_user.profile_image or "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
        "rating": emp.rating,
        "completedJobs": emp.completed_jobs,
        "todayEarnings": float(emp.today_earnings),
        "totalEarnings": float(emp.total_earnings),
        "status": emp.status.value,
        "location": emp.current_location or "Mysuru"
    }

@router.get("/jobs", response_model=List[dict])
def get_assigned_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        return []

    bookings = db.query(Booking).filter(
        Booking.employee_id == emp.id
    ).order_by(Booking.created_at.desc()).all()

    return [BookingService.format_booking_response(b) for b in bookings]

@router.get("/jobs/{booking_id}", response_model=dict)
def get_job_by_id(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Job booking not found")
    return BookingService.format_booking_response(b)

@router.put("/location", response_model=dict)
def update_employee_location(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")

    lat = data.get("latitude")
    lng = data.get("longitude")
    if lat is not None and lng is not None:
        loc = db.query(EmployeeLocation).filter(EmployeeLocation.employee_id == emp.id).first()
        if not loc:
            loc = EmployeeLocation(employee_id=emp.id, latitude=float(lat), longitude=float(lng))
            db.add(loc)
        else:
            loc.latitude = float(lat)
            loc.longitude = float(lng)
        db.commit()
    return {"success": True}

@router.put("/jobs/{booking_id}/accept", response_model=dict)
def accept_job(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Job booking not found")

    b.status = BookingStatus.ACCEPTED
    b.progress_step = 2
    if current_user.employee_profile:
        b.employee_id = current_user.employee_profile.id
        current_user.employee_profile.status = EmployeeStatus.ON_JOB

    BookingService.record_status_change(db, booking_id, "ACCEPTED", current_user.id, "Employee accepted job")
    BookingService.create_notification(
        db, b.customer_id,
        "Job Accepted 👍",
        f"Your wash specialist {current_user.full_name} accepted booking #{booking_id}."
    )

    db.commit()
    db.refresh(b)
    return BookingService.format_booking_response(b)

@router.put("/jobs/{booking_id}/status", response_model=dict)
def update_job_status(
    booking_id: str,
    data: BookingStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Job booking not found")

    st_mapping = {
        "Confirmed": (BookingStatus.CONFIRMED, 1, "Booking Confirmed", "Your booking is confirmed."),
        "Assigned": (BookingStatus.ASSIGNED, 1, "Professional Assigned", "Professional assigned."),
        "Accepted": (BookingStatus.ACCEPTED, 2, "Job Accepted", "Specialist accepted job."),
        "On The Way": (BookingStatus.ON_THE_WAY, 2, "Professional On The Way 🚗", f"{current_user.full_name} is on the way to your location!"),
        "Arrived": (BookingStatus.ARRIVED, 2, "Professional Arrived 📍", f"{current_user.full_name} has arrived at your location."),
        "In Progress": (BookingStatus.IN_PROGRESS, 3, "Wash In Progress 🧽", f"{current_user.full_name} started washing your vehicle."),
        "Completed": (BookingStatus.COMPLETED, 4, "Service Completed 🎉", f"Your service #{booking_id} is completed! Please leave a review."),
        "Cancelled": (BookingStatus.CANCELLED, 0, "Booking Cancelled ❌", f"Booking #{booking_id} was cancelled.")
    }
    
    if data.status in st_mapping:
        b_status, auto_step, notif_title, notif_msg = st_mapping[data.status]
        b.status = b_status
        b.progress_step = data.progressStep if data.progressStep is not None else auto_step
        
        BookingService.record_status_change(db, booking_id, b_status.value, current_user.id, f"Status updated to {b_status.value}")
        BookingService.create_notification(db, b.customer_id, notif_title, notif_msg)

    if b.status == BookingStatus.COMPLETED and current_user.employee_profile:
        current_user.employee_profile.completed_jobs += 1
        current_user.employee_profile.status = EmployeeStatus.AVAILABLE
        current_user.employee_profile.today_earnings = float(current_user.employee_profile.today_earnings) + float(b.total_amount) * 0.4
        current_user.employee_profile.total_earnings = float(current_user.employee_profile.total_earnings) + float(b.total_amount) * 0.4

    db.commit()
    db.refresh(b)
    return BookingService.format_booking_response(b)
