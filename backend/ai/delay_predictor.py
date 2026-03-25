"""
Delay Prediction Model
Predicts delivery delay risk using rule-based scoring system
"""

from typing import Dict, Optional
from datetime import datetime


class DelayPredictor:
    def __init__(self):
        """Initialize delay predictor"""
        pass
    
    def calculate_route_risk(self, route_length: int, total_distance: float) -> int:
        """
        Calculate risk score based on route characteristics
        
        Args:
            route_length: Number of stops in route
            total_distance: Total distance in km
            
        Returns:
            Risk score (0-10)
        """
        risk = 0
        
        # Long route penalty
        if route_length > 5:
            risk += 3
        elif route_length > 3:
            risk += 2
        elif route_length > 2:
            risk += 1
        
        # Long distance penalty
        if total_distance > 200:
            risk += 3
        elif total_distance > 150:
            risk += 2
        elif total_distance > 100:
            risk += 1
        
        return min(risk, 6)
    
    def calculate_traffic_risk(self, traffic_factor: float) -> int:
        """
        Calculate risk based on traffic conditions
        
        Args:
            traffic_factor: Average traffic multiplier (1.0 = normal)
            
        Returns:
            Risk score (0-5)
        """
        if traffic_factor >= 2.0:
            return 5
        elif traffic_factor >= 1.8:
            return 4
        elif traffic_factor >= 1.5:
            return 3
        elif traffic_factor >= 1.3:
            return 2
        elif traffic_factor >= 1.1:
            return 1
        else:
            return 0
    
    def calculate_load_risk(self, vehicle_load_percentage: float) -> int:
        """
        Calculate risk based on vehicle load
        
        Args:
            vehicle_load_percentage: Current load as percentage of capacity
            
        Returns:
            Risk score (0-5)
        """
        if vehicle_load_percentage >= 95:
            return 4
        elif vehicle_load_percentage >= 85:
            return 3
        elif vehicle_load_percentage >= 70:
            return 2
        elif vehicle_load_percentage >= 50:
            return 1
        else:
            return 0
    
    def calculate_deadline_risk(self, deadline: datetime, 
                               estimated_delivery: datetime) -> int:
        """
        Calculate risk based on deadline tightness
        
        Args:
            deadline: Required delivery time
            estimated_delivery: Estimated arrival time
            
        Returns:
            Risk score (0-8)
        """
        time_buffer = (deadline - estimated_delivery).total_seconds() / 3600  # hours
        
        if time_buffer < 0:
            # Already late
            return 8
        elif time_buffer < 2:
            # Less than 2 hours buffer
            return 6
        elif time_buffer < 6:
            # Less than 6 hours buffer
            return 4
        elif time_buffer < 12:
            # Less than 12 hours buffer
            return 2
        else:
            return 0
    
    def predict_delay_risk(self, route_info: dict, vehicle_info: dict,
                          deadline_str: str, priority: str) -> dict:
        """
        Predict overall delay risk for a delivery
        
        Args:
            route_info: Route information (path, distance, traffic)
            vehicle_info: Vehicle information (load, capacity)
            deadline_str: Delivery deadline ISO string
            priority: Order priority
            
        Returns:
            Dictionary with risk assessment
        """
        # Calculate individual risk components
        route_length = len(route_info.get("path", []))
        total_distance = route_info.get("total_cost", 0)
        avg_traffic = route_info.get("avg_traffic", 1.0)
        
        vehicle_load = vehicle_info.get("current_load", 0)
        vehicle_capacity = vehicle_info.get("capacity", 1000)
        load_percentage = (vehicle_load / vehicle_capacity * 100) if vehicle_capacity > 0 else 100
        
        try:
            deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
            # Estimate delivery time (assume 50 km/h average + 1 hour per stop)
            travel_hours = total_distance / 50
            stop_hours = route_length * 1
            estimated_delivery = datetime.now()
            from datetime import timedelta
            estimated_delivery = estimated_delivery + timedelta(
                hours=travel_hours + stop_hours
            )
        except:
            deadline = datetime.max
            estimated_delivery = datetime.max
        
        # Calculate component scores
        route_risk = self.calculate_route_risk(route_length, total_distance)
        traffic_risk = self.calculate_traffic_risk(avg_traffic)
        load_risk = self.calculate_load_risk(load_percentage)
        deadline_risk = self.calculate_deadline_risk(deadline, estimated_delivery)
        
        # Weighted total (route and deadline are most important)
        total_score = (
            route_risk * 0.25 +
            traffic_risk * 0.20 +
            load_risk * 0.20 +
            deadline_risk * 0.35
        )
        
        # Normalize to 0-10 scale
        total_score = min(10, max(0, total_score))
        
        # Determine risk level
        if total_score >= 7:
            risk_level = "high"
            risk_color = "red"
        elif total_score >= 4:
            risk_level = "medium"
            risk_color = "yellow"
        else:
            risk_level = "low"
            risk_color = "green"
        
        # Generate recommendations
        recommendations = []
        if route_risk >= 3:
            recommendations.append("Consider alternative shorter route")
        if traffic_risk >= 3:
            recommendations.append("High traffic expected - depart early")
        if load_risk >= 3:
            recommendations.append("Vehicle near capacity - monitor performance")
        if deadline_risk >= 4:
            recommendations.append("Tight deadline - prioritize this delivery")
        
        return {
            "risk_level": risk_level,
            "risk_color": risk_color,
            "risk_score": round(total_score, 1),
            "component_scores": {
                "route": route_risk,
                "traffic": traffic_risk,
                "load": load_risk,
                "deadline": deadline_risk
            },
            "recommendations": recommendations,
            "estimated_travel_hours": round(travel_hours + stop_hours, 1)
        }


def predict_delay(order_data: dict, route_data: dict, 
                 vehicle_data: dict) -> dict:
    """
    Convenience function to predict delay risk
    
    Args:
        order_data: Order information
        route_data: Route information
        vehicle_data: Vehicle information
        
    Returns:
        Delay risk prediction
    """
    predictor = DelayPredictor()
    
    return predictor.predict_delay_risk(
        route_info=route_data,
        vehicle_info=vehicle_data,
        deadline_str=order_data.get("deadline", ""),
        priority=order_data.get("priority", "medium")
    )
