"""
Priority Engine
Sorts and prioritizes orders based on urgency and deadlines
"""

from typing import List, Dict
from datetime import datetime


class PriorityEngine:
    def __init__(self):
        """Initialize priority engine"""
        pass
    
    def calculate_priority_score(self, priority: str, deadline: datetime) -> float:
        """
        Calculate overall priority score
        
        Args:
            priority: Order priority (low/medium/high)
            deadline: Delivery deadline
            
        Returns:
            Priority score (higher = more urgent)
        """
        # Base priority score
        priority_scores = {
            "high": 70,
            "medium": 50,
            "low": 30
        }
        base_score = priority_scores.get(priority, 50)
        
        # Time urgency component
        now = datetime.now()
        time_until_deadline = (deadline - now).total_seconds() / 3600  # hours
        
        if time_until_deadline < 0:
            # Already overdue - maximum urgency
            time_score = 30
        elif time_until_deadline < 12:
            # Less than 12 hours
            time_score = 30
        elif time_until_deadline < 24:
            # Less than 24 hours
            time_score = 20
        elif time_until_deadline < 48:
            # Less than 48 hours
            time_score = 10
        else:
            # More than 48 hours
            time_score = 0
        
        return base_score + time_score
    
    def sort_orders_by_priority(self, orders: List[dict]) -> List[dict]:
        """
        Sort orders by priority (most urgent first)
        
        Args:
            orders: List of order dictionaries
            
        Returns:
            Sorted list of orders
        """
        def get_sort_key(order):
            priority = order.get("priority", "medium")
            deadline_str = order.get("deadline", "")
            
            try:
                deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
            except:
                deadline = datetime.max
            
            return -self.calculate_priority_score(priority, deadline)
        
        return sorted(orders, key=get_sort_key)
    
    def get_priority_rank(self, orders: List[dict], order_id: str) -> int:
        """
        Get rank of specific order in priority queue
        
        Args:
            orders: List of order dictionaries
            order_id: ID of order to rank
            
        Returns:
            Rank (1-based index) or -1 if not found
        """
        sorted_orders = self.sort_orders_by_priority(orders)
        
        for idx, order in enumerate(sorted_orders):
            if order["id"] == order_id:
                return idx + 1
        
        return -1
    
    def categorize_orders(self, orders: List[dict]) -> Dict[str, List[dict]]:
        """
        Categorize orders by urgency level
        
        Args:
            orders: List of order dictionaries
            
        Returns:
            Dictionary with categorized orders
        """
        categories = {
            "urgent": [],
            "soon": [],
            "normal": []
        }
        
        now = datetime.now()
        
        for order in orders:
            try:
                deadline = datetime.fromisoformat(
                    order.get("deadline", "").replace('Z', '+00:00')
                )
            except:
                deadline = datetime.max
            
            hours_left = (deadline - now).total_seconds() / 3600
            
            if hours_left < 24 or order.get("priority") == "high":
                categories["urgent"].append(order)
            elif hours_left < 72:
                categories["soon"].append(order)
            else:
                categories["normal"].append(order)
        
        return categories


def sort_orders_by_priority(orders: List[dict]) -> List[dict]:
    """
    Convenience function to sort orders by priority
    
    Args:
        orders: List of order dictionaries
        
    Returns:
        Sorted list of orders
    """
    engine = PriorityEngine()
    return engine.sort_orders_by_priority(orders)


def get_order_urgency(order: dict) -> dict:
    """
    Get urgency information for an order
    
    Args:
        order: Order dictionary
        
    Returns:
        Dictionary with urgency details
    """
    engine = PriorityEngine()
    
    priority = order.get("priority", "medium")
    deadline_str = order.get("deadline", "")
    
    try:
        deadline = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
    except:
        return {
            "error": "Invalid deadline format"
        }
    
    score = engine.calculate_priority_score(priority, deadline)
    
    if score >= 80:
        urgency_level = "critical"
    elif score >= 60:
        urgency_level = "high"
    elif score >= 40:
        urgency_level = "medium"
    else:
        urgency_level = "low"
    
    hours_left = (deadline - datetime.now()).total_seconds() / 3600
    
    return {
        "order_id": order.get("id"),
        "urgency_level": urgency_level,
        "priority_score": round(score, 2),
        "hours_until_deadline": round(hours_left, 1),
        "is_overdue": hours_left < 0
    }
