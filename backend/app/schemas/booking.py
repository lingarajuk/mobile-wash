from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import date, datetime

class VehicleSnapshot(BaseModel):
    id: Optional[str] = None
    type: Optional[str] = "sedan"
    brand: Optional[str] = None
    model: Optional[str] = None
    variant: Optional[str] = None
    regNumber: Optional[str] = None
    color: Optional[str] = None
    fuelType: Optional[str] = "Petrol"

class AddressSnapshot(BaseModel):
    id: Optional[str] = None
    label: Optional[str] = "Service Location"
    house: Optional[str] = None
    street: Optional[str] = None
    area: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = "Mysuru"
    state: Optional[str] = "Karnataka"
    pincode: Optional[str] = "570002"
    latitude: Optional[float] = 12.3118
    longitude: Optional[float] = 76.6529

class PhotoItem(BaseModel):
    photoType: str # FRONT | BACK | LEFT | RIGHT | ADDITIONAL | BEFORE | AFTER
    fileUrl: str
    employeeId: Optional[str] = None

class BookingCreateRequest(BaseModel):
    serviceId: str
    date: str # YYYY-MM-DD
    timeSlot: str
    
    # Customer Info
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    customerEmail: Optional[str] = None
    
    # Vehicle Info
    vehicleId: Optional[str] = None
    vehicleType: Optional[str] = "sedan"
    vehicleBrand: Optional[str] = None
    vehicleModel: Optional[str] = None
    vehicleVariant: Optional[str] = None
    vehicleRegNumber: Optional[str] = None
    vehicleColor: Optional[str] = None
    vehicleFuelType: Optional[str] = None
    vehicle: Optional[VehicleSnapshot] = None
    
    # Vehicle Condition & Notes
    vehicleCondition: Optional[str] = "Normal Dirt" # Light Dust, Normal Dirt, Heavy Dirt, Muddy, Other
    conditionNotes: Optional[str] = None
    specialInstructions: Optional[str] = None
    
    # Vehicle Photos
    photos: List[PhotoItem] = []
    photoUrls: List[str] = []
    
    # Address / Location
    addressId: Optional[str] = None
    fullAddress: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = "Mysuru"
    state: Optional[str] = "Karnataka"
    pincode: Optional[str] = "570002"
    latitude: Optional[float] = 12.3118
    longitude: Optional[float] = 76.6529
    address: Optional[AddressSnapshot] = None
    
    # Addons & Payment
    addonIds: List[str] = []
    couponCode: Optional[str] = None
    paymentMethod: str = "UPI (Google Pay)"

class BookingStatusUpdateRequest(BaseModel):
    status: str
    progressStep: Optional[int] = None
    notes: Optional[str] = None

class RejectBookingRequest(BaseModel):
    reason: str = Field(..., min_length=2, description="Reason for rejecting booking")

class AssignTechnicianRequest(BaseModel):
    employeeId: str

class RescheduleBookingRequest(BaseModel):
    date: str
    timeSlot: str
    reason: Optional[str] = None

class CancelBookingRequest(BaseModel):
    reason: Optional[str] = "Cancelled by user"

class BookingStatusHistoryOut(BaseModel):
    id: str
    previousStatus: Optional[str] = None
    newStatus: str
    changedBy: Optional[str] = None
    changedByRole: Optional[str] = None
    note: Optional[str] = None
    createdAt: str

class BookingLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = None
    heading: Optional[float] = None

class BookingLocationOut(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = None
    heading: Optional[float] = None
    updatedAt: str

class VehicleInspectionCreate(BaseModel):
    exteriorCondition: Optional[str] = None
    interiorCondition: Optional[str] = None
    existingScratches: Optional[str] = None
    dentsNotes: Optional[str] = None
    brokenParts: Optional[str] = None
    dirtyAreas: Optional[str] = None
    inspectionNotes: Optional[str] = None

class VehicleInspectionOut(BaseModel):
    id: str
    exteriorCondition: Optional[str] = None
    interiorCondition: Optional[str] = None
    existingScratches: Optional[str] = None
    dentsNotes: Optional[str] = None
    brokenParts: Optional[str] = None
    dirtyAreas: Optional[str] = None
    inspectionNotes: Optional[str] = None
    inspectedBy: Optional[str] = None
    createdAt: str

class BookingReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    serviceQualityRating: Optional[int] = 5
    technicianRating: Optional[int] = 5

class ReviewOut(BaseModel):
    id: str
    rating: int
    comment: Optional[str] = None
    serviceQualityRating: Optional[int] = None
    technicianRating: Optional[int] = None
    customerName: Optional[str] = None
    createdAt: str

class CustomerStatsOut(BaseModel):
    customerSince: str
    totalBookings: int
    completedBookings: int
    cancelledBookings: int
    averageRating: float
    notes: Optional[str] = None

class BookingOut(BaseModel):
    id: str
    bookingNumber: str
    customerName: Optional[str] = None
    customerPhone: Optional[str] = None
    customerEmail: Optional[str] = None
    customerPhoto: Optional[str] = None
    customerStats: Optional[CustomerStatsOut] = None
    
    vehicleCondition: Optional[str] = None
    conditionNotes: Optional[str] = None
    specialInstructions: Optional[str] = None
    rejectionReason: Optional[str] = None
    inspectionNotes: Optional[str] = None
    estimatedDuration: Optional[str] = "45 mins"
    
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
    taxAmount: float = 0.0
    finalAmount: float
    
    paymentMethod: str
    paymentStatus: str
    transactionId: Optional[str] = None
    
    status: str
    progressStep: int
    employee: Optional[dict] = None
    review: Optional[ReviewOut] = None
    photos: List[dict] = []
    beforePhotos: List[dict] = []
    afterPhotos: List[dict] = []
    
    smartSuggestions: List[str] = []
    statusHistory: List[BookingStatusHistoryOut] = []
    inspection: Optional[VehicleInspectionOut] = None
    liveLocation: Optional[BookingLocationOut] = None
    
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True
