from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime

class BookingCreateRequest(BaseModel):
    serviceId: str
    vehicleId: str
    addressId: str
    date: str # YYYY-MM-DD
    timeSlot: str
    addonIds: List[str] = []
    couponCode: Optional[str] = None
    paymentMethod: str = "UPI (Google Pay)"

class BookingStatusUpdateRequest(BaseModel):
    status: str
    progressStep: Optional[int] = None

class BookingReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None

class BookingOut(BaseModel):
    id: str
    service: dict
    vehicle: dict
    address: dict
    date: str
    timeSlot: str
    addons: List[dict] = []
    couponApplied: Optional[str] = None
    discountAmount: float
    basePrice: float
    addonsTotal: float
    finalAmount: float
    paymentMethod: str
    paymentStatus: str
    status: str
    progressStep: int
    employee: Optional[dict] = None
    review: Optional[dict] = None
    createdAt: str

    class Config:
        from_attributes = True
