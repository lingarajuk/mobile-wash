from pydantic import BaseModel
from typing import Optional

class AddressCreate(BaseModel):
    label: str = "Home"
    house: str
    street: str
    area: str
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    isDefault: Optional[bool] = False

class AddressUpdate(BaseModel):
    label: Optional[str] = None
    house: Optional[str] = None
    street: Optional[str] = None
    area: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    isDefault: Optional[bool] = None

class AddressOut(BaseModel):
    id: str
    label: str
    house: str
    street: str
    area: str
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    isDefault: bool

    class Config:
        from_attributes = True
