"""
Driver and Vehicle Assignment Engine
Assigns optimal driver and vehicle pair based on constraints and availability
"""

from typing import List, Dict, Optional, Tuple
import json
from pathlib import Path


class DriverVehicleAssigner:
    def __init__(self, drivers: List[dict], vehicles: List[dict]):
        """
        Initialize assigner
        
        Args:
            drivers: List of driver dictionaries
            vehicles: List of vehicle dictionaries
        """
        self.drivers = drivers
        self.vehicles = vehicles
    
    def find_available_drivers(self) -> List[dict]:
        """Get all available drivers"""
        return [d for d in self.drivers if d["available"]]
    
    def find_suitable_vehicles(self, required_capacity: float) -> List[dict]:
        """
        Get vehicles with sufficient capacity
        
        Args:
            required_capacity: Required capacity in kg
            
        Returns:
            List of suitable vehicles
        """
        suitable = []
        for v in self.vehicles:
            available_capacity = v["capacity"] - v["current_load"]
            if available_capacity >= required_capacity:
                suitable.append(v)
        return suitable
    
    def calculate_vehicle_efficiency_score(self, vehicle: dict, 
                                          required_weight: float) -> float:
        """
        Calculate efficiency score for vehicle selection
        Prefer vehicles that are well-utilized but not overloaded
        
        Args:
            vehicle: Vehicle dictionary
            required_weight: Order weight
            
        Returns:
            Score from 0 to 100
        """
        available_capacity = vehicle["capacity"] - vehicle["current_load"]
        
        # Utilization ratio (how much of remaining capacity will be used)
        if available_capacity == 0:
            return 0
        
        utilization = required_weight / available_capacity
        
        # Optimal utilization is 60-80%
        if 0.6 <= utilization <= 0.8:
            capacity_score = 100
        elif utilization < 0.6:
            capacity_score = max(40, utilization * 100)
        else:
            capacity_score = max(50, 100 - (utilization - 0.8) * 200)
        
        # Prefer vehicles with lower current load (more experienced/efficient)
        load_ratio = vehicle["current_load"] / vehicle["capacity"]
        experience_score = (1 - load_ratio) * 50 + 50
        
        return (capacity_score * 0.7 + experience_score * 0.3)
    
    def assign_driver_vehicle(self, order_weight: float, 
                             priority: str = "medium") -> Optional[Tuple[dict, dict]]:
        """
        Find best driver-vehicle pair for an order
        
        Args:
            order_weight: Order weight in kg
            priority: Order priority
            
        Returns:
            Tuple of (driver, vehicle) or None
        """
        available_drivers = self.find_available_drivers()
        suitable_vehicles = self.find_suitable_vehicles(order_weight)
        
        if not available_drivers or not suitable_vehicles:
            return None
        
        # For high priority orders, use best combination
        # For lower priority, balance the load
        best_combination = None
        best_score = -float('inf')
        
        for driver in available_drivers:
            for vehicle in suitable_vehicles:
                # Base score from vehicle efficiency
                vehicle_score = self.calculate_vehicle_efficiency_score(
                    vehicle, order_weight
                )
                
                # Priority bonus
                if priority == "high":
                    # Prefer most efficient vehicle
                    final_score = vehicle_score
                else:
                    # Balance across fleet
                    final_score = vehicle_score * 0.8 + 20
                
                if final_score > best_score:
                    best_score = final_score
                    best_combination = (driver, vehicle)
        
        return best_combination


def load_drivers() -> list:
    """Load driver data from JSON file"""
    drivers_path = Path(__file__).parent.parent / "data" / "drivers.json"
    with open(drivers_path, 'r') as f:
        data = json.load(f)
        return data["drivers"]


def load_vehicles() -> list:
    """Load vehicle data from JSON file"""
    vehicles_path = Path(__file__).parent.parent / "data" / "vehicles.json"
    with open(vehicles_path, 'r') as f:
        data = json.load(f)
        return data["vehicles"]


def find_best_driver_vehicle(order_weight: float, priority: str = "medium") -> dict:
    """
    Convenience function to find best driver-vehicle pair
    
    Args:
        order_weight: Order weight in kg
        priority: Order priority
        
    Returns:
        Dictionary with assignments and status
    """
    drivers = load_drivers()
    vehicles = load_vehicles()
    
    assigner = DriverVehicleAssigner(drivers, vehicles)
    result = assigner.assign_driver_vehicle(order_weight, priority)
    
    if result:
        driver, vehicle = result
        return {
            "success": True,
            "driver": driver,
            "vehicle": vehicle,
            "reason": "Best match based on availability and capacity"
        }
    else:
        return {
            "success": False,
            "error": "No suitable driver-vehicle combination found",
            "details": {
                "available_drivers": len(assigner.find_available_drivers()),
                "suitable_vehicles": len(assigner.find_suitable_vehicles(order_weight))
            }
        }
