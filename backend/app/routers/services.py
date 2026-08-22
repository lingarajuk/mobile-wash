from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.service import Service
from app.models.addon import Addon
from app.schemas.service import ServiceOut
from app.schemas.addon import AddonOut

router = APIRouter(prefix="/services", tags=["Services & Addons"])

@router.get("", response_model=List[ServiceOut])
def get_services(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(""),
    db: Session = Depends(get_db)
):
    query = db.query(Service).filter(Service.is_active == True)
    
    if category and category != 'all':
        query = query.filter(Service.category == category)
        
    services = query.all()
    
    if search and search.strip():
        q = search.strip().lower()
        services = [s for s in services if q in s.name.lower() or q in s.description.lower()]

    return [
        ServiceOut(
            id=s.id,
            name=s.name,
            category=s.category,
            price=float(s.price),
            originalPrice=float(s.original_price),
            duration=f"{s.duration_minutes} mins",
            rating=s.rating,
            reviewsCount=s.reviews_count,
            badge=s.badge,
            image=s.image_url,
            description=s.description,
            included=s.included_json,
            notIncluded=s.not_included_json,
            recommendedVehicles=s.recommended_vehicles_json
        ) for s in services
    ]

@router.get("/addons", response_model=List[AddonOut])
def get_addons(db: Session = Depends(get_db)):
    addons = db.query(Addon).filter(Addon.is_active == True).all()
    return [
        AddonOut(
            id=a.id,
            name=a.name,
            price=float(a.price),
            icon=a.icon,
            description=a.description
        ) for a in addons
    ]

@router.get("/{service_id}", response_model=ServiceOut)
def get_service_by_id(service_id: str, db: Session = Depends(get_db)):
    s = db.query(Service).filter(Service.id == service_id, Service.is_active == True).first()
    if not s:
        raise HTTPException(status_code=404, detail="Service not found")

    return ServiceOut(
        id=s.id,
        name=s.name,
        category=s.category,
        price=float(s.price),
        originalPrice=float(s.original_price),
        duration=f"{s.duration_minutes} mins",
        rating=s.rating,
        reviewsCount=s.reviews_count,
        badge=s.badge,
        image=s.image_url,
        description=s.description,
        included=s.included_json,
        notIncluded=s.not_included_json,
        recommendedVehicles=s.recommended_vehicles_json
    )
