# Smart AI Supply Chain Optimizer

A complete full-stack AI-powered logistics optimization system built with FastAPI, React, and advanced AI algorithms including A* pathfinding.

## 🚀 Features

### Core Capabilities
- **AI-Powered Optimization**: Intelligent warehouse, driver, and vehicle assignment
- **A* Algorithm**: Optimal route finding through supply chain network
- **Delay Prediction**: Rule-based risk assessment for deliveries
- **Priority Engine**: Smart order sorting by urgency and deadlines
- **Re-optimization**: Automatic adjustment when issues detected
- **Real-time Dashboard**: Modern UI with live statistics and alerts

### Technical Highlights
- **Backend**: FastAPI (Python) with RESTful API
- **Frontend**: React 18 + Vite + Tailwind CSS
- **AI Engine**: Pure Python modules (A*, scoring systems, prediction)
- **Database**: JSON file storage (simple, no setup required)
- **State Management**: React Context API
- **Routing**: React Router v6

## 📁 Project Structure

```
smart-supply-chain-ai/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── models/
│   │   ├── order.py           # Order data models
│   │   ├── warehouse.py       # Warehouse models
│   │   ├── driver.py          # Driver models
│   │   └── vehicle.py         # Vehicle models
│   │   └── alert.py           # Alert models
│   ├── ai/
│   │   ├── astar.py           # A* pathfinding algorithm
│   │   ├── warehouse_selector.py  # Warehouse assignment
│   │   ├── driver_assigner.py     # Driver/Vehicle assignment
│   │   ├── priority_engine.py     # Order prioritization
│   │   ├── delay_predictor.py     # Delay risk prediction
│   │   └── reoptimizer.py         # Re-optimization logic
│   ├── data/
│   │   ├── orders.json        # Sample orders (10)
│   │   ├── warehouses.json    # Warehouses (3)
│   │   ├── drivers.json       # Drivers (5)
│   │   ├── vehicles.json      # Vehicles (4)
│   │   └── graph.json         # Network graph (6 nodes)
│   └── requirements.txt       # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js      # API client (Axios)
    │   ├── context/
    │   │   └── AppContext.jsx # Global state
    │   ├── components/
    │   │   ├── Sidebar.jsx    # Navigation sidebar
    │   │   ├── Navbar.jsx     # Top navbar
    │   │   ├── Card.jsx       # Card component
    │   │   ├── Badge.jsx      # Status badge
    │   │   └── StatCard.jsx   # Statistics card
    │   ├── pages/
    │   │   ├── Dashboard.jsx  # Main dashboard
    │   │   ├── Orders.jsx     # Orders management
    │   │   ├── Warehouses.jsx # Warehouse view
    │   │   ├── Drivers.jsx    # Drivers & vehicles
    │   │   ├── Optimization.jsx # AI optimization
    │   │   ├── Simulation.jsx # Step-by-step simulation
    │   │   └── Alerts.jsx     # Delay alerts
    │   ├── App.jsx            # Main app component
    │   ├── main.jsx           # Entry point
    │   └── index.css          # Tailwind styles
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📊 Sample Data

The system comes pre-loaded with realistic sample data:

### Orders (10)
- Various priorities (high/medium/low)
- Different destinations
- Realistic weights and deadlines

### Warehouses (3)
- WH-A: 5000 kg stock, 45% load
- WH-B: 3500 kg stock, 60% load
- WH-C: 7000 kg stock, 30% load

### Drivers (5)
- Mix of available and busy drivers
- Different regions (north/south/east/west/central)

### Vehicles (4)
- Various types (Truck, Van, Large Truck)
- Capacities from 500-1500 kg
- Different current loads

### Network Graph (6 nodes)
- Nodes: WH-A, WH-B, HUB-1, HUB-2, AREA-C, AREA-D
- 12 edges with distance and traffic factors
- Coordinates for visualization

## 🎯 How to Use

### 1. View Dashboard
- See overview of all orders
- Quick stats and warehouse capacity
- Recent orders table

### 2. Manage Orders
- View all orders in a table
- Add new orders with location, weight, priority, deadline
- Delete existing orders

### 3. Run Optimization
Navigate to **Optimization** page and click "Run Full Optimization"

The AI engine will:
1. Sort orders by priority
2. Select best warehouse for each order
3. Assign available driver and suitable vehicle
4. Calculate optimal route using A* algorithm
5. Predict delay risk
6. Display complete results

### 4. Watch Simulation
Navigate to **Simulation** page and click "Start Simulation"

See step-by-step how the AI processes orders:
- Data loading
- Priority analysis
- AI module initialization
- Order processing
- Final results

### 5. Monitor Alerts
Navigate to **Alerts** page to see:
- High/medium/low severity alerts
- Delay risk scores
- Recommendations for improvement

## 🔧 API Endpoints

### Orders
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `DELETE /orders/{id}` - Delete order

### Resources
- `GET /warehouses` - Get all warehouses
- `GET /drivers` - Get all drivers
- `GET /vehicles` - Get all vehicles

### AI Operations
- `POST /optimize` - Run optimization (optional: specific order_id)
- `POST /simulate` - Run step-by-step simulation
- `GET /alerts` - Get delay alerts

### Health
- `GET /` - Root endpoint
- `GET /health` - Health check

## 🧠 AI Algorithms

### A* Pathfinding
- Graph-based routing
- Heuristic: Euclidean distance
- Considers traffic weights
- Returns optimal path and cost

### Warehouse Selection
Scoring based on:
- Distance (40% weight)
- Current load (25% weight)
- Stock availability (35% weight)
- Priority multiplier

### Driver/Vehicle Assignment
Constraints:
- Driver must be available
- Vehicle capacity >= order weight
- Efficiency optimization

### Delay Prediction
Rule-based scoring (0-10):
- Route length/distance
- Traffic conditions
- Vehicle load
- Deadline tightness

Risk levels:
- Low: 0-4
- Medium: 4-7
- High: 7-10

## 🎨 UI Features

### Design System
- **Color Coding**:
  - Green: Low risk, available, optimized
  - Yellow: Medium risk, moderate load
  - Red: High risk, overdue, high load
  - Blue: Information, normal status

### Components
- Responsive grid layouts
- Interactive cards and tables
- Real-time progress indicators
- Animated simulations
- Modern dashboard with charts

## 🐛 Troubleshooting

### Backend Issues
**Port already in use:**
```bash
uvicorn main:app --reload --port 8001
```

**Module import errors:**
```bash
# Make sure you're in backend directory
cd backend
# Ensure virtual environment is activated
```

### Frontend Issues
**Dependencies not installing:**
```bash
npm cache clean --force
npm install
```

**Port 3000 in use:**
```bash
npm run dev -- --port 3001
```

### API Connection Issues
Make sure both servers are running:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

Check CORS settings in `backend/main.py` if needed.

## 📝 Customization

### Add More Data
Edit JSON files in `backend/data/`:
- Add more orders, warehouses, drivers, vehicles
- Expand the graph with new nodes and edges

### Modify AI Parameters
Adjust weights and thresholds in AI modules:
- `warehouse_selector.py`: Scoring weights
- `delay_predictor.py`: Risk thresholds
- `driver_assigner.py`: Efficiency calculations

### Extend Functionality
- Add authentication
- Implement real WebSocket updates
- Connect to real database (PostgreSQL, MongoDB)
- Add machine learning models
- Integrate maps/GPS tracking

## 🏆 Key Achievements

✅ Complete working full-stack application
✅ Clean modular architecture
✅ Advanced AI algorithms (A*, scoring, prediction)
✅ Modern responsive UI
✅ Real-time optimization
✅ Step-by-step simulation
✅ Comprehensive error handling
✅ Production-ready code structure

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Developer Notes

This is a demonstration/academic project showcasing:
- Full-stack development skills
- AI algorithm implementation
- Clean code architecture
- Modern web development practices

**Not intended for production use without additional security, testing, and scalability improvements.**

---

Built with ❤️ using FastAPI, React, and AI
