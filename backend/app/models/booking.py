import uuid
from datetime import datetime, date
from sqlalchemy import String, Date, Integer, Numeric, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base
import enum

class BookingStatus(str, enum.Enum):
    PENDING_VERIFICATION = "Pending Verification"
    VERIFIED = "Verified"
    REJECTED = "Rejected"
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    ASSIGNED = "Assigned"
    ACCEPTED = "Accepted"
    ON_THE_WAY = "On The Way"
    ARRIVED = "Arrived"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class PaymentStatus(str, enum.Enum):
    PENDING = "Pending"
    SUCCESS = "Paid"
    FAILED = "Failed"
    REFUNDED = "Refunded"

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id: Mapped[str] = mapped_column(String(36), ForeignKey("vehicles.id"), nullable=False)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=False)
    address_id: Mapped[str] = mapped_column(String(36), ForeignKey("addresses.id"), nullable=False)
    employee_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("employees.id"), nullable=True, index=True)
    
    # Customer Details Snapshot
    customer_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    customer_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    customer_email: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Vehicle Condition & Notes
    vehicle_condition: Mapped[str | None] = mapped_column(String(100), nullable=True)
    condition_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    special_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    inspection_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    scratches_dents_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_duration: Mapped[str | None] = mapped_column(String(50), default="45 mins", nullable=True)

    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    scheduled_time: Mapped[str] = mapped_column(String(50), nullable=False)
    
    status: Mapped[str] = mapped_column(String(50), default="Pending Verification", nullable=False, index=True)
    progress_step: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    base_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    addon_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    tax_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    
    coupon_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="Pending", nullable=False)
    transaction_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("User", back_populates="bookings", foreign_keys=[customer_id])
    vehicle = relationship("Vehicle", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    address = relationship("Address", back_populates="bookings")
    employee = relationship("Employee", back_populates="assigned_bookings", foreign_keys=[employee_id])
    
    booking_addons = relationship("BookingAddon", back_populates="booking", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    photos = relationship("BookingPhoto", back_populates="booking", cascade="all, delete-orphan")
    status_history = relationship("BookingStatusHistory", back_populates="booking", cascade="all, delete-orphan", order_by="BookingStatusHistory.created_at.asc()")
    live_location = relationship("BookingLocation", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    inspection = relationship("VehicleInspection", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    work_updates = relationship("BookingWorkUpdate", back_populates="booking", cascade="all, delete-orphan", order_by="BookingWorkUpdate.created_at.asc()")

class BookingAddon(Base):
    __tablename__ = "booking_addons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    addon_id: Mapped[str] = mapped_column(String(36), ForeignKey("addons.id"), nullable=False)
    price_at_booking: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="booking_addons")
    addon = relationship("Addon")

class BookingPhoto(Base):
    __tablename__ = "booking_photos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    uploaded_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    employee_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    photo_type: Mapped[str] = mapped_column(String(50), nullable=False) # FRONT | BACK | LEFT | RIGHT | ADDITIONAL | BEFORE | AFTER
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="photos")

class BookingLocation(Base):
    __tablename__ = "booking_locations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True)
    employee_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    heading: Mapped[float | None] = mapped_column(Float, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="live_location")

class VehicleInspection(Base):
    __tablename__ = "vehicle_inspections"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(50), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True)
    exterior_condition: Mapped[str | None] = mapped_column(String(100), nullable=True)
    interior_condition: Mapped[str | None] = mapped_column(String(100), nullable=True)
    existing_scratches: Mapped[str | None] = mapped_column(Text, nullable=True)
    dents_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    broken_parts: Mapped[str | None] = mapped_column(Text, nullable=True)
    dirty_areas: Mapped[str | None] = mapped_column(Text, nullable=True)
    inspection_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    inspected_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="inspection")

class BookingWorkUpdate(Base):
    __tablename__ = "booking_work_updates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    update_text: Mapped[str] = mapped_column(Text, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    booking = relationship("Booking", back_populates="work_updates")
