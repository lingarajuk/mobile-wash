import uuid
from datetime import datetime
from sqlalchemy import String, Text, Numeric, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base
import enum

class DiscountType(str, enum.Enum):
    FLAT = "flat"
    PERCENT = "percent"

class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    discount_type: Mapped[DiscountType] = mapped_column(SQLEnum(DiscountType), default=DiscountType.FLAT, nullable=False)
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    minimum_order_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)
    maximum_discount: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    expiry_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="General", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
