import React from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Warehouses = () => {
  const { warehouses } = useAppContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Warehouses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <Card key={warehouse.id} title={warehouse.id}>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Current Load</span>
                  <span className="text-sm text-gray-500">{warehouse.load}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      warehouse.load > 70
                        ? 'bg-red-500'
                        : warehouse.load > 40
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${warehouse.load}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-lg font-semibold text-gray-800">{warehouse.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Stock Capacity</p>
                  <p className="text-lg font-semibold text-gray-800">{warehouse.stock} kg</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Badge color={warehouse.load > 70 ? 'red' : warehouse.load > 40 ? 'yellow' : 'green'}>
                  {warehouse.load > 70 ? 'High Load' : warehouse.load > 40 ? 'Moderate Load' : 'Available'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Warehouses;
