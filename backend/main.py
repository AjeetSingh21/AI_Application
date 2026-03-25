"""
Smart Supply Chain AI - Main FastAPI Application
Backend API for supply chain optimization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
import os
from pathlib import Path
from datetime import datetime

# Import models
from models.order import Order, OrderCreate, OrderAssignment
from models.warehouse import Warehouse
from models.driver import Driver
from models.vehicle import Vehicle
from models.alert import Alert

# Import AI modules
from ai.astar import AStarPathfinder, load_graph
from ai.warehouse_selector import WarehouseSelector, load_warehouses
from ai.driver_assigner import DriverVehicleAssigner, load_drivers, load_vehicles
from ai.priority_engine import PriorityEngine, sort_orders_by_priority
from ai.delay_predictor import DelayPredictor, predict_delay
from ai.reoptimizer import create_reoptimizer

app = FastAPI(
    title="Smart Supply Chain AI",
    description="AI-powered supply chain optimization system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Helper functions to load/save data
def load_data(filename: str) -> dict:
    """Load data from JSON file"""
    data_path = Path(__file__).parent / "data" / filename
    with open(data_path, 'r') as f:
        return json.load(f)


def save_data(filename: str, data: dict):
    """Save data to JSON file atomically (write to temp file first, then rename)"""
    import tempfile
    import shutil
    
    data_path = Path(__file__).parent / "data" / filename
    
    # Write to temporary file first
    temp_fd, temp_path = tempfile.mkstemp(suffix='.json', dir=data_path.parent)
    try:
        with os.fdopen(temp_fd, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Atomic rename
        shutil.move(str(temp_path), str(data_path))
    except Exception as e:
        # Clean up temp file on error
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        raise e

# ==================== ORDER ENDPOINTS ====================

@app.get("/orders", response_model=List[Order], tags=["Orders"])
async def get_orders():
    """Get all orders"""
    try:
        data = load_data("orders.json")
        return data["orders"]
    except FileNotFoundError:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading orders: {str(e)}")


@app.post("/orders", response_model=Order, tags=["Orders"])
async def create_order(order: OrderCreate):
    """Create a new order"""
    try:
        data = load_data("orders.json")
        
        # Generate new ID
        existing_ids = [o["id"] for o in data["orders"]]
        new_num = len(existing_ids) + 1
        new_id = f"ORD-{new_num:03d}"
        
        # Convert datetime to string if needed
        order_dict = order.model_dump()
        if 'deadline' in order_dict and hasattr(order_dict['deadline'], 'isoformat'):
            order_dict['deadline'] = order_dict['deadline'].isoformat()
        
        new_order = {
            **order_dict,
            "id": new_id,
            "status": "pending"
        }
        
        data["orders"].append(new_order)
        save_data("orders.json", data)
        
        return new_order
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")


@app.delete("/orders/{order_id}", tags=["Orders"])
async def delete_order(order_id: str):
    """Delete an order"""
    try:
        data = load_data("orders.json")
        
        original_count = len(data["orders"])
        data["orders"] = [o for o in data["orders"] if o["id"] != order_id]
        
        if len(data["orders"]) == original_count:
            raise HTTPException(status_code=404, detail="Order not found")
        
        save_data("orders.json", data)
        return {"message": f"Order {order_id} deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting order: {str(e)}")


# ==================== WAREHOUSE ENDPOINTS ====================

@app.get("/warehouses", response_model=List[Warehouse], tags=["Warehouses"])
async def get_warehouses():
    """Get all warehouses"""
    try:
        data = load_data("warehouses.json")
        return data["warehouses"]
    except FileNotFoundError:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading warehouses: {str(e)}")


# ==================== DRIVER ENDPOINTS ====================

@app.get("/drivers", response_model=List[Driver], tags=["Drivers"])
async def get_drivers():
    """Get all drivers"""
    try:
        data = load_data("drivers.json")
        return data["drivers"]
    except FileNotFoundError:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading drivers: {str(e)}")


# ==================== VEHICLE ENDPOINTS ====================

@app.get("/vehicles", response_model=List[Vehicle], tags=["Vehicles"])
async def get_vehicles():
    """Get all vehicles"""
    try:
        data = load_data("vehicles.json")
        return data["vehicles"]
    except FileNotFoundError:
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading vehicles: {str(e)}")


# ==================== OPTIMIZATION ENDPOINT ====================

@app.post("/optimize", tags=["Optimization"])
async def optimize_delivery(order_id: str = None):
    """
    Optimize delivery for one or all orders
    
    If order_id is provided, optimize that specific order.
    Otherwise, optimize all pending orders.
    """
    # Load all necessary data
    orders_data = load_data("orders.json")
    warehouses = load_warehouses()
    drivers = load_drivers()
    vehicles = load_vehicles()
    graph_data = load_graph()
    
    # Filter orders
    if order_id:
        orders_to_optimize = [o for o in orders_data["orders"] if o["id"] == order_id]
        if not orders_to_optimize:
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    else:
        orders_to_optimize = [o for o in orders_data["orders"] if o["status"] == "pending"]
    
    if not orders_to_optimize:
        return {"message": "No pending orders to optimize", "assignments": []}
    
    # Sort by priority
    sorted_orders = sort_orders_by_priority(orders_to_optimize)
    
    # Initialize AI modules
    pathfinder = AStarPathfinder(graph_data)
    warehouse_selector = WarehouseSelector(warehouses, graph_data)
    driver_assigner = DriverVehicleAssigner(drivers, vehicles)
    delay_predictor = DelayPredictor()
    
    assignments = []
    
    for order in sorted_orders:
        try:
            # 1. Select best warehouse
            best_warehouse = warehouse_selector.select_best_warehouse(
                order["location"],
                order["weight"],
                order["priority"]
            )
            
            if not best_warehouse:
                continue
            
            # 2. Assign driver and vehicle
            driver_vehicle = driver_assigner.assign_driver_vehicle(
                order["weight"],
                order["priority"]
            )
            
            if not driver_vehicle:
                continue
            
            assigned_driver, assigned_vehicle = driver_vehicle
            
            # 3. Find optimal route using A*
            route_path, route_cost = pathfinder.find_path(
                best_warehouse["location"],
                order["location"]
            )
            
            if not route_path:
                continue
            
            # 4. Predict delay risk
            delay_prediction = delay_predictor.predict_delay_risk(
                route_info={
                    "path": route_path,
                    "total_cost": route_cost,
                    "avg_traffic": 1.5  # Average estimate
                },
                vehicle_info=assigned_vehicle,
                deadline_str=order["deadline"],
                priority=order["priority"]
            )
            
            # Create assignment
            assignment = {
                "order_id": order["id"],
                "warehouse_id": best_warehouse["id"],
                "driver_id": assigned_driver["id"],
                "vehicle_id": assigned_vehicle["id"],
                "route": route_path,
                "total_distance": round(route_cost, 2),
                "delay_risk": delay_prediction["risk_level"],
                "delay_score": delay_prediction["risk_score"],
                "order_details": order,
                "warehouse_details": best_warehouse,
                "driver_details": assigned_driver,
                "vehicle_details": assigned_vehicle,
                "delay_prediction": delay_prediction
            }
            
            assignments.append(assignment)
            
            # Update order status
            for idx, o in enumerate(orders_data["orders"]):
                if o["id"] == order["id"]:
                    orders_data["orders"][idx]["status"] = "optimized"
                    break
        
        except Exception as e:
            # Log error but continue with other orders
            print(f"Error optimizing order {order['id']}: {str(e)}")
            continue
    
    save_data("orders.json", orders_data)
    
    return {
        "message": f"Optimized {len(assignments)} orders",
        "assignments": assignments,
        "timestamp": datetime.now().isoformat()
    }


# ==================== ALERTS ENDPOINT ====================

@app.get("/alerts", tags=["Alerts"])
async def get_alerts():
    """Get all delay alerts"""
    try:
        orders_data = load_data("orders.json")
        graph_data = load_graph()
        
        # Get optimized orders
        optimized_orders = [o for o in orders_data["orders"] if o["status"] == "optimized"]
        
        alerts = []
        delay_predictor = DelayPredictor()
        
        for order in optimized_orders:
            # Simulate route info (in real app, this would be stored)
            route_info = {
                "path": ["WH-A", "HUB-1", order["location"]],
                "total_cost": 80,
                "avg_traffic": 1.5
            }
            
            vehicle_info = {
                "current_load": 300,
                "capacity": 1000
            }
            
            prediction = delay_predictor.predict_delay_risk(
                route_info=route_info,
                vehicle_info=vehicle_info,
                deadline_str=order["deadline"],
                priority=order["priority"]
            )
            
            if prediction["risk_level"] in ["medium", "high"]:
                alert = {
                    "order_id": order["id"],
                    "alert_type": "delay_risk",
                    "severity": prediction["risk_level"],
                    "score": prediction["risk_score"],
                    "message": f"Order {order['id']} has {prediction['risk_level']} risk of delay",
                    "recommendation": prediction["recommendation"]
                }
                alerts.append(alert)
        
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating alerts: {str(e)}")


# ==================== SIMULATION ENDPOINT ====================

@app.post("/simulate", tags=["Simulation"])
async def simulate_optimization(order_id: str = None):
    """
    Run full optimization simulation with step-by-step results
    Shows the complete AI decision-making process
    """
    try:
        # Load all data
        orders_data = load_data("orders.json")
        warehouses = load_warehouses()
        drivers = load_drivers()
        vehicles = load_vehicles()
        graph_data = load_graph()
        
        # Filter orders
        if order_id:
            orders_to_simulate = [o for o in orders_data["orders"] if o["id"] == order_id]
            if not orders_to_simulate:
                raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        else:
            orders_to_simulate = [o for o in orders_data["orders"] if o["status"] == "pending"]
        
        if not orders_to_simulate:
            return {
                "message": "No pending orders to simulate",
                "steps": [],
                "assignments": []
            }
        
        # Initialize modules
        pathfinder = AStarPathfinder(graph_data)
        warehouse_selector = WarehouseSelector(warehouses, graph_data)
        driver_assigner = DriverVehicleAssigner(drivers, vehicles)
        delay_predictor = DelayPredictor()
        
        steps = []
        assignments = []
        
        for idx, order in enumerate(orders_to_simulate[:3]):  # Limit to first 3 for simulation
            step_base = idx * 4
            
            try:
                # Step 1: Priority Analysis
                steps.append({
                    "step": step_base + 1,
                    "action": "analyzing_priority",
                    "details": f"Analyzing order {order['id']} - Priority: {order['priority']}"
                })
                
                # Step 2: Warehouse Selection
                best_warehouse = warehouse_selector.select_best_warehouse(
                    order["location"],
                    order["weight"],
                    order["priority"]
                )
                
                if not best_warehouse:
                    steps.append({
                        "step": step_base + 2,
                        "action": "warehouse_selection_failed",
                        "details": f"No suitable warehouse found for order {order['id']}"
                    })
                    continue
                
                steps.append({
                    "step": step_base + 2,
                    "action": "warehouse_selected",
                    "details": f"Selected warehouse {best_warehouse['id']} for order {order['id']}"
                })
                
                # Step 3: Driver/Vehicle Assignment
                driver_vehicle = driver_assigner.assign_driver_vehicle(
                    order["weight"],
                    order["priority"]
                )
                
                if not driver_vehicle:
                    steps.append({
                        "step": step_base + 3,
                        "action": "assignment_failed",
                        "details": f"No available driver/vehicle for order {order['id']}"
                    })
                    continue
                
                assigned_driver, assigned_vehicle = driver_vehicle
                
                steps.append({
                    "step": step_base + 3,
                    "action": "driver_assigned",
                    "details": f"Assigned driver {assigned_driver['name']} ({assigned_driver['id']}) with vehicle {assigned_vehicle['type']} ({assigned_vehicle['id']})"
                })
                
                # Step 4: Route Computation (A*)
                route_path, route_cost = pathfinder.find_path(
                    best_warehouse["location"],
                    order["location"]
                )
                
                if not route_path:
                    steps.append({
                        "step": step_base + 4,
                        "action": "route_not_found",
                        "details": f"No route found for order {order['id']}"
                    })
                    continue
                
                steps.append({
                    "step": step_base + 4,
                    "action": "route_computed",
                    "details": f"Computed optimal route: {' → '.join(route_path)} (Distance: {route_cost:.2f})"
                })
                
                # Step 5: Delay Prediction
                delay_prediction = delay_predictor.predict_delay_risk(
                    route_info={
                        "path": route_path,
                        "total_cost": route_cost,
                        "avg_traffic": 1.5
                    },
                    vehicle_info=assigned_vehicle,
                    deadline_str=order["deadline"],
                    priority=order["priority"]
                )
                
                steps.append({
                    "step": step_base + 5,
                    "action": "delay_predicted",
                    "details": f"Delay risk: {delay_prediction['risk_level']} (Score: {delay_prediction['risk_score']})"
                })
                
                # Create assignment
                assignment = {
                    "order_id": order["id"],
                    "warehouse_id": best_warehouse["id"],
                    "driver_id": assigned_driver["id"],
                    "vehicle_id": assigned_vehicle["id"],
                    "route": route_path,
                    "total_distance": round(route_cost, 2),
                    "delay_risk": delay_prediction["risk_level"],
                    "delay_score": delay_prediction["risk_score"],
                    "order_details": order,
                    "warehouse_details": best_warehouse,
                    "driver_details": assigned_driver,
                    "vehicle_details": assigned_vehicle,
                    "delay_prediction": delay_prediction
                }
                
                assignments.append(assignment)
                
                steps.append({
                    "step": step_base + 6,
                    "action": "optimization_complete",
                    "details": f"Order {order['id']} optimization completed successfully"
                })
                
            except Exception as e:
                steps.append({
                    "step": step_base + 99,
                    "action": "error",
                    "details": f"Error processing order {order['id']}: {str(e)}"
                })
                continue
        
        return {
            "message": f"Simulated {len(assignments)} orders",
            "steps": steps,
            "assignments": assignments,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in simulation: {str(e)}")


# ==================== HEALTH CHECK ====================

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "message": "Smart Supply Chain AI API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "components": {
            "api": "running",
            "database": "connected",
            "ai_engine": "ready"
        }
    }
