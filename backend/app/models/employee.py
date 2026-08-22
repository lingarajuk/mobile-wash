import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base
import enum

class EmployeeStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_JOB = "On Job"
    OFFLINE = "Offline"

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    designation: Mapped[str] = mapped_column(String(100), default="Wash Specialist", nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    completed_jobs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    today_earnings: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    total_earnings: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    status: Mapped[EmployeeStatus] = mapped_column(SQLEnum(EmployeeStatus), default=EmployeeStatus.AVAILABLE, nullable=False)
    current_location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="employee_profile")
    assigned_bookings = relationship("Booking", back_populates="employee", foreign_keys="Booking.employee_id")
