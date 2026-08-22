from pydantic import BaseModel
from typing import Optional

class VehicleCreate(BaseModel):
    type: str # bike | scooter | hatchback | sedan | suv | luxury
    brand: str
    model: str
    regNumber: str
    color: str
    isDefault: Optional[bool] = False

class VehicleUpdate(BaseModel):
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    regNumber: Optional[str] = None
    color: Optional[str] = None
    isDefault: Optional[bool] = None

class VehicleOut(BaseModel):
    id: str
    type: str
    brand: str
    model: str
    regNumber: str
    color: str
    isDefault: bool

    class Config:
        from_attributes = True
