from pydantic import BaseModel, Field


class WarehouseBase(BaseModel):
    location: str
    stock: int = Field(..., ge=0)
    load: float = Field(..., ge=0, le=100, description="Load percentage")


class WarehouseCreate(WarehouseBase):
    pass


class Warehouse(WarehouseBase):
    id: str
    
    class Config:
        from_attributes = True
