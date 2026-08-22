from pydantic import BaseModel
from typing import Optional

class BusinessSettingsSchema(BaseModel):
    businessName: str
    tagline: str
    phone: str
    email: str
    address: str
    openingTime: str
    closingTime: str
    serviceAreas: str
    taxPercentage: float
    cancellationRules: str

    class Config:
        from_attributes = True
