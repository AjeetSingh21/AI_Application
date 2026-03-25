from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    type: str
    capacity: float = Field(..., gt=0, description="Capacity in kg")
    current_load: float = Field(..., ge=0, description="Current load in kg")


class VehicleCreate(VehicleBase):
    pass


class Vehicle(VehicleBase):
    id: str
    
    class Config:
        from_attributes = True
