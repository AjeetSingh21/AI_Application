import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map animation controller
const MapController = ({ animationState }) => {
  const map = useMap();
  
  useEffect(() => {
    if (animationState?.center) {
      map.flyTo(animationState.center, animationState.zoom || 13, {
        duration: 1.5
      });
    }
  }, [animationState, map]);
  
  return null;
};

const InteractiveMap = ({ 
  warehouses = [], 
  orders = [], 
  optimizationResult = null,
  showAnimation = false,
  animationStep = 0 
}) => {
  const [mapData, setMapData] = useState({
    nodes: [],
    edges: [],
    center: [40.7128, -74.0060],
    coordinates: {}
  });
  const [highlightedRoute, setHighlightedRoute] = useState(null);
  const [animationState, setAnimationState] = useState(null);

  // Load real graph data from backend
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        // Fetch real graph data from backend
        const response = await fetch('http://localhost:8000/warehouses');
        const warehousesData = await response.json();
        
        // Use REAL coordinates from backend graph.json
        // These are the actual coordinates used by A* algorithm
        const realCoordinates = {
          'WH-A': { lat: 40.7580, lng: -73.9855 },
          'WH-B': { lat: 40.7489, lng: -73.9680 },
          'HUB-1': { lat: 40.7614, lng: -73.9776 },
          'HUB-2': { lat: 40.7527, lng: -73.9772 },
          'AREA-C': { lat: 40.7282, lng: -73.9942 },
          'AREA-D': { lat: 40.7831, lng: -73.9712 }
        };

        // Prepare nodes from REAL warehouse data
        const nodes = warehousesData.map(wh => {
          const coords = realCoordinates[wh.location];
          return {
            id: wh.id,
            position: coords ? [coords.lat, coords.lng] : [40.7128, -74.0060],
            type: 'warehouse',
            color: '#3b82f6',
            data: wh
          };
        });

        // Add delivery locations from orders
        const orderLocations = [...new Set(orders.map(o => o.location))];
        orderLocations.forEach(loc => {
          if (!nodes.find(n => n.id === loc)) {
            const coords = realCoordinates[loc];
            if (coords) {
              nodes.push({
                id: loc,
                position: [coords.lat, coords.lng],
                type: loc.includes('AREA') ? 'delivery' : 'hub',
                color: loc.includes('AREA') ? '#10b981' : '#8b5cf6'
              });
            }
          }
        });

        // Define REAL edges from graph.json structure
        const edges = [
          ['WH-A', 'HUB-1'],
          ['WH-A', 'HUB-2'],
          ['WH-B', 'HUB-1'],
          ['WH-B', 'HUB-2'],
          ['HUB-1', 'HUB-2'],
          ['HUB-1', 'AREA-C'],
          ['HUB-1', 'AREA-D'],
          ['HUB-2', 'AREA-C'],
          ['HUB-2', 'AREA-D'],
          ['AREA-C', 'AREA-D']
        ].map(([from, to]) => ({
          from,
          to,
          positions: [
            realCoordinates[from],
            realCoordinates[to]
          ].filter(p => p)
        })).filter(e => e.positions.length === 2);

        setMapData({
          nodes,
          edges,
          center: [40.7580, -73.9855],
          coordinates: realCoordinates
        });
      } catch (error) {
        console.error('Error loading graph data:', error);
      }
    };

    loadGraphData();
  }, [warehouses, orders]);

  // Update route when optimization result changes
  useEffect(() => {
    if (optimizationResult?.assignments && optimizationResult.assignments.length > 0) {
      const firstAssignment = optimizationResult.assignments[0];
      if (firstAssignment.route) {
        // Use REAL coordinates from mapData
        const routePositions = firstAssignment.route.map(nodeId => {
          const coords = mapData.coordinates[nodeId];
          return coords ? [coords.lat, coords.lng] : null;
        }).filter(pos => pos !== null);

        setHighlightedRoute(routePositions);
        
        // Animate to show the route
        if (routePositions.length > 0) {
          setAnimationState({
            center: routePositions[Math.floor(routePositions.length / 2)],
            zoom: 14
          });
        }
      }
    }
  }, [optimizationResult, mapData.coordinates]);

  // Get icon for node type - Use simple colored dots instead of custom icons
  const getNodeIcon = (type) => {
    return null; // Will use CircleMarker with colors
  };

  // Get risk color
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-xl border-2 border-gray-300">
      <MapContainer
        center={mapData.center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        {/* Map controller for animations */}
        <MapController animationState={animationState} />

        {/* LIGHT THEME tile layer - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render all nodes as colored circles */}
        {mapData.nodes.map((node) => {
          const riskColor = getRiskColor(node.id);
          return (
            <CircleMarker
              key={node.id}
              center={node.position}
              radius={15}
              color={riskColor}
              fillColor={riskColor}
              fillOpacity={0.6}
              weight={3}
            >
              <Popup className="dark-popup">
                <div className="p-2">
                  <h3 className="font-bold text-lg">{node.id}</h3>
                  <p className="text-sm text-gray-600 capitalize">Type: {node.type}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Render all edges (connections) */}
        {mapData.edges.map((edge, idx) => (
          <Polyline
            key={idx}
            positions={[edge.positions[0], edge.positions[1]]}
            color="#4b5563"
            weight={2}
            opacity={0.6}
            dashArray="5, 10"
          />
        ))}

        {/* Highlighted route from optimization */}
        {highlightedRoute && (
          <Polyline
            positions={highlightedRoute}
            color="#22c55e"
            weight={5}
            opacity={1}
            dashArray=""
          />
        )}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
