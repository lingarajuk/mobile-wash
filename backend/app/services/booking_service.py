import random
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.booking import (
    Booking, BookingStatus, PaymentStatus, BookingAddon, BookingPhoto,
    BookingLocation, VehicleInspection
)
from app.models.booking_history import BookingStatusHistory
from app.models.payment import Payment
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.models.address import Address
from app.models.service import Service
from app.models.addon import Addon
from app.models.offer import Offer, DiscountType
from app.models.notification import Notification
from app.models.settings import BusinessSettings
from app.models.employee import Employee, EmployeeStatus
from app.schemas.booking import (
    BookingCreateRequest, VehicleInspectionCreate, BookingLocationUpdate,
    BookingReviewCreate
)

class BookingService:
    @staticmethod
    def generate_smart_suggestions(vehicle_type: str = "", condition: str = "", condition_notes: str = "", special_notes: str = "") -> list:
        suggestions = []
        cond_lower = (condition or "").lower()
        type_lower = (vehicle_type or "").lower()
        notes_lower = f"{condition_notes or ''} {special_notes or ''}".lower()

        if "heavy" in cond_lower or "mud" in cond_lower:
            suggestions.append("Vehicle has heavy dirt/mud — deep underbody pressure rinse & active snow foam recommended.")
            suggestions.append("Allow extra 15 mins dwell time for pre-wash shampoo to loosen stubborn grime.")
        elif "light" in cond_lower:
            suggestions.append("Light dust present — eco waterless/gentle foam rinse with soft microfiber drying recommended.")
        else:
            suggestions.append("Standard condition — standard two-bucket safe wash method recommended.")

        if type_lower in ["suv", "luxury", "sedan"]:
            suggestions.append("Deep interior cabin vacuuming and AC vent antibacterial steam sanitization recommended.")
            suggestions.append("Apply UV protective dashboard conditioning to shield against sun exposure.")
        elif type_lower in ["bike", "scooter"]:
            suggestions.append("Chain degreasing, clean lubricant spray, and tire wall gloss recommended for two-wheelers.")
            suggestions.append("Cover sensitive ignition and digital consoles before high-pressure spraying.")

        if "alloy" in notes_lower or "wheel" in notes_lower or "rim" in notes_lower:
            suggestions.append("Customer noted alloy wheels — use non-acidic pH-neutral wheel cleaner and soft detailing brush.")
        if "scratch" in notes_lower or "paint" in notes_lower:
            suggestions.append("Customer noted paint sensitivity — use plush scratch-free mitts and lubricated drying towels.")

        if not suggestions:
            suggestions.append("Standard premium doorstep wash protocol with gloss wax finish recommended.")

        return suggestions

    @staticmethod
    def calculate_totals(db: Session, request: BookingCreateRequest):
        service = db.query(Service).filter(Service.id == request.serviceId).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found in database")

        base_price = float(service.price)
        addons_total = 0.0
        addons_list = []

        if request.addonIds:
            addons = db.query(Addon).filter(Addon.id.in_(request.addonIds)).all()
            for add in addons:
                addons_total += float(add.price)
                addons_list.append(add)

        subtotal = base_price + addons_total
        discount_amount = 0.0

        if request.couponCode:
            offer = db.query(Offer).filter(
                Offer.code == request.couponCode.strip().upper(),
                Offer.is_active == True
            ).first()
            if offer and subtotal >= float(offer.minimum_order_amount):
                if offer.discount_type == DiscountType.FLAT:
                    discount_amount = float(offer.discount_value)
                elif offer.discount_type == DiscountType.PERCENT:
                    calc = (subtotal * float(offer.discount_value)) / 100.0
                    if offer.maximum_discount:
                        calc = min(calc, float(offer.maximum_discount))
                    discount_amount = calc

        discounted_subtotal = max(0.0, subtotal - discount_amount)
        
        settings = db.query(BusinessSettings).first()
        tax_rate = float(settings.tax_percentage) if settings else 18.0
        tax_amount = round((discounted_subtotal * tax_rate) / 100.0, 2)
        final_amount = round(discounted_subtotal, 2)

        return {
            "service": service,
            "base_price": base_price,
            "addons_list": addons_list,
            "addons_total": addons_total,
            "discount_amount": discount_amount,
            "tax_amount": tax_amount,
            "final_amount": final_amount
        }

    @staticmethod
    def record_status_history(db: Session, booking_id: str, new_status: str, previous_status: str = None, changed_by: str = None, changed_by_role: str = None, note: str = None):
        history = BookingStatusHistory(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            previous_status=previous_status,
            new_status=new_status,
            changed_by=changed_by,
            changed_by_role=changed_by_role,
            note=note,
            created_at=datetime.utcnow()
        )
        db.add(history)

    @staticmethod
    def get_customer_stats(db: Session, customer_id: str) -> dict:
        customer = db.query(User).filter(User.id == customer_id).first()
        created_date_str = customer.created_at.strftime("%b %Y") if customer and customer.created_at else "Jan 2026"

        all_bookings = db.query(Booking).filter(Booking.customer_id == customer_id).all()
        total_count = len(all_bookings)
        completed_count = sum(1 for b in all_bookings if str(b.status).lower() == "completed")
        cancelled_count = sum(1 for b in all_bookings if str(b.status).lower() == "cancelled")

        # Average rating from customer's reviews
        avg_rating = 4.9
        revs = db.query(Review).filter(Review.customer_id == customer_id).all()
        if revs:
            avg_rating = round(sum(r.rating for r in revs) / len(revs), 1)

        return {
            "customerSince": created_date_str,
            "totalBookings": total_count,
            "completedBookings": completed_count,
            "cancelledBookings": cancelled_count,
            "averageRating": avg_rating,
            "notes": "Verified AquaGo Customer"
        }

    @staticmethod
    def create_notification(db: Session, user_id: str, title: str, message: str, notif_type: str = "booking"):
        notif = Notification(
            id=f"notif-{int(datetime.utcnow().timestamp() * 1000)}",
            user_id=user_id,
            title=title,
            message=message,
            type=notif_type,
            is_read=False
        )
        db.add(notif)

    @staticmethod
    def create_booking(db: Session, customer: User, request: BookingCreateRequest) -> dict:
        # 1. Resolve or Create Vehicle
        vehicle = None
        if request.vehicleId:
            vehicle = db.query(Vehicle).filter(Vehicle.id == request.vehicleId, Vehicle.user_id == customer.id).first()

        if not vehicle and (request.vehicleRegNumber or (request.vehicle and request.vehicle.regNumber)):
            v_type = request.vehicleType or (request.vehicle.type if request.vehicle else "sedan")
            v_brand = request.vehicleBrand or (request.vehicle.brand if request.vehicle else "Vehicle")
            v_model = request.vehicleModel or (request.vehicle.model if request.vehicle else "Standard")
            v_reg = request.vehicleRegNumber or (request.vehicle.regNumber if request.vehicle else f"KA-09-TEMP-{random.randint(1000, 9999)}")
            v_col = request.vehicleColor or (request.vehicle.color if request.vehicle else "Standard")

            # Check if vehicle exists for customer
            vehicle = db.query(Vehicle).filter(Vehicle.user_id == customer.id, Vehicle.registration_number == v_reg).first()
            if not vehicle:
                vehicle = Vehicle(
                    id=f"veh-{uuid.uuid4().hex[:8]}",
                    user_id=customer.id,
                    vehicle_type=v_type.lower(),
                    brand=v_brand,
                    model=v_model,
                    registration_number=v_reg,
                    color=v_col,
                    is_default=False
                )
                db.add(vehicle)
                db.flush()

        if not vehicle:
            # Fallback to customer's first vehicle or create default
            vehicle = db.query(Vehicle).filter(Vehicle.user_id == customer.id).first()
            if not vehicle:
                vehicle = Vehicle(
                    id=f"veh-{uuid.uuid4().hex[:8]}",
                    user_id=customer.id,
                    vehicle_type="sedan",
                    brand="Honda",
                    model="City",
                    registration_number="KA-09-MA-7821",
                    color="White",
                    is_default=True
                )
                db.add(vehicle)
                db.flush()

        # 2. Resolve or Create Address
        address = None
        if request.addressId:
            address = db.query(Address).filter(Address.id == request.addressId, Address.user_id == customer.id).first()

        if not address and (request.fullAddress or request.landmark or (request.address and request.address.house)):
            house_str = request.fullAddress or (request.address.house if request.address else "Customer Location")
            street_str = (request.address.street if request.address else "") or ""
            area_str = (request.address.area if request.address else request.landmark) or "Doorstep Location"
            landmark_str = request.landmark or (request.address.landmark if request.address else "")
            city_str = request.city or (request.address.city if request.address else "Mysuru")
            state_str = request.state or (request.address.state if request.address else "Karnataka")
            pin_str = request.pincode or (request.address.pincode if request.address else "570002")
            lat_val = float(request.latitude or (request.address.latitude if request.address else 12.3118))
            lng_val = float(request.longitude or (request.address.longitude if request.address else 76.6529))

            address = Address(
                id=f"addr-{uuid.uuid4().hex[:8]}",
                user_id=customer.id,
                label="Doorstep Service",
                house=house_str,
                street=street_str,
                area=area_str,
                landmark=landmark_str,
                city=city_str,
                state=state_str,
                pincode=pin_str,
                latitude=lat_val,
                longitude=lng_val,
                is_default=False
            )
            db.add(address)
            db.flush()

        if not address:
            address = db.query(Address).filter(Address.user_id == customer.id).first()
            if not address:
                address = Address(
                    id=f"addr-{uuid.uuid4().hex[:8]}",
                    user_id=customer.id,
                    label="Home",
                    house="Doorstep Address",
                    street="Main Road",
                    area="Vijayanagar",
                    landmark="Near Landmark",
                    city="Mysuru",
                    state="Karnataka",
                    pincode="570002",
                    latitude=12.3118,
                    longitude=76.6529,
                    is_default=True
                )
                db.add(address)
                db.flush()

        calc = BookingService.calculate_totals(db, request)
        booking_id = f"AGW-{random.randint(80000, 99999)}"

        p_status = "Pending" if "Cash" in request.paymentMethod else "Paid"

        cust_name = request.customerName or customer.full_name
        cust_phone = request.customerPhone or customer.phone
        cust_email = request.customerEmail or customer.email
        txn_id = f"TXN-{random.randint(10000000, 99999999)}"

        new_booking = Booking(
            id=booking_id,
            booking_number=booking_id,
            customer_id=customer.id,
            vehicle_id=vehicle.id,
            service_id=calc["service"].id,
            address_id=address.id,
            customer_name=cust_name,
            customer_phone=cust_phone,
            customer_email=cust_email,
            vehicle_condition=request.vehicleCondition or "Normal Dirt",
            condition_notes=request.conditionNotes,
            special_instructions=request.specialInstructions,
            scheduled_date=datetime.strptime(request.date, "%Y-%m-%d").date(),
            scheduled_time=request.timeSlot,
            estimated_duration=f"{calc['service'].duration_minutes} mins",
            status="Pending Verification", # Initial state PENDING_VERIFICATION
            progress_step=0,
            base_price=calc["base_price"],
            addon_amount=calc["addons_total"],
            discount_amount=calc["discount_amount"],
            tax_amount=calc["tax_amount"],
            total_amount=calc["final_amount"],
            coupon_code=request.couponCode,
            payment_method=request.paymentMethod,
            payment_status=p_status,
            transaction_id=txn_id
        )
        db.add(new_booking)

        # Add booking addons
        for add in calc["addons_list"]:
            b_add = BookingAddon(
                booking_id=booking_id,
                addon_id=add.id,
                price_at_booking=add.price
            )
            db.add(b_add)

        # Save photos
        photo_items = []
        for p in request.photos:
            photo_items.append((p.photoType, p.fileUrl))
        for url in request.photoUrls:
            photo_items.append(("ADDITIONAL", url))

        for p_type, p_url in photo_items:
            b_photo = BookingPhoto(
                id=str(uuid.uuid4()),
                booking_id=booking_id,
                uploaded_by=customer.id,
                photo_type=p_type.upper(),
                file_url=p_url
            )
            db.add(b_photo)

        # Add payment record
        payment = Payment(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            user_id=customer.id,
            amount=calc["final_amount"],
            payment_method=request.paymentMethod,
            transaction_id=txn_id,
            status=PaymentStatus.PENDING if p_status == "Pending" else PaymentStatus.SUCCESS
        )
        db.add(payment)

        # Record Initial Status History
        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status="Pending Verification",
            previous_status=None,
            changed_by=cust_name,
            changed_by_role="customer",
            note="Booking submitted by customer"
        )

        # Notifications
        BookingService.create_notification(
            db, customer.id,
            "Booking Submitted for Verification! 🚗",
            f"Your booking #{booking_id} for {calc['service'].name} is received and pending supervisor verification."
        )

        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin_user:
            BookingService.create_notification(
                db, admin_user.id,
                "New Booking Request! 🔔",
                f"New booking #{booking_id} from {cust_name} ({cust_phone}) for {calc['service'].name} needs verification."
            )

        db.commit()
        db.refresh(new_booking)

        return BookingService.format_booking_response(db, new_booking)

    @staticmethod
    def verify_booking(db: Session, booking_id: str, admin_user: User) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        prev_status = b.status
        b.status = "Verified"
        b.progress_step = 1

        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status="Verified",
            previous_status=prev_status,
            changed_by=admin_user.full_name,
            changed_by_role="admin",
            note="Booking verified by Admin"
        )
        BookingService.create_notification(
            db, b.customer_id,
            "Booking Verified! ✅",
            f"Your booking #{booking_id} for {b.service.name} has been verified by AquaGo supervisor."
        )

        db.commit()
        db.refresh(b)
        return BookingService.format_booking_response(db, b)

    @staticmethod
    def reject_booking(db: Session, booking_id: str, admin_user: User, reason: str) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        prev_status = b.status
        b.status = "Rejected"
        b.rejection_reason = reason
        b.progress_step = 0

        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status="Rejected",
            previous_status=prev_status,
            changed_by=admin_user.full_name,
            changed_by_role="admin",
            note=f"Rejected reason: {reason}"
        )
        BookingService.create_notification(
            db, b.customer_id,
            "Booking Rejected ❌",
            f"Your booking #{booking_id} was rejected. Reason: {reason}"
        )

        db.commit()
        db.refresh(b)
        return BookingService.format_booking_response(db, b)

    @staticmethod
    def assign_technician(db: Session, booking_id: str, employee_id: str, admin_user: User) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")

        prev_status = b.status
        b.employee_id = emp.id
        b.status = "Assigned"
        b.progress_step = 1

        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status="Assigned",
            previous_status=prev_status,
            changed_by=admin_user.full_name,
            changed_by_role="admin",
            note=f"Assigned technician: {emp.user.full_name} ({emp.user.phone})"
        )
        BookingService.create_notification(
            db, b.customer_id,
            "Technician Assigned! 👨‍🔧",
            f"{emp.user.full_name} (+91 {emp.user.phone}) has been assigned to your booking #{booking_id}."
        )
        BookingService.create_notification(
            db, emp.user.id,
            "New Job Assignment! 🚗",
            f"You have been assigned to wash booking #{booking_id} for {b.service.name} on {b.scheduled_date} ({b.scheduled_time})."
        )

        db.commit()
        db.refresh(b)
        return BookingService.format_booking_response(db, b)

    @staticmethod
    def update_status(db: Session, booking_id: str, new_status: str, progress_step: int = None, changed_by_user: User = None, note: str = None) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        prev_status = b.status
        b.status = new_status
        if progress_step is not None:
            b.progress_step = progress_step

        if new_status.lower() == "completed":
            b.payment_status = "Paid"

        changed_name = changed_by_user.full_name if changed_by_user else "System"
        changed_role = changed_by_user.role.value if changed_by_user else "system"

        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status=new_status,
            previous_status=prev_status,
            changed_by=changed_name,
            changed_by_role=changed_role,
            note=note or f"Status transitioned to {new_status}"
        )

        # Notify Customer
        BookingService.create_notification(
            db, b.customer_id,
            f"Booking Update: {new_status} 🚗",
            f"Your booking #{booking_id} status is now: {new_status}."
        )

        db.commit()
        db.refresh(b)
        return BookingService.format_booking_response(db, b)

    @staticmethod
    def add_booking_photo(db: Session, booking_id: str, photo_type: str, file_url: str, employee_id: str = None, user_id: str = None) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        photo = BookingPhoto(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            uploaded_by=user_id,
            employee_id=employee_id,
            photo_type=photo_type.upper(),
            file_url=file_url,
            created_at=datetime.utcnow()
        )
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return {
            "id": photo.id,
            "bookingId": photo.booking_id,
            "photoType": photo.photo_type,
            "fileUrl": photo.file_url,
            "createdAt": photo.created_at.strftime("%Y-%m-%d %H:%M")
        }

    @staticmethod
    def update_live_location(db: Session, booking_id: str, location_data: BookingLocationUpdate, employee_id: str = None) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        loc = db.query(BookingLocation).filter(BookingLocation.booking_id == booking_id).first()
        if not loc:
            loc = BookingLocation(
                id=str(uuid.uuid4()),
                booking_id=booking_id,
                employee_id=employee_id or b.employee_id,
                latitude=location_data.latitude,
                longitude=location_data.longitude,
                speed=location_data.speed,
                heading=location_data.heading,
                updated_at=datetime.utcnow()
            )
            db.add(loc)
        else:
            loc.latitude = location_data.latitude
            loc.longitude = location_data.longitude
            loc.speed = location_data.speed
            loc.heading = location_data.heading
            loc.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(loc)
        return {
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "speed": loc.speed,
            "heading": loc.heading,
            "updatedAt": loc.updated_at.strftime("%Y-%m-%d %H:%M:%S")
        }

    @staticmethod
    def get_live_location(db: Session, booking_id: str) -> dict:
        loc = db.query(BookingLocation).filter(BookingLocation.booking_id == booking_id).first()
        if not loc:
            # Fallback to customer's address coordinate or default
            b = db.query(Booking).filter(Booking.id == booking_id).first()
            lat = float(getattr(b.address, 'latitude', 12.3118) or 12.3118) if b and b.address else 12.3118
            lng = float(getattr(b.address, 'longitude', 76.6529) or 76.6529) if b and b.address else 76.6529
            return {
                "latitude": lat + 0.005,
                "longitude": lng + 0.005,
                "speed": 24.5,
                "heading": 90.0,
                "updatedAt": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            }
        return {
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "speed": loc.speed,
            "heading": loc.heading,
            "updatedAt": loc.updated_at.strftime("%Y-%m-%d %H:%M:%S")
        }

    @staticmethod
    def save_vehicle_inspection(db: Session, booking_id: str, data: VehicleInspectionCreate, inspector_name: str = None) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        insp = db.query(VehicleInspection).filter(VehicleInspection.booking_id == booking_id).first()
        if not insp:
            insp = VehicleInspection(
                id=str(uuid.uuid4()),
                booking_id=booking_id,
                exterior_condition=data.exteriorCondition or "Normal",
                interior_condition=data.interiorCondition or "Normal",
                existing_scratches=data.existingScratches,
                dents_notes=data.dentsNotes,
                broken_parts=data.brokenParts,
                dirty_areas=data.dirtyAreas,
                inspection_notes=data.inspectionNotes,
                inspected_by=inspector_name or "Technician",
                created_at=datetime.utcnow()
            )
            db.add(insp)
        else:
            if data.exteriorCondition: insp.exterior_condition = data.exteriorCondition
            if data.interiorCondition: insp.interior_condition = data.interiorCondition
            if data.existingScratches is not None: insp.existing_scratches = data.existingScratches
            if data.dentsNotes is not None: insp.dents_notes = data.dentsNotes
            if data.brokenParts is not None: insp.broken_parts = data.brokenParts
            if data.dirtyAreas is not None: insp.dirty_areas = data.dirtyAreas
            if data.inspectionNotes is not None: insp.inspection_notes = data.inspectionNotes
            if inspector_name: insp.inspected_by = inspector_name

        b.inspection_notes = insp.inspection_notes
        db.commit()
        db.refresh(insp)
        return {
            "id": insp.id,
            "exteriorCondition": insp.exterior_condition,
            "interiorCondition": insp.interior_condition,
            "existingScratches": insp.existing_scratches,
            "dentsNotes": insp.dents_notes,
            "brokenParts": insp.broken_parts,
            "dirtyAreas": insp.dirty_areas,
            "inspectionNotes": insp.inspection_notes,
            "inspectedBy": insp.inspected_by,
            "createdAt": insp.created_at.strftime("%Y-%m-%d %H:%M")
        }

    @staticmethod
    def get_vehicle_inspection(db: Session, booking_id: str) -> dict:
        insp = db.query(VehicleInspection).filter(VehicleInspection.booking_id == booking_id).first()
        if not insp:
            return None
        return {
            "id": insp.id,
            "exteriorCondition": insp.exterior_condition,
            "interiorCondition": insp.interior_condition,
            "existingScratches": insp.existing_scratches,
            "dentsNotes": insp.dents_notes,
            "brokenParts": insp.broken_parts,
            "dirtyAreas": insp.dirty_areas,
            "inspectionNotes": insp.inspection_notes,
            "inspectedBy": insp.inspected_by,
            "createdAt": insp.created_at.strftime("%Y-%m-%d %H:%M")
        }

    @staticmethod
    def create_customer_review(db: Session, booking_id: str, customer: User, review_data: BookingReviewCreate) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Check existing review
        existing = db.query(Review).filter(Review.booking_id == booking_id).first()
        if existing:
            existing.rating = review_data.rating
            existing.comment = review_data.comment
            db.commit()
            db.refresh(existing)
            return {
                "id": existing.id,
                "rating": existing.rating,
                "comment": existing.comment,
                "customerName": customer.full_name,
                "createdAt": existing.created_at.strftime("%Y-%m-%d")
            }

        new_rev = Review(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            customer_id=customer.id,
            rating=review_data.rating,
            comment=review_data.comment,
            created_at=datetime.utcnow()
        )
        db.add(new_rev)

        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status="Customer Reviewed",
            previous_status=b.status,
            changed_by=customer.full_name,
            changed_by_role="customer",
            note=f"Submitted {review_data.rating}-star review: {review_data.comment or 'No comment'}"
        )

        db.commit()
        db.refresh(new_rev)
        return {
            "id": new_rev.id,
            "rating": new_rev.rating,
            "comment": new_rev.comment,
            "customerName": customer.full_name,
            "createdAt": new_rev.created_at.strftime("%Y-%m-%d")
        }

    @staticmethod
    def reschedule_booking(db: Session, booking_id: str, new_date: str, new_slot: str, user: User, reason: str = None) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        prev_date = str(b.scheduled_date)
        prev_slot = b.scheduled_time

        b.scheduled_date = datetime.strptime(new_date, "%Y-%m-%d").date()
        b.scheduled_time = new_slot

        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status="Rescheduled",
            previous_status=b.status,
            changed_by=user.full_name,
            changed_by_role=user.role.value if hasattr(user.role, 'value') else str(user.role),
            note=f"Rescheduled from {prev_date} ({prev_slot}) to {new_date} ({new_slot}). Reason: {reason or 'None'}"
        )

        BookingService.create_notification(
            db, b.customer_id,
            "Booking Rescheduled 📅",
            f"Your booking #{booking_id} has been rescheduled to {new_date} ({new_slot})."
        )

        db.commit()
        db.refresh(b)
        return BookingService.format_booking_response(db, b)

    @staticmethod
    def cancel_booking(db: Session, booking_id: str, user: User, reason: str = None) -> dict:
        b = db.query(Booking).filter(Booking.id == booking_id).first()
        if not b:
            raise HTTPException(status_code=404, detail="Booking not found")

        prev_status = b.status
        b.status = "Cancelled"
        b.progress_step = 0

        BookingService.record_status_history(
            db,
            booking_id=booking_id,
            new_status="Cancelled",
            previous_status=prev_status,
            changed_by=user.full_name,
            changed_by_role=user.role.value if hasattr(user.role, 'value') else str(user.role),
            note=f"Cancelled: {reason or 'User requested cancellation'}"
        )

        BookingService.create_notification(
            db, b.customer_id,
            "Booking Cancelled",
            f"Your booking #{booking_id} has been cancelled."
        )

        db.commit()
        db.refresh(b)
        return BookingService.format_booking_response(db, b)

    @staticmethod
    def get_booking_timeline(db: Session, booking_id: str) -> list:
        histories = db.query(BookingStatusHistory).filter(
            BookingStatusHistory.booking_id == booking_id
        ).order_by(BookingStatusHistory.created_at.asc()).all()

        return [
            {
                "id": h.id,
                "previousStatus": h.previous_status,
                "newStatus": h.new_status,
                "changedBy": h.changed_by,
                "changedByRole": h.changed_by_role,
                "note": h.note,
                "createdAt": h.created_at.strftime("%Y-%m-%d %H:%M:%S")
            } for h in histories
        ]

    @staticmethod
    def format_booking_response(db: Session, b: Booking) -> dict:
        smart_suggs = BookingService.generate_smart_suggestions(
            vehicle_type=b.vehicle.vehicle_type if b.vehicle else "sedan",
            condition=b.vehicle_condition or "Normal Dirt",
            condition_notes=b.condition_notes or "",
            special_notes=b.special_instructions or ""
        )

        status_str = b.status if isinstance(b.status, str) else b.status.value
        payment_status_str = b.payment_status if isinstance(b.payment_status, str) else b.payment_status.value

        # Customer statistics
        cust_stats = BookingService.get_customer_stats(db, b.customer_id)

        # Segregated photos
        all_photos = []
        before_photos = []
        after_photos = []

        if b.photos:
            for p in b.photos:
                p_item = {
                    "id": p.id,
                    "photoType": p.photo_type,
                    "fileUrl": p.file_url,
                    "createdAt": p.created_at.strftime("%Y-%m-%d %H:%M")
                }
                all_photos.append(p_item)
                if p.photo_type == "BEFORE":
                    before_photos.append(p_item)
                elif p.photo_type == "AFTER":
                    after_photos.append(p_item)

        # Timeline
        timeline = BookingService.get_booking_timeline(db, b.id)

        # Inspection
        insp = BookingService.get_vehicle_inspection(db, b.id)

        # Live Location
        loc = BookingService.get_live_location(db, b.id) if status_str in ["On The Way", "Arrived", "In Progress"] else None

        # Review
        rev_data = None
        if b.review:
            rev_data = {
                "id": b.review.id,
                "rating": b.review.rating,
                "comment": b.review.comment,
                "customerName": b.customer.full_name if b.customer else "Customer",
                "createdAt": b.review.created_at.strftime("%Y-%m-%d")
            }

        # Work Updates
        work_updates_list = []
        if getattr(b, 'work_updates', None):
            for wu in b.work_updates:
                work_updates_list.append({
                    "id": wu.id,
                    "updateText": wu.update_text,
                    "photoUrl": wu.photo_url,
                    "createdAt": wu.created_at.strftime("%Y-%m-%d %H:%M")
                })

        return {
            "id": b.id,
            "bookingNumber": b.booking_number,
            "customerName": b.customer_name or (b.customer.full_name if b.customer else "Customer"),
            "customerPhone": b.customer_phone or (b.customer.phone if b.customer else "+91 98765 43210"),
            "customerEmail": b.customer_email or (b.customer.email if b.customer else "customer@example.com"),
            "customerPhoto": b.customer.profile_image if (b.customer and b.customer.profile_image) else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
            "customerStats": cust_stats,
            
            "vehicleCondition": b.vehicle_condition or "Normal Dirt",
            "conditionNotes": b.condition_notes,
            "specialInstructions": b.special_instructions,
            "rejectionReason": b.rejection_reason,
            "inspectionNotes": b.inspection_notes,
            "estimatedDuration": b.estimated_duration or "45 mins",
            
            "service": {
                "id": b.service.id,
                "name": b.service.name,
                "category": b.service.category,
                "price": float(b.service.price),
                "originalPrice": float(b.service.original_price),
                "duration": f"{b.service.duration_minutes} mins",
                "rating": b.service.rating,
                "reviewsCount": b.service.reviews_count,
                "badge": b.service.badge,
                "image": b.service.image_url,
                "description": b.service.description,
                "included": b.service.included_json,
                "notIncluded": b.service.not_included_json,
                "recommendedVehicles": b.service.recommended_vehicles_json
            },
            "vehicle": {
                "id": b.vehicle.id,
                "type": b.vehicle.vehicle_type,
                "brand": b.vehicle.brand,
                "model": b.vehicle.model,
                "variant": getattr(b.vehicle, 'variant', 'ZX Top End') or 'ZX Top End',
                "regNumber": b.vehicle.registration_number,
                "color": b.vehicle.color,
                "fuelType": getattr(b.vehicle, 'fuel_type', 'Petrol') or 'Petrol',
                "isDefault": b.vehicle.is_default
            } if b.vehicle else {
                "id": "veh-temp",
                "type": "sedan",
                "brand": "Vehicle",
                "model": "Standard",
                "variant": "ZX",
                "regNumber": "KA-09-TEMP",
                "color": "White",
                "fuelType": "Petrol",
                "isDefault": False
            },
            "address": {
                "id": b.address.id,
                "label": b.address.label,
                "house": b.address.house,
                "street": b.address.street,
                "area": b.address.area,
                "landmark": b.address.landmark,
                "city": b.address.city,
                "state": b.address.state,
                "pincode": b.address.pincode,
                "latitude": float(getattr(b.address, 'latitude', 12.3118) or 12.3118),
                "longitude": float(getattr(b.address, 'longitude', 76.6529) or 76.6529),
                "isDefault": b.address.is_default
            } if b.address else {
                "id": "addr-temp",
                "label": "Service Location",
                "house": "Doorstep Location",
                "street": "",
                "area": "Mysuru",
                "landmark": "",
                "city": "Mysuru",
                "state": "Karnataka",
                "pincode": "570002",
                "latitude": 12.3118,
                "longitude": 76.6529,
                "isDefault": True
            },
            "date": str(b.scheduled_date),
            "timeSlot": b.scheduled_time,
            "addons": [
                {
                    "id": ba.addon.id,
                    "name": ba.addon.name,
                    "price": float(ba.price_at_booking),
                    "icon": ba.addon.icon,
                    "description": ba.addon.description
                } for ba in b.booking_addons
            ],
            "couponApplied": b.coupon_code,
            "discountAmount": float(b.discount_amount),
            "basePrice": float(b.base_price),
            "addonsTotal": float(b.addon_amount),
            "taxAmount": float(b.tax_amount),
            "finalAmount": float(b.total_amount),
            "paymentMethod": b.payment_method,
            "paymentStatus": payment_status_str,
            "transactionId": b.transaction_id or (b.payment.transaction_id if b.payment else f"TXN-{b.booking_number}"),
            "status": status_str,
            "progressStep": b.progress_step,
            "employee": {
                "id": b.employee.id,
                "name": b.employee.user.full_name,
                "phone": b.employee.user.phone,
                "photo": b.employee.user.profile_image or "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
                "rating": b.employee.rating,
                "completedJobs": b.employee.completed_jobs,
                "status": b.employee.status.value if hasattr(b.employee.status, 'value') else str(b.employee.status)
            } if b.employee else None,
            "review": rev_data,
            "photos": all_photos,
            "beforePhotos": before_photos,
            "afterPhotos": after_photos,
            "workUpdates": work_updates_list,
            "smartSuggestions": smart_suggs,
            "statusHistory": timeline,
            "inspection": insp,
            "liveLocation": loc,
            "createdAt": b.created_at.strftime("%Y-%m-%d %H:%M"),
            "updatedAt": b.updated_at.strftime("%Y-%m-%d %H:%M")
        }
