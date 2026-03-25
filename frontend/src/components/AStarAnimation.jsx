import React, { useState, useEffect } from 'react';
import Card from './Card';
import Badge from './Badge';

const AStarAnimation = ({ graphData, startNode, endNode, isPlaying }) => {
  const [animationState, setAnimationState] = useState({
    openSet: [],
    closedSet: [],
    finalPath: [],
    currentNode: null,
    step: 0,
    completed: false
  });

  // Mock graph for visualization
  const mockGraph = {
    nodes: ['WH-A', 'HUB-1', 'HUB-2', 'AREA-C', 'AREA-D'],
    edges: {
      'WH-A': ['HUB-1', 'HUB-2'],
      'HUB-1': ['WH-A', 'HUB-2', 'AREA-C', 'AREA-D'],
      'HUB-2': ['WH-A', 'WH-B', 'HUB-1', 'AREA-C', 'AREA-D'],
      'AREA-C': ['HUB-1', 'HUB-2', 'AREA-D'],
      'AREA-D': ['HUB-1', 'HUB-2', 'AREA-C']
    }
  };

  // A* algorithm step-by-step
  useEffect(() => {
    if (!isPlaying || !startNode || !endNode) return;

    const runAStarAnimation = async () => {
      // Reset state
      setAnimationState({
        openSet: [startNode],
        closedSet: [],
        finalPath: [],
        currentNode: startNode,
        step: 0,
        completed: false
      });

      const openSet = new Set([startNode]);
      const closedSet = new Set();
      const cameFrom = {};
      const gScore = {};
      const fScore = {};

      // Initialize scores
      mockGraph.nodes.forEach(node => {
        gScore[node] = Infinity;
        fScore[node] = Infinity;
      });
      gScore[startNode] = 0;
      fScore[startNode] = 100; // Heuristic estimate

      let current = startNode;
      let step = 0;

      while (openSet.size > 0 && step < 20) {
        // Get node with lowest fScore
        current = Array.from(openSet).reduce((a, b) => 
          fScore[a] < fScore[b] ? a : b
        );

        // Update animation state
        setAnimationState(prev => ({
          ...prev,
          openSet: Array.from(openSet),
          closedSet: Array.from(closedSet),
          currentNode: current,
          step: step + 1
        }));

        // Check if we reached the goal
        if (current === endNode) {
          // Reconstruct path
          const path = [];
          let temp = current;
          while (temp in cameFrom) {
            path.unshift(temp);
            temp = cameFrom[temp];
          }
          path.unshift(startNode);

          // Animate path discovery
          for (let i = 0; i <= path.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setAnimationState(prev => ({
              ...prev,
              finalPath: path.slice(0, i + 1),
              completed: i === path.length
            }));
          }
          return;
        }

        openSet.delete(current);
        closedSet.add(current);

        // Explore neighbors
        const neighbors = mockGraph.edges[current] || [];
        for (const neighbor of neighbors) {
          if (closedSet.has(neighbor)) continue;

          const tentativeG = gScore[current] + 10; // Simplified cost

          if (tentativeG < gScore[neighbor]) {
            cameFrom[neighbor] = current;
            gScore[neighbor] = tentativeG;
            fScore[neighbor] = tentativeG + 50; // Simplified heuristic
            
            if (!openSet.has(neighbor)) {
              openSet.add(neighbor);
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        step++;
      }
    };

    runAStarAnimation();
  }, [isPlaying, startNode, endNode]);

  const getNodeColor = (nodeId) => {
    if (animationState.finalPath.includes(nodeId)) return 'bg-green-500';
    if (animationState.closedSet.includes(nodeId)) return 'bg-gray-500';
    if (animationState.openSet.includes(nodeId)) return 'bg-blue-500';
    if (animationState.currentNode === nodeId) return 'bg-yellow-500';
    if (nodeId === startNode) return 'bg-green-600';
    if (nodeId === endNode) return 'bg-red-600';
    return 'bg-gray-300';
  };

  return (
    <Card title="A* Algorithm Visualization" className="bg-white">
      <div className="space-y-6">
        {/* Control Panel */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge color={animationState.completed ? 'green' : 'blue'}>
              {animationState.completed ? '✓ Complete' : 'Running'}
            </Badge>
            <span className="text-sm text-gray-600">
              Step: {animationState.step}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Open: {animationState.openSet.length} | 
            Closed: {animationState.closedSet.length}
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="relative bg-gray-50 rounded-lg p-6 h-64">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Edges */}
            {Object.entries(mockGraph.edges).flatMap(([from, neighbors]) =>
              neighbors.map(to => {
                const positions = {
                  'WH-A': [50, 100],
                  'HUB-1': [150, 50],
                  'HUB-2': [150, 150],
                  'AREA-C': [250, 100],
                  'AREA-D': [350, 100]
                };
                const [x1, y1] = positions[from] || [0, 0];
                const [x2, y2] = positions[to] || [0, 0];
                
                const isPathEdge = animationState.finalPath.includes(from) && 
                                  animationState.finalPath.includes(to);
                
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={x1} y1={y1}
                    x2={x2} y2={y2}
                    stroke={isPathEdge ? '#22c55e' : '#9ca3af'}
                    strokeWidth={isPathEdge ? 4 : 2}
                    opacity={isPathEdge ? 1 : 0.5}
                  />
                );
              })
            )}

            {/* Nodes */}
            {mockGraph.nodes.map(node => {
              const positions = {
                'WH-A': [50, 100],
                'HUB-1': [150, 50],
                'HUB-2': [150, 150],
                'AREA-C': [250, 100],
                'AREA-D': [350, 100]
              };
              const [x, y] = positions[node] || [0, 0];
              
              return (
                <g key={node}>
                  <circle
                    cx={x} cy={y} r="20"
                    className={`${getNodeColor(node)} transition-all duration-500`}
                    stroke="white"
                    strokeWidth="3"
                  />
                  <text
                    x={x} y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-bold fill-white"
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Open Set</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>Closed Set</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Final Path</span>
          </div>
        </div>

        {/* Progress Info */}
        {animationState.completed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">
              ✓ Path found! Length: {animationState.finalPath.length} nodes
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AStarAnimation;
