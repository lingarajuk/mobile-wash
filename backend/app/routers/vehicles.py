from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.core.dependencies import require_customer
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("", response_model=List[VehicleOut])
def get_user_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    vehicles = db.query(Vehicle).filter(Vehicle.user_id == current_user.id).all()
    return [
        VehicleOut(
            id=v.id,
            type=v.vehicle_type,
            brand=v.brand,
            model=v.model,
            regNumber=v.registration_number,
            color=v.color,
            isDefault=v.is_default
        ) for v in vehicles
    ]

@router.post("", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def add_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    if data.isDefault:
        db.query(Vehicle).filter(Vehicle.user_id == current_user.id).update({"is_default": False})

    count = db.query(Vehicle).filter(Vehicle.user_id == current_user.id).count()

    veh = Vehicle(
        user_id=current_user.id,
        vehicle_type=data.type,
        brand=data.brand,
        model=data.model,
        registration_number=data.regNumber,
        color=data.color,
        is_default=data.isDefault if count > 0 else True
    )
    db.add(veh)
    db.commit()
    db.refresh(veh)

    return VehicleOut(
        id=veh.id,
        type=veh.vehicle_type,
        brand=veh.brand,
        model=veh.model,
        regNumber=veh.registration_number,
        color=veh.color,
        isDefault=veh.is_default
    )

@router.delete("/{vehicle_id}", response_model=dict)
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_customer)
):
    veh = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == current_user.id).first()
    if not veh:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(veh)
    db.commit()
    return {"success": True}
