from pydantic import BaseModel


class DriverBase(BaseModel):
    name: str
    available: bool
    region: str


class DriverCreate(DriverBase):
    pass


class Driver(DriverBase):
    id: str
    
    class Config:
        from_attributes = True
