import random
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.booking import Booking, BookingStatus, PaymentStatus, BookingAddon, BookingPhoto
from app.models.booking_history import BookingStatusHistory
from app.models.payment import Payment
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.models.address import Address
from app.models.service import Service
from app.models.addon import Addon
from app.models.offer import Offer, DiscountType
from app.models.notification import Notification
from app.models.settings import BusinessSettings
from app.schemas.booking import BookingCreateRequest

class BookingService:
    @staticmethod
    def calculate_totals(db: Session, request: BookingCreateRequest):
        service = db.query(Service).filter(Service.id == request.serviceId).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")

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
                Offer.code == request.couponCode,
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
    def record_status_change(db: Session, booking_id: str, new_status: str, changed_by: str, notes: str = None):
        history = BookingStatusHistory(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            status=new_status,
            changed_by=changed_by,
            notes=notes
        )
        db.add(history)

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
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == request.vehicleId,
            Vehicle.user_id == customer.id
        ).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found or does not belong to user")

        address = db.query(Address).filter(
            Address.id == request.addressId,
            Address.user_id == customer.id
        ).first()
        if not address:
            raise HTTPException(status_code=404, detail="Address not found or does not belong to user")

        calc = BookingService.calculate_totals(db, request)
        booking_id = f"AGW-{random.randint(80000, 99999)}"

        p_status = PaymentStatus.PENDING if request.paymentMethod == "Cash After Service" else PaymentStatus.SUCCESS

        new_booking = Booking(
            id=booking_id,
            booking_number=booking_id,
            customer_id=customer.id,
            vehicle_id=vehicle.id,
            service_id=calc["service"].id,
            address_id=address.id,
            scheduled_date=datetime.strptime(request.date, "%Y-%m-%d").date(),
            scheduled_time=request.timeSlot,
            status=BookingStatus.PENDING, # Initial state PENDING
            progress_step=0,
            base_price=calc["base_price"],
            addon_amount=calc["addons_total"],
            discount_amount=calc["discount_amount"],
            tax_amount=calc["tax_amount"],
            total_amount=calc["final_amount"],
            coupon_code=request.couponCode,
            payment_method=request.paymentMethod,
            payment_status=p_status
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

        # Add payment record
        payment = Payment(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            user_id=customer.id,
            amount=calc["final_amount"],
            payment_method=request.paymentMethod,
            transaction_id=f"TXN-{random.randint(10000000, 99999999)}",
            status=p_status
        )
        db.add(payment)

        # Status History
        BookingService.record_status_change(db, booking_id, "PENDING", customer.id, "Booking created by customer")

        # Notifications for Customer & Admin
        BookingService.create_notification(
            db, customer.id,
            "Booking Placed! 🚗",
            f"Your booking #{booking_id} for {calc['service'].name} is placed and pending admin confirmation."
        )

        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin_user:
            BookingService.create_notification(
                db, admin_user.id,
                "New Booking Received! 🔔",
                f"New booking #{booking_id} from {customer.full_name} for {calc['service'].name} on {request.date}."
            )

        db.commit()
        db.refresh(new_booking)

        return BookingService.format_booking_response(new_booking)

    @staticmethod
    def format_booking_response(b: Booking) -> dict:
        # Fetch status history
        history_list = []
        if hasattr(b, 'id'):
            # Query history if needed
            pass

        return {
            "id": b.id,
            "bookingNumber": b.booking_number,
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
                "regNumber": b.vehicle.registration_number,
                "color": b.vehicle.color,
                "isDefault": b.vehicle.is_default
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
                "latitude": getattr(b.address, 'latitude', 12.3118),
                "longitude": getattr(b.address, 'longitude', 76.6529),
                "isDefault": b.address.is_default
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
            "finalAmount": float(b.total_amount),
            "paymentMethod": b.payment_method,
            "paymentStatus": b.payment_status.value,
            "status": b.status.value,
            "progressStep": b.progress_step,
            "employee": {
                "id": b.employee.id,
                "name": b.employee.user.full_name,
                "phone": b.employee.user.phone,
                "photo": b.employee.user.profile_image or "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
                "rating": b.employee.rating,
                "completedJobs": b.employee.completed_jobs
            } if b.employee else None,
            "review": {
                "rating": b.review.rating,
                "comment": b.review.comment,
                "date": str(b.review.created_at.date())
            } if b.review else None,
            "photos": [
                {
                    "id": p.id,
                    "photoType": p.photo_type,
                    "fileUrl": p.file_url,
                    "createdAt": p.created_at.strftime("%Y-%m-%d %H:%M")
                } for p in b.photos
            ] if b.photos else [],
            "createdAt": b.created_at.strftime("%Y-%m-%d %H:%M")
        }
