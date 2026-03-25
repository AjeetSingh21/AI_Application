import React from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Drivers = () => {
  const { drivers, vehicles } = useAppContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Drivers & Vehicles</h2>

      {/* Drivers Section */}
      <Card title="Drivers" subtitle={`${drivers.filter(d => d.available).length} available out of ${drivers.length}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className={`p-4 rounded-lg border-2 ${
                driver.available
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{driver.name}</h3>
                <Badge color={driver.available ? 'green' : 'red'}>
                  {driver.available ? 'Available' : 'Busy'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">ID: {driver.id}</p>
              <p className="text-sm text-gray-600">Region: {driver.region}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Vehicles Section */}
      <Card title="Vehicles" subtitle="Fleet capacity and current load">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((vehicle) => {
            const utilization = (vehicle.current_load / vehicle.capacity) * 100;
            return (
              <div
                key={vehicle.id}
                className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50"
              >
                <h3 className="font-semibold text-gray-800 mb-2">{vehicle.type}</h3>
                <p className="text-sm text-gray-600">ID: {vehicle.id}</p>
                <p className="text-sm text-gray-600">Capacity: {vehicle.capacity} kg</p>
                <p className="text-sm text-gray-600">Current Load: {vehicle.current_load} kg</p>
                
                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">Utilization</span>
                    <span className="text-xs text-gray-600">{utilization.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        utilization > 80
                          ? 'bg-red-500'
                          : utilization > 50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${utilization}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Drivers;
