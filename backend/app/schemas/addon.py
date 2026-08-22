from pydantic import BaseModel
from typing import Optional

class AddonCreate(BaseModel):
    name: str
    price: float
    icon: str = "Sparkles"
    description: str

class AddonOut(BaseModel):
    id: str
    name: str
    price: float
    icon: str
    description: str

    class Config:
        from_attributes = True
