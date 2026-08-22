import uuid
from sqlalchemy import String, Text, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base

class Addon(Base):
    __tablename__ = "addons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=False, default="Sparkles")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
