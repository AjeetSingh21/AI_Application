"""
A* Pathfinding Algorithm for Route Optimization
Finds optimal paths through the supply chain network
"""

import json
import heapq
from typing import Dict, List, Tuple, Optional
from pathlib import Path


class AStarPathfinder:
    def __init__(self, graph_data: dict):
        """
        Initialize A* pathfinder with graph data
        
        Args:
            graph_data: Dictionary containing nodes, edges, and coordinates
        """
        self.nodes = graph_data["nodes"]
        self.edges = graph_data["edges"]
        self.coordinates = graph_data["node_coordinates"]
        
        # Build adjacency list
        self.graph = {node: {} for node in self.nodes}
        for edge in self.edges:
            from_node = edge["from"]
            to_node = edge["to"]
            # Cost = distance * traffic factor
            cost = edge["distance"] * edge["traffic"]
            self.graph[from_node][to_node] = cost
            # Bidirectional
            self.graph[to_node][from_node] = cost
    
    def heuristic(self, node_a: str, node_b: str) -> float:
        """
        Calculate heuristic distance between two nodes using Euclidean distance
        
        Args:
            node_a: First node
            node_b: Second node
            
        Returns:
            Straight-line distance between nodes
        """
        coords_a = self.coordinates.get(node_a, {"x": 0, "y": 0})
        coords_b = self.coordinates.get(node_b, {"x": 0, "y": 0})
        
        dx = coords_a["x"] - coords_b["x"]
        dy = coords_a["y"] - coords_b["y"]
        
        return (dx**2 + dy**2) ** 0.5
    
    def find_path(self, start: str, end: str) -> Tuple[Optional[List[str]], float]:
        """
        Find optimal path from start to end using A* algorithm
        
        Args:
            start: Starting node
            end: Destination node
            
        Returns:
            Tuple of (path as list of nodes, total cost) or (None, inf) if no path
        """
        if start not in self.nodes or end not in self.nodes:
            return None, float('inf')
        
        if start == end:
            return [start], 0
        
        # Priority queue: (f_score, counter, node, path)
        counter = 0
        open_set = [(0, counter, start, [start])]
        
        # Track visited nodes and costs
        came_from = {}
        g_score = {node: float('inf') for node in self.nodes}
        g_score[start] = 0
        
        closed_set = set()
        
        while open_set:
            # Get node with lowest f_score
            _, _, current, path = heapq.heappop(open_set)
            
            if current in closed_set:
                continue
            
            if current == end:
                return path, g_score[end]
            
            closed_set.add(current)
            
            # Explore neighbors
            for neighbor, cost in self.graph[current].items():
                if neighbor in closed_set:
                    continue
                
                tentative_g = g_score[current] + cost
                
                if tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    h_score = self.heuristic(neighbor, end)
                    f_score = tentative_g + h_score
                    
                    counter += 1
                    heapq.heappush(open_set, (f_score, counter, neighbor, path + [neighbor]))
        
        # No path found
        return None, float('inf')
    
    def get_distance(self, node_a: str, node_b: str) -> float:
        """
        Get direct distance between two connected nodes
        
        Args:
            node_a: First node
            node_b: Second node
            
        Returns:
            Distance or infinity if not directly connected
        """
        for edge in self.edges:
            if (edge["from"] == node_a and edge["to"] == node_b) or \
               (edge["from"] == node_b and edge["to"] == node_a):
                return edge["distance"]
        return float('inf')


def load_graph() -> dict:
    """Load graph data from JSON file"""
    graph_path = Path(__file__).parent.parent / "data" / "graph.json"
    with open(graph_path, 'r') as f:
        return json.load(f)


def find_optimal_route(start: str, end: str) -> dict:
    """
    Convenience function to find optimal route
    
    Args:
        start: Starting location
        end: Destination location
        
    Returns:
        Dictionary with path, distance, and success status
    """
    graph_data = load_graph()
    pathfinder = AStarPathfinder(graph_data)
    
    path, cost = pathfinder.find_path(start, end)
    
    if path:
        return {
            "success": True,
            "path": path,
            "total_cost": round(cost, 2),
            "num_stops": len(path)
        }
    else:
        return {
            "success": False,
            "error": f"No path found from {start} to {end}"
        }
