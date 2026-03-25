from pydantic import BaseModel
from typing import List


class Alert(BaseModel):
    order_id: str
    alert_type: str
    severity: str  # low, medium, high
    message: str
    delay_score: int
