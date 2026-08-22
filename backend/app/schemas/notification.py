from pydantic import BaseModel
from typing import Optional

class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    time: str
    read: bool
    type: str = "booking"

    class Config:
        from_attributes = True
