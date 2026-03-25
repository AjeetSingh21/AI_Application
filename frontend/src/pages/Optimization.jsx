import React, { useState } from 'react';
import { optimizationAPI } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Optimization = () => {
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    setOptimizing(true);
    setError(null);
    try {
      const response = await optimizationAPI.optimize();
      setResult(response.data);
    } catch (err) {
      setError('Failed to run optimization: ' + err.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Optimization Engine</h2>
          <p className="text-gray-500 mt-1">Run intelligent optimization for all pending orders</p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className={`px-8 py-4 rounded-lg font-bold text-white transition-all ${
            optimizing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 shadow-lg'
          }`}
        >
          {optimizing ? '⏳ Running Optimization...' : '⚡ Run Full Optimization'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          <Card title="Optimization Summary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {result.assignments?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Orders Optimized</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600">Completed At</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">A*</div>
                <div className="text-sm text-gray-600">Algorithm Used</div>
              </div>
            </div>
          </Card>

          {/* Assignment Details */}
          {result.assignments && result.assignments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Optimization Results</h3>
              
              {result.assignments.map((assignment, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary-500">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-primary-600">{assignment.order_id}</div>
                        <Badge color={
                          assignment.delay_risk === 'high' ? 'red' :
                          assignment.delay_risk === 'medium' ? 'yellow' : 'green'
                        }>
                          {assignment.delay_risk.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Route Distance: <span className="font-semibold">{assignment.total_distance} km</span>
                      </div>
                    </div>

                    {/* Assignment Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">🏭 Warehouse</p>
                        <p className="font-semibold text-gray-800">{assignment.warehouse_id}</p>
                        <p className="text-xs text-gray-500">{assignment.warehouse_details?.location}</p>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">👨‍✈️ Driver</p>
                        <p className="font-semibold text-gray-800">{assignment.driver_id}</p>
                        <p className="text-xs text-gray-500">{assignment.driver_details?.name}</p>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">🚛 Vehicle</p>
                        <p className="font-semibold text-gray-800">{assignment.vehicle_id}</p>
                        <p className="text-xs text-gray-500">{assignment.vehicle_details?.type}</p>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">📍 Destination</p>
                        <p className="font-semibold text-gray-800">{assignment.order_details?.location}</p>
                        <p className="text-xs text-gray-500">{assignment.order_details?.weight} kg</p>
                      </div>
                    </div>

                    {/* Route Visualization */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">🛣️ Optimal Route (A* Algorithm)</p>
                      <div className="flex items-center flex-wrap gap-2">
                        {assignment.route.map((node, nodeIdx) => (
                          <React.Fragment key={nodeIdx}>
                            <div className="px-3 py-1.5 bg-white rounded-md border border-blue-200 text-sm font-medium text-blue-800">
                              {node}
                            </div>
                            {nodeIdx < assignment.route.length - 1 && (
                              <div className="text-blue-400">→</div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Delay Prediction Details */}
                    {assignment.delay_prediction && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-900 mb-3">⚠️ Delay Risk Analysis</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-yellow-700">Route Risk</p>
                            <p className="text-lg font-bold text-yellow-900">
                              {assignment.delay_prediction.component_scores?.route}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-yellow-700">Traffic Risk</p>
                            <p className="text-lg font-bold text-yellow-900">
                              {assignment.delay_prediction.component_scores?.traffic}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-yellow-700">Load Risk</p>
                            <p className="text-lg font-bold text-yellow-900">
                              {assignment.delay_prediction.component_scores?.load}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-yellow-700">Deadline Risk</p>
                            <p className="text-lg font-bold text-yellow-900">
                              {assignment.delay_prediction.component_scores?.deadline}/10
                            </p>
                          </div>
                        </div>
                        
                        {assignment.delay_prediction.recommendations?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-yellow-300">
                            <p className="text-xs text-yellow-700 font-medium mb-1">💡 Recommendations:</p>
                            <ul className="text-sm text-yellow-800 space-y-1">
                              {assignment.delay_prediction.recommendations.map((rec, recIdx) => (
                                <li key={recIdx}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!result && !optimizing && (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Optimize</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Click the "Run Full Optimization" button above to use our AI engine to assign warehouses, 
            drivers, vehicles, and calculate optimal routes using the A* algorithm.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Optimization;
