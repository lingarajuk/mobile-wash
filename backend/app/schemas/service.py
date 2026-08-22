from pydantic import BaseModel
from typing import Optional, List

class ServiceCreate(BaseModel):
    name: str
    category: str
    price: float
    originalPrice: float
    duration: str = "30 mins"
    badge: Optional[str] = None
    image: Optional[str] = None
    description: str
    included: List[str] = []
    notIncluded: List[str] = []
    recommendedVehicles: List[str] = []

class ServiceOut(BaseModel):
    id: str
    name: str
    category: str
    price: float
    originalPrice: float
    duration: str
    rating: float
    reviewsCount: int
    badge: Optional[str] = None
    image: Optional[str] = None
    description: str
    included: List[str]
    notIncluded: List[str]
    recommendedVehicles: List[str]

    class Config:
        from_attributes = True
