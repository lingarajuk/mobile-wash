from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.offer import Offer, DiscountType
from app.schemas.offer import OfferOut, CouponOut, CouponValidateRequest, CouponValidateResponse

router = APIRouter(prefix="/offers", tags=["Offers & Coupons"])

@router.get("", response_model=List[OfferOut])
def get_offers(db: Session = Depends(get_db)):
    offers = db.query(Offer).filter(Offer.is_active == True).all()
    return [
        OfferOut(
            id=o.id,
            title=o.title,
            description=o.description,
            code=o.code,
            discount=f"₹{int(o.discount_value)} OFF" if o.discount_type == DiscountType.FLAT else f"{int(o.discount_value)}% OFF",
            validTill=o.expiry_date.strftime("%dth %b %Y") if o.expiry_date else "Always Active",
            category=o.category
        ) for o in offers
    ]

@router.get("/coupons", response_model=List[CouponOut])
def get_coupons(db: Session = Depends(get_db)):
    offers = db.query(Offer).filter(Offer.is_active == True).all()
    return [
        CouponOut(
            code=o.code,
            discount=float(o.discount_value),
            type=o.discount_type.value,
            maxDiscount=float(o.maximum_discount) if o.maximum_discount else None,
            minSpend=float(o.minimum_order_amount),
            description=o.description,
            expiry=o.expiry_date.strftime("%Y-%m-%d") if o.expiry_date else "2026-12-31"
        ) for o in offers
    ]

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(request: CouponValidateRequest, db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.code == request.code, Offer.is_active == True).first()
    if not offer:
        return CouponValidateResponse(valid=False, discount=0, message="Invalid coupon code.")

    if request.amount < float(offer.minimum_order_amount):
        return CouponValidateResponse(
            valid=False,
            discount=0,
            message=f"Minimum order amount ₹{offer.minimum_order_amount} required for this coupon."
        )

    discount = 0.0
    if offer.discount_type == DiscountType.FLAT:
        discount = float(offer.discount_value)
    else:
        calc = (request.amount * float(offer.discount_value)) / 100.0
        if offer.maximum_discount:
            calc = min(calc, float(offer.maximum_discount))
        discount = calc

    return CouponValidateResponse(
        valid=True,
        discount=round(discount, 2),
        message=f"Coupon applied successfully! Saved ₹{int(discount)}.",
        coupon={
            "code": offer.code,
            "discount": discount
        }
    )
