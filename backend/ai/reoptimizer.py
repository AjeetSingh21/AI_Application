"""
Re-optimization Engine
Handles re-optimization when delays or issues are detected
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime


class Reoptimizer:
    def __init__(self, warehouses: List[dict], drivers: List[dict], 
                 vehicles: List[dict], graph_data: dict):
        """
        Initialize re-optimizer
        
        Args:
            warehouses: Available warehouses
            drivers: Available drivers
            vehicles: Available vehicles
            graph_data: Graph data for routing
        """
        self.warehouses = warehouses
        self.drivers = drivers
        self.vehicles = vehicles
        self.graph_data = graph_data
    
    def identify_optimization_options(self, current_assignment: dict,
                                     delay_info: dict) -> List[str]:
        """
        Identify possible re-optimization strategies
        
        Args:
            current_assignment: Current warehouse/driver/vehicle assignment
            delay_info: Delay risk information
            
        Returns:
            List of optimization options
        """
        options = []
        
        risk_score = delay_info.get("risk_score", 0)
        component_scores = delay_info.get("component_scores", {})
        
        # High route risk - try different warehouse
        if component_scores.get("route", 0) >= 3:
            options.append("change_warehouse")
        
        # High traffic risk - try different route or earlier departure
        if component_scores.get("traffic", 0) >= 3:
            options.append("recalculate_route")
            options.append("adjust_departure_time")
        
        # High load risk - try different vehicle
        if component_scores.get("load", 0) >= 3:
            options.append("change_vehicle")
        
        # High deadline risk - prioritize or change assignment
        if component_scores.get("deadline", 0) >= 4:
            options.append("priority_boost")
            options.append("reassign_driver")
        
        return options
    
    def try_alternative_warehouse(self, order_location: str, 
                                 current_warehouse_id: str,
                                 order_weight: float,
                                 priority: str) -> Optional[dict]:
        """
        Try to find a better warehouse
        
        Args:
            order_location: Delivery location
            current_warehouse_id: Currently assigned warehouse
            order_weight: Order weight
            priority: Order priority
            
        Returns:
            Better warehouse or None
        """
        from backend.ai.warehouse_selector import WarehouseSelector
        
        selector = WarehouseSelector(self.warehouses, self.graph_data)
        best = selector.select_best_warehouse(order_location, order_weight, priority)
        
        if best and best["id"] != current_warehouse_id:
            return best
        
        return None
    
    def try_alternative_vehicle(self, order_weight: float,
                               current_vehicle_id: str,
                               priority: str) -> Optional[dict]:
        """
        Try to find a better vehicle
        
        Args:
            order_weight: Order weight
            current_vehicle_id: Currently assigned vehicle
            priority: Order priority
            
        Returns:
            Better vehicle or None
        """
        from backend.ai.driver_assigner import DriverVehicleAssigner
        
        assigner = DriverVehicleAssigner(self.drivers, self.vehicles)
        result = assigner.assign_driver_vehicle(order_weight, priority)
        
        if result:
            driver, vehicle = result
            if vehicle["id"] != current_vehicle_id:
                return {"driver": driver, "vehicle": vehicle}
        
        return None
    
    def recalculate_route(self, start: str, end: str) -> dict:
        """
        Recalculate route with different parameters
        
        Args:
            start: Starting location
            end: Destination location
            
        Returns:
            Alternative route information
        """
        from backend.ai.astar import AStarPathfinder
        
        pathfinder = AStarPathfinder(self.graph_data)
        path, cost = pathfinder.find_path(start, end)
        
        if path:
            return {
                "success": True,
                "path": path,
                "total_cost": round(cost, 2)
            }
        
        return {"success": False, "error": "No alternative route found"}
    
    def generate_reoptimization_plan(self, order: dict, 
                                    current_assignment: dict,
                                    delay_info: dict) -> dict:
        """
        Generate comprehensive re-optimization plan
        
        Args:
            order: Order details
            current_assignment: Current assignment
            delay_info: Delay risk information
            
        Returns:
            Re-optimization plan with recommendations
        """
        risk_level = delay_info.get("risk_level", "low")
        
        # If low risk, no action needed
        if risk_level == "low":
            return {
                "action_required": False,
                "reason": "Current assignment has low delay risk"
            }
        
        # Identify options
        options = self.identify_optimization_options(current_assignment, delay_info)
        
        proposed_changes = []
        
        # Try each option
        if "change_warehouse" in options:
            alt_warehouse = self.try_alternative_warehouse(
                order["location"],
                current_assignment.get("warehouse_id"),
                order["weight"],
                order["priority"]
            )
            if alt_warehouse:
                proposed_changes.append({
                    "type": "warehouse",
                    "from": current_assignment.get("warehouse_id"),
                    "to": alt_warehouse["id"],
                    "reason": "Better location or lower load"
                })
        
        if "change_vehicle" in options:
            alt_vehicle = self.try_alternative_vehicle(
                order["weight"],
                current_assignment.get("vehicle_id"),
                order["priority"]
            )
            if alt_vehicle:
                proposed_changes.append({
                    "type": "vehicle",
                    "from": current_assignment.get("vehicle_id"),
                    "to": alt_vehicle["vehicle"]["id"],
                    "reason": "Better capacity utilization"
                })
        
        if "recalculate_route" in options:
            # For now, just note that route could be recalculated
            proposed_changes.append({
                "type": "route",
                "action": "recalculate",
                "reason": "High traffic detected"
            })
        
        # Determine if changes are worthwhile
        if not proposed_changes:
            return {
                "action_required": True,
                "can_improve": False,
                "message": "High risk detected but no clear improvements available",
                "suggestions": ["Monitor closely", "Prepare contingency plan"]
            }
        
        return {
            "action_required": True,
            "can_improve": True,
            "proposed_changes": proposed_changes,
            "expected_benefit": f"Reduce delay risk from {risk_level} to lower level",
            "recommendations": [
                "Implement changes immediately" if len(proposed_changes) > 1 else "Consider suggested change",
                "Monitor new assignment performance"
            ]
        }


def create_reoptimizer() -> Reoptimizer:
    """Create a reoptimizer instance with current data"""
    import json
    from pathlib import Path
    
    # Load data
    base_path = Path(__file__).parent.parent / "data"
    
    with open(base_path / "warehouses.json") as f:
        warehouses = json.load(f)["warehouses"]
    
    with open(base_path / "drivers.json") as f:
        drivers = json.load(f)["drivers"]
    
    with open(base_path / "vehicles.json") as f:
        vehicles = json.load(f)["vehicles"]
    
    with open(base_path / "graph.json") as f:
        graph_data = json.load(f)
    
    return Reoptimizer(warehouses, drivers, vehicles, graph_data)
