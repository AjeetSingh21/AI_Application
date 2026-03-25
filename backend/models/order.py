from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OrderBase(BaseModel):
    location: str
    weight: float = Field(..., gt=0, description="Weight in kg")
    priority: str = Field(..., pattern="^(low|medium|high)$")
    deadline: datetime


class OrderCreate(OrderBase):
    pass


class Order(OrderBase):
    id: str
    status: str = "pending"
    
    class Config:
        from_attributes = True


class OrderAssignment(BaseModel):
    order_id: str
    warehouse_id: str
    driver_id: str
    vehicle_id: str
    route: list[str]
    total_distance: float
    delay_risk: str
    delay_score: int
