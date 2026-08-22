from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.core.dependencies import require_customer
from app.models.user import User
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressOut

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("", response_model=List[AddressOut])
def get_user_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    addresses = db.query(Address).filter(Address.user_id == current_user.id).all()
    return [
        AddressOut(
            id=a.id,
            label=a.label,
            house=a.house,
            street=a.street,
            area=a.area,
            landmark=a.landmark,
            city=a.city,
            state=a.state,
            pincode=a.pincode,
            isDefault=a.is_default
        ) for a in addresses
    ]

@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def add_address(
    data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    if data.isDefault:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    count = db.query(Address).filter(Address.user_id == current_user.id).count()

    addr = Address(
        user_id=current_user.id,
        label=data.label,
        house=data.house,
        street=data.street,
        area=data.area,
        landmark=data.landmark,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        is_default=data.isDefault if count > 0 else True
    )
    db.add(addr)
    db.commit()
    db.refresh(addr)

    return AddressOut(
        id=addr.id,
        label=addr.label,
        house=addr.house,
        street=addr.street,
        area=addr.area,
        landmark=addr.landmark,
        city=addr.city,
        state=addr.state,
        pincode=addr.pincode,
        isDefault=addr.is_default
    )

@router.delete("/{address_id}", response_model=dict)
def delete_address(
    address_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(addr)
    db.commit()
    return {"success": True}
