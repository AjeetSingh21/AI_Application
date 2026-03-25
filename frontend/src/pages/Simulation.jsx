import React, { useState } from 'react';
import { optimizationAPI } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';
import InteractiveMap from '../components/InteractiveMap';
import AStarAnimation from '../components/AStarAnimation';

const Simulation = () => {
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [aStarPlaying, setAStarPlaying] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    setError(null);
    setSimulationResult(null);
    setCurrentStep(0);
    setAStarPlaying(false);

    try {
      console.log('Starting simulation...');
      const response = await optimizationAPI.simulate();
      console.log('Simulation response:', response.data);
      
      if (!response.data || !response.data.steps) {
        throw new Error('Invalid simulation response');
      }
      
      setSimulationResult(response.data);
      
      // Animate through steps
      const steps = response.data.steps || [];
      console.log(`Animating ${steps.length} steps...`);
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentStep(i + 1);
        console.log(`Step ${i + 1}/${steps.length} completed`);
      }
      
      // Start A* animation at the end
      console.log('Starting A* animation...');
      setTimeout(() => setAStarPlaying(true), 1000);
    } catch (err) {
      console.error('Simulation error details:', err.response?.data || err.message);
      setError('Failed to run simulation: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center glass-card p-6 rounded-xl">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Simulation Engine</h2>
          <p className="text-gray-200">Watch the optimization process step-by-step with live map</p>
        </div>
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className={`px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
            simulating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
          }`}
        >
          {simulating ? '⏳ Simulating...' : '🎬 Start Simulation'}
        </button>
      </div>

      {/* Loading State */}
      {simulating && (
        <Card className="text-center py-16 glass-card">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h3 className="text-xl font-semibold text-white mb-2">Running Simulation...</h3>
          <p className="text-gray-200">Processing AI optimization</p>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">❌</div>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Simulation Failed</h3>
              <p className="text-red-700 whitespace-pre-wrap">{error}</p>
              <div className="mt-4 p-3 bg-red-100 rounded">
                <strong className="text-red-900">Troubleshooting:</strong>
                <ul className="text-red-800 mt-2 space-y-1">
                  <li>1. Check browser console (F12) for errors</li>
                  <li>2. Make sure backend is running on port 8000</li>
                  <li>3. Verify you have pending orders</li>
                  <li>4. Try: <code className="bg-red-200 px-2 py-1 rounded">py check_orders.py</code></li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content - Split View */}
      {simulationResult && simulationResult.steps && simulationResult.steps.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Map & Visualization */}
          <div className="space-y-6">
            {/* Interactive Map - Only render if we have assignments */}
            {simulationResult.assignments && simulationResult.assignments.length > 0 ? (
              <Card title="Live Supply Chain Map" className="glass-card-dark">
                <div className="h-96">
                  <InteractiveMap 
                    optimizationResult={simulationResult}
                    showAnimation={currentStep > 0}
                  />
                </div>
              </Card>
            ) : (
              <Card className="glass-card-dark text-center py-8">
                <p className="text-gray-300">Map will appear after optimization completes</p>
              </Card>
            )}

            {/* A* Algorithm Animation */}
            <AStarAnimation
              graphData={{}}
              startNode="WH-A"
              endNode="AREA-D"
              isPlaying={aStarPlaying}
            />
          </div>

          {/* Right Column - Steps & Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Simulation Steps ({currentStep}/{simulationResult.steps.length})</h3>
            
            {simulationResult.steps.map((step, idx) => (
              <Card
                key={idx}
                className={`transition-all duration-300 glass-card ${
                  idx < currentStep
                    ? 'opacity-100 border-l-4 border-l-green-500'
                    : 'opacity-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    idx < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.step}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white capitalize">{step.action.replace('_', ' ')}</h4>
                    <p className="text-gray-200 mt-1">{step.details}</p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Badge color={idx < currentStep ? 'green' : 'gray'}>
                      {idx < currentStep ? '✓ Completed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {/* Results Summary */}
      {simulationResult && currentStep >= (simulationResult.steps?.length || 0) && (
        <Card title="Simulation Complete!" className="border-green-300 bg-green-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {(simulationResult.assignments || []).length}
              </div>
              <p className="text-gray-600">Orders Processed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {simulationResult.steps?.length || 0}
              </div>
              <p className="text-gray-600">Steps Completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">A*</div>
              <p className="text-gray-600">Algorithm Used</p>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!simulationResult && !simulating && (
        <Card className="text-center py-16 glass-card">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Simulate</h3>
          <p className="text-gray-200 max-w-md mx-auto">
            Click "Start Simulation" to watch how our AI engine processes orders step-by-step,
            from priority analysis to final optimization with live map visualization.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Simulation;
