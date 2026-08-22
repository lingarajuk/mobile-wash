from sqlalchemy import String, Text, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base

class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    business_name: Mapped[str] = mapped_column(String(100), default="AquaGo Wash", nullable=False)
    tagline: Mapped[str] = mapped_column(String(255), default="Professional Vehicle Care at Your Doorstep", nullable=False)
    phone: Mapped[str] = mapped_column(String(30), default="+91 800-AQUAGO (278246)", nullable=False)
    email: Mapped[str] = mapped_column(String(100), default="support@aquago.com", nullable=False)
    address: Mapped[str] = mapped_column(Text, default="102 Waterworks Blvd, Mysuru, Karnataka 570002", nullable=False)
    opening_time: Mapped[str] = mapped_column(String(20), default="07:00 AM", nullable=False)
    closing_time: Mapped[str] = mapped_column(String(20), default="08:00 PM", nullable=False)
    service_areas: Mapped[str] = mapped_column(Text, default="Mysuru City, Hebbal, Vijayanagar, Kuvempunagar, Saraswathipuram", nullable=False)
    tax_percentage: Mapped[float] = mapped_column(Numeric(5, 2), default=18.00, nullable=False)
    cancellation_rules: Mapped[str] = mapped_column(Text, default="Free cancellation up to 2 hours before scheduled slot.", nullable=False)
