from pydantic import BaseModel
from typing import Optional

class CouponValidateRequest(BaseModel):
    code: str
    amount: float

class CouponValidateResponse(BaseModel):
    valid: bool
    discount: float
    message: str
    coupon: Optional[dict] = None

class OfferCreate(BaseModel):
    title: str
    description: str
    code: str
    discount: str
    validTill: str
    category: str = "General"

class OfferOut(BaseModel):
    id: str
    title: str
    description: str
    code: str
    discount: str
    validTill: str
    category: str

    class Config:
        from_attributes = True

class CouponOut(BaseModel):
    code: str
    discount: float
    type: str # flat | percent
    maxDiscount: Optional[float] = None
    minSpend: float
    description: str
    expiry: str
