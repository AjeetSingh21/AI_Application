"""
Warehouse Selection Engine
Scores and selects the best warehouse for an order based on multiple factors
"""

from typing import List, Dict, Optional
import json
from pathlib import Path


class WarehouseSelector:
    def __init__(self, warehouses: List[dict], graph_data: dict):
        """
        Initialize warehouse selector
        
        Args:
            warehouses: List of warehouse dictionaries
            graph_data: Graph data for distance calculations
        """
        self.warehouses = warehouses
        self.graph_data = graph_data
        
        # Build simple distance lookup
        self.distances = {}
        for edge in graph_data["edges"]:
            key = (edge["from"], edge["to"])
            self.distances[key] = edge["distance"]
    
    def calculate_distance_score(self, warehouse_loc: str, order_loc: str) -> float:
        """
        Calculate distance score (lower distance = higher score)
        
        Returns:
            Score from 0 to 100
        """
        if warehouse_loc == order_loc:
            return 100.0
        
        # Check direct edge
        dist = self.distances.get((warehouse_loc, order_loc))
        if dist is None:
            # Use reverse edge or estimate
            dist = self.distances.get((order_loc, warehouse_loc), 100)
        
        # Normalize: assume max distance is 200
        max_dist = 200
        score = max(0, 100 - (dist / max_dist * 100))
        return score
    
    def calculate_load_score(self, load_percentage: float) -> float:
        """
        Calculate load score (lower load = higher score)
        
        Returns:
            Score from 0 to 100
        """
        return max(0, 100 - load_percentage)
    
    def calculate_stock_score(self, stock: int, required_weight: float) -> float:
        """
        Calculate stock score (higher stock relative to requirement = higher score)
        
        Returns:
            Score from 0 to 100
        """
        if stock >= required_weight * 5:
            return 100.0
        elif stock >= required_weight * 2:
            return 80.0
        elif stock >= required_weight:
            return 60.0
        else:
            return max(0, (stock / required_weight) * 60)
    
    def calculate_urgency_score(self, priority: str) -> float:
        """
        Calculate urgency bonus score based on priority
        
        Returns:
            Score multiplier
        """
        priority_map = {
            "high": 1.3,
            "medium": 1.0,
            "low": 0.8
        }
        return priority_map.get(priority, 1.0)
    
    def select_best_warehouse(self, order_location: str, order_weight: float, 
                             priority: str) -> Optional[dict]:
        """
        Select the best warehouse for an order using weighted scoring
        
        Args:
            order_location: Delivery location
            order_weight: Order weight in kg
            priority: Order priority (low/medium/high)
            
        Returns:
            Best warehouse dictionary or None
        """
        if not self.warehouses:
            return None
        
        best_warehouse = None
        best_score = -float('inf')
        
        for warehouse in self.warehouses:
            # Calculate individual scores
            distance_score = self.calculate_distance_score(
                warehouse["location"], order_location
            )
            load_score = self.calculate_load_score(warehouse["load"])
            stock_score = self.calculate_stock_score(warehouse["stock"], order_weight)
            urgency_multiplier = self.calculate_urgency_score(priority)
            
            # Weighted combination
            # Distance: 40%, Load: 25%, Stock: 35%
            base_score = (
                distance_score * 0.4 +
                load_score * 0.25 +
                stock_score * 0.35
            )
            
            # Apply urgency multiplier
            final_score = base_score * urgency_multiplier
            
            if final_score > best_score:
                best_score = final_score
                best_warehouse = warehouse
        
        return best_warehouse


def load_warehouses() -> list:
    """Load warehouse data from JSON file"""
    warehouses_path = Path(__file__).parent.parent / "data" / "warehouses.json"
    with open(warehouses_path, 'r') as f:
        data = json.load(f)
        return data["warehouses"]


def load_graph() -> dict:
    """Load graph data from JSON file"""
    graph_path = Path(__file__).parent.parent / "data" / "graph.json"
    with open(graph_path, 'r') as f:
        return json.load(f)


def find_best_warehouse(order_location: str, order_weight: float, 
                       priority: str) -> dict:
    """
    Convenience function to find best warehouse
    
    Args:
        order_location: Delivery location
        order_weight: Order weight in kg
        priority: Order priority
        
    Returns:
        Dictionary with selected warehouse and score
    """
    warehouses = load_warehouses()
    graph_data = load_graph()
    
    selector = WarehouseSelector(warehouses, graph_data)
    best = selector.select_best_warehouse(order_location, order_weight, priority)
    
    if best:
        return {
            "success": True,
            "warehouse": best,
            "reason": "Best balance of distance, load, and stock availability"
        }
    else:
        return {
            "success": False,
            "error": "No warehouses available"
        }
