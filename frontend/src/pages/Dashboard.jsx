import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Dashboard = () => {
  const { getStats, orders, alerts } = useAppContext();
  const stats = getStats();

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="📦"
          color="blue"
          trend={12}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Optimized Orders"
          value={stats.optimizedOrders}
          icon="✅"
          color="green"
          trend={8}
        />
        <StatCard
          title="High Risk Alerts"
          value={stats.highRiskAlerts}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex space-x-4">
          <Link
            to="/orders"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + New Order
          </Link>
          <Link
            to="/optimization"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ⚡ Run Optimization
          </Link>
          <Link
            to="/alerts"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            View Alerts ({alerts.length})
          </Link>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card title="Recent Orders" subtitle="Latest orders in the system">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      color={
                        order.priority === 'high'
                          ? 'red'
                          : order.priority === 'medium'
                          ? 'yellow'
                          : 'blue'
                      }
                    >
                      {order.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      color={
                        order.status === 'optimized' ? 'green' : 'gray'
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Warehouse Capacity" subtitle="Current load across warehouses">
          <div className="space-y-4">
            {[
              { name: 'WH-A', load: 45 },
              { name: 'WH-B', load: 60 },
              { name: 'WH-C', load: 30 },
            ].map((wh) => (
              <div key={wh.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{wh.name}</span>
                  <span className="text-sm text-gray-500">{wh.load}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      wh.load > 70 ? 'bg-red-500' : wh.load > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${wh.load}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Fleet Status" subtitle="Available drivers and vehicles">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{stats.availableDrivers}</div>
              <div className="text-sm text-gray-600 mt-1">Available Drivers</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600 mt-1">Total Vehicles</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{stats.totalWarehouses}</div>
              <div className="text-sm text-gray-600 mt-1">Warehouses</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{orders.length}</div>
              <div className="text-sm text-gray-600 mt-1">Active Orders</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
