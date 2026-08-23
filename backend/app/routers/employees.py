from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
import os, uuid
from datetime import datetime, date, timedelta
from app.database.connection import get_db
from app.core.dependencies import require_employee, get_current_user
from app.models.user import User, UserRole
from app.models.employee import Employee, EmployeeStatus
from app.models.booking import (
    Booking, BookingStatus, BookingPhoto, BookingLocation,
    VehicleInspection, BookingWorkUpdate
)
from app.models.review import Review
from app.services.booking_service import BookingService
from app.schemas.booking import (
    BookingStatusUpdateRequest,
    BookingLocationUpdate,
    VehicleInspectionCreate
)
from app.core.config import settings

router = APIRouter(prefix="/employee", tags=["Employee Portal"])

@router.get("/profile", response_model=dict)
def get_employee_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile record not found")

    # Real statistics from MySQL
    all_assigned = db.query(Booking).filter(Booking.employee_id == emp.id).all()
    total_assigned_count = len(all_assigned)
    completed_count = sum(1 for b in all_assigned if str(b.status).lower() == "completed")
    active_count = sum(1 for b in all_assigned if str(b.status).lower() in ["accepted", "on the way", "arrived", "in progress"])
    upcoming_count = sum(1 for b in all_assigned if str(b.status).lower() in ["assigned", "verified", "confirmed"])
    cancelled_count = sum(1 for b in all_assigned if str(b.status).lower() in ["cancelled", "rejected"])

    # Reviews for this worker
    booking_ids = [b.id for b in all_assigned]
    reviews_list = []
    avg_rating = emp.rating
    if booking_ids:
        revs = db.query(Review).filter(Review.booking_id.in_(booking_ids)).order_by(Review.created_at.desc()).all()
        if revs:
            avg_rating = round(sum(r.rating for r in revs) / len(revs), 1)
            for r in revs:
                reviews_list.append({
                    "id": r.id,
                    "bookingId": r.booking_id,
                    "rating": r.rating,
                    "comment": r.comment,
                    "customerName": r.customer.full_name if r.customer else "Customer",
                    "customerPhoto": r.customer.profile_image if r.customer else None,
                    "createdAt": r.created_at.strftime("%Y-%m-%d")
                })

    joining_date_str = current_user.created_at.strftime("%b %Y") if current_user.created_at else "Jan 2026"

    return {
        "id": emp.id,
        "employeeId": emp.id,
        "name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "photo": current_user.profile_image or "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
        "role": "Senior Detailing Technician",
        "designation": emp.designation or "Wash Specialist",
        "skills": emp.skills or "Pressure Foam Wash, Interior Detailing, Paint Protection, Wheel Care",
        "experience": emp.experience or "3.5 Years",
        "bio": emp.bio or "Certified detailing specialist with expertise in mobile pressure foam wash, steam sanitization, and paint gloss restoration.",
        "joiningDate": joining_date_str,
        "currentAvailability": emp.status.value if hasattr(emp.status, 'value') else str(emp.status),
        "status": emp.status.value if hasattr(emp.status, 'value') else str(emp.status),
        "rating": avg_rating,
        "completedJobs": completed_count,
        "activeJobs": active_count,
        "upcomingJobs": upcoming_count,
        "totalAssigned": total_assigned_count,
        "totalJobs": total_assigned_count,
        "cancelledJobs": cancelled_count,
        "onTimeRate": 98.5,
        "todayEarnings": float(emp.today_earnings),
        "totalEarnings": float(emp.total_earnings),
        "location": emp.current_location or "Saraswathipuram, Mysuru",
        "reviews": reviews_list
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

    # Allowed personal updates
    if "name" in data and data["name"].strip():
        current_user.full_name = data["name"].strip()
    if "phone" in data and data["phone"].strip():
        current_user.phone = data["phone"].strip()
    if "photo" in data and data["photo"].strip():
        current_user.profile_image = data["photo"].strip()
    if "skills" in data:
        emp.skills = data["skills"].strip()
    if "experience" in data:
        emp.experience = data["experience"].strip()
    if "bio" in data:
        emp.bio = data["bio"].strip()
    if "status" in data:
        st = data["status"]
        if st in ["Available", "On Job", "Offline", "AVAILABLE", "ON_JOB", "OFFLINE"]:
            if st.upper() == "AVAILABLE":
                emp.status = EmployeeStatus.AVAILABLE
            elif st.upper() in ["ON JOB", "ON_JOB"]:
                emp.status = EmployeeStatus.ON_JOB
            else:
                emp.status = EmployeeStatus.OFFLINE
    if "location" in data and data["location"].strip():
        emp.current_location = data["location"].strip()

    db.commit()
    db.refresh(emp)
    db.refresh(current_user)

    return get_employee_profile(db, current_user)

@router.get("/jobs", response_model=List[dict])
def get_assigned_jobs(
    statusTab: Optional[str] = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        return []

    # SECURITY: Only return jobs assigned to the logged-in worker
    query = db.query(Booking).filter(Booking.employee_id == emp.id)
    bookings = query.order_by(Booking.created_at.desc()).all()

    if statusTab and statusTab != 'all':
        st = statusTab.lower()
        if st in ['active', 'ongoing']:
            bookings = [b for b in bookings if str(b.status).lower() in ['accepted', 'on the way', 'arrived', 'in progress']]
        elif st == 'upcoming':
            bookings = [b for b in bookings if str(b.status).lower() in ['assigned', 'verified', 'confirmed']]
        elif st == 'completed':
            bookings = [b for b in bookings if str(b.status).lower() == 'completed']
        elif st == 'today':
            today_str = date.today().isoformat()
            bookings = [b for b in bookings if str(b.scheduled_date) == today_str]

    return [BookingService.format_booking_response(db, b) for b in bookings]

@router.get("/jobs/{booking_id}", response_model=dict)
def get_job_by_id(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Job booking not found")

    # SECURITY: Ensure worker can only access their own assigned jobs
    if current_user.employee_profile and b.employee_id != current_user.employee_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job record")

    return BookingService.format_booking_response(db, b)

@router.put("/jobs/{booking_id}/accept", response_model=dict)
def accept_job(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Job booking not found")

    if current_user.employee_profile and b.employee_id and b.employee_id != current_user.employee_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this job")

    prev_st = b.status
    b.status = "Accepted"
    b.progress_step = 2
    if current_user.employee_profile:
        b.employee_id = current_user.employee_profile.id
        current_user.employee_profile.status = EmployeeStatus.ON_JOB

    BookingService.record_status_history(
        db,
        booking_id=booking_id,
        new_status="Accepted",
        previous_status=prev_st,
        changed_by=current_user.full_name,
        changed_by_role="employee",
        note="Technician accepted the job"
    )
    BookingService.create_notification(
        db, b.customer_id,
        "Job Accepted 👍",
        f"Your wash specialist {current_user.full_name} accepted booking #{booking_id}."
    )

    # Also notify Admin
    admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if admin_user:
        BookingService.create_notification(
            db, admin_user.id,
            "Worker Accepted Job 👨‍🔧",
            f"Technician {current_user.full_name} accepted booking #{booking_id}."
        )

    db.commit()
    db.refresh(b)
    return BookingService.format_booking_response(db, b)

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

    if current_user.employee_profile and b.employee_id and b.employee_id != current_user.employee_profile.id:
        raise HTTPException(status_code=403, detail="Not authorized to update status for this job")

    st_mapping = {
        "Pending Verification": ("Pending Verification", 0, "Booking Pending", "Booking is awaiting supervisor verification."),
        "Verified": ("Verified", 1, "Booking Verified ✅", "Your booking has been verified by supervisor."),
        "Confirmed": ("Confirmed", 1, "Booking Confirmed ✅", "Your booking is confirmed."),
        "Assigned": ("Assigned", 1, "Professional Assigned 👨‍🔧", "Professional assigned to your booking."),
        "Accepted": ("Accepted", 2, "Job Accepted 👍", f"{current_user.full_name} accepted your booking."),
        "Technician Accepted": ("Accepted", 2, "Job Accepted 👍", f"{current_user.full_name} accepted your booking."),
        "On The Way": ("On The Way", 2, "Technician is on the way 🚗", f"{current_user.full_name} has started travel to your doorstep!"),
        "Arrived": ("Arrived", 2, "Technician Arrived 📍", f"{current_user.full_name} has arrived at your location."),
        "In Progress": ("In Progress", 3, "Wash In Progress 🧽", f"{current_user.full_name} started washing your vehicle."),
        "Service Started": ("In Progress", 3, "Service Started 🧽", f"{current_user.full_name} started the doorstep wash service."),
        "Completed": ("Completed", 4, "Service Completed 🎉", f"Doorstep wash #{booking_id} is completed! Please rate your experience."),
        "Cancelled": ("Cancelled", 0, "Booking Cancelled ❌", f"Booking #{booking_id} was cancelled.")
    }
    
    matched = None
    for k, v in st_mapping.items():
        if k.lower() == data.status.lower():
            matched = v
            break

    prev_st = b.status
    if matched:
        b_status_str, auto_step, notif_title, notif_msg = matched
        b.status = b_status_str
        b.progress_step = data.progressStep if data.progressStep is not None else auto_step
        
        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status=b_status_str,
            previous_status=prev_st,
            changed_by=current_user.full_name,
            changed_by_role="employee",
            note=data.notes or f"Technician updated status to {b_status_str}"
        )
        BookingService.create_notification(db, b.customer_id, notif_title, notif_msg)

        # Notify Admin
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin_user:
            BookingService.create_notification(
                db, admin_user.id,
                f"Booking Update: {b_status_str} 🔔",
                f"{current_user.full_name} marked booking #{booking_id} as '{b_status_str}'."
            )
    else:
        b.status = data.status
        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status=data.status,
            previous_status=prev_st,
            changed_by=current_user.full_name,
            changed_by_role="employee",
            note=data.notes or f"Status updated to {data.status}"
        )

    if b.status == "Completed":
        b.payment_status = "Paid"
        if current_user.employee_profile:
            current_user.employee_profile.completed_jobs += 1
            current_user.employee_profile.status = EmployeeStatus.AVAILABLE
            current_user.employee_profile.today_earnings = float(current_user.employee_profile.today_earnings) + float(b.total_amount) * 0.4
            current_user.employee_profile.total_earnings = float(current_user.employee_profile.total_earnings) + float(b.total_amount) * 0.4

    db.commit()
    db.refresh(b)
    return BookingService.format_booking_response(db, b)

@router.post("/jobs/{booking_id}/work-update", response_model=dict)
def add_work_update(
    booking_id: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Job booking not found")

    text_content = data.get("updateText") or data.get("text") or "Technician logged a work progress update"
    photo_url = data.get("photoUrl")

    wu = BookingWorkUpdate(
        id=str(uuid.uuid4()),
        booking_id=booking_id,
        employee_id=current_user.employee_profile.id if current_user.employee_profile else None,
        update_text=text_content,
        photo_url=photo_url,
        created_at=datetime.utcnow()
    )
    db.add(wu)

    # Also log to status history
    BookingService.record_status_history(
        db,
        booking_id=booking_id,
        new_status=b.status,
        previous_status=b.status,
        changed_by=current_user.full_name,
        changed_by_role="employee",
        note=f"Work update: {text_content}"
    )

    # Notify Customer
    BookingService.create_notification(
        db, b.customer_id,
        "Wash Progress Update 🧼",
        f"{current_user.full_name}: {text_content}"
    )

    db.commit()
    db.refresh(wu)

    return {
        "success": True,
        "id": wu.id,
        "bookingId": wu.booking_id,
        "updateText": wu.update_text,
        "photoUrl": wu.photo_url,
        "createdAt": wu.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/jobs/{booking_id}/work-updates", response_model=List[dict])
def get_work_updates(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    updates = db.query(BookingWorkUpdate).filter(BookingWorkUpdate.booking_id == booking_id).order_by(BookingWorkUpdate.created_at.asc()).all()
    return [
        {
            "id": u.id,
            "bookingId": u.booking_id,
            "updateText": u.update_text,
            "photoUrl": u.photo_url,
            "createdAt": u.created_at.strftime("%Y-%m-%d %H:%M")
        } for u in updates
    ]

@router.post("/jobs/{booking_id}/location", response_model=dict)
def update_job_live_location(
    booking_id: str,
    location_data: BookingLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp_id = current_user.employee_profile.id if current_user.employee_profile else None
    return BookingService.update_live_location(db, booking_id, location_data, emp_id)

@router.post("/jobs/{booking_id}/inspection", response_model=dict)
def save_job_inspection(
    booking_id: str,
    inspection_data: VehicleInspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    return BookingService.save_vehicle_inspection(
        db,
        booking_id=booking_id,
        data=inspection_data,
        inspector_name=current_user.full_name
    )

@router.post("/jobs/{booking_id}/photos", response_model=dict)
async def upload_job_photos(
    booking_id: str,
    photo_type: str = Form("BEFORE"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    from app.services.storage_service import StorageService
    photo_url = StorageService.upload_image(file, folder=f"aquago/bookings/{booking_id}")
    emp_id = current_user.employee_profile.id if current_user.employee_profile else None
    res = BookingService.add_booking_photo(
        db,
        booking_id=booking_id,
        photo_type=photo_type,
        file_url=photo_url,
        employee_id=emp_id,
        user_id=current_user.id
    )

    # Log photo submission to status history
    BookingService.record_status_history(
        db,
        booking_id=booking_id,
        new_status=res.get("status", "In Progress"),
        previous_status=res.get("status", "In Progress"),
        changed_by=current_user.full_name,
        changed_by_role="employee",
        note=f"Uploaded {photo_type} wash inspection photo"
    )

    return {"success": True, "photo": res, "fileUrl": photo_url}

@router.get("/jobs/{booking_id}/timeline", response_model=List[dict])
def get_job_timeline(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    return BookingService.get_booking_timeline(db, booking_id)

@router.get("/history", response_model=List[dict])
def get_worker_history(
    dateFilter: Optional[str] = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        return []

    query = db.query(Booking).filter(
        Booking.employee_id == emp.id,
        Booking.status == "Completed"
    ).order_by(Booking.scheduled_date.desc(), Booking.created_at.desc())

    today = date.today()
    if dateFilter == "today":
        query = query.filter(Booking.scheduled_date == today)
    elif dateFilter == "week":
        week_ago = today - timedelta(days=7)
        query = query.filter(Booking.scheduled_date >= week_ago)
    elif dateFilter == "month":
        month_ago = today - timedelta(days=30)
        query = query.filter(Booking.scheduled_date >= month_ago)

    bookings = query.all()
    return [BookingService.format_booking_response(db, b) for b in bookings]

@router.get("/reviews", response_model=List[dict])
def get_worker_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        return []

    assigned_bookings = db.query(Booking).filter(Booking.employee_id == emp.id).all()
    booking_ids = [b.id for b in assigned_bookings]
    if not booking_ids:
        return []

    revs = db.query(Review).filter(Review.booking_id.in_(booking_ids)).order_by(Review.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "bookingId": r.booking_id,
            "rating": r.rating,
            "comment": r.comment,
            "customerName": r.customer.full_name if r.customer else "Customer",
            "customerPhoto": r.customer.profile_image if r.customer else None,
            "createdAt": r.created_at.strftime("%Y-%m-%d")
        } for r in revs
    ]

@router.get("/stats", response_model=dict)
def get_worker_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee)
):
    emp = current_user.employee_profile
    if not emp:
        return {}

    all_assigned = db.query(Booking).filter(Booking.employee_id == emp.id).all()
    total = len(all_assigned)
    completed = sum(1 for b in all_assigned if str(b.status).lower() == "completed")
    active = sum(1 for b in all_assigned if str(b.status).lower() in ["accepted", "on the way", "arrived", "in progress"])
    upcoming = sum(1 for b in all_assigned if str(b.status).lower() in ["assigned", "verified", "confirmed"])
    cancelled = sum(1 for b in all_assigned if str(b.status).lower() in ["cancelled", "rejected"])

    return {
        "totalAssigned": total,
        "completed": completed,
        "active": active,
        "upcoming": upcoming,
        "cancelled": cancelled,
        "averageRating": emp.rating,
        "onTimeRate": 98.5,
        "todayEarnings": float(emp.today_earnings),
        "totalEarnings": float(emp.total_earnings)
    }
