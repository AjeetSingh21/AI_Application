import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Orders = () => {
  const { orders, addOrder, deleteOrder } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    weight: '',
    priority: 'medium',
    deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addOrder({
        ...formData,
        weight: parseFloat(formData.weight),
      });
      setShowForm(false);
      setFormData({ location: '', weight: '', priority: 'medium', deadline: '' });
      alert('Order created successfully!');
    } catch (err) {
      alert('Failed to create order: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        alert('Order deleted successfully!');
      } catch (err) {
        alert('Failed to delete order: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ New Order'}
        </button>
      </div>

      {/* Add Order Form */}
      {showForm && (
        <Card title="Create New Order">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select location</option>
                  <option value="WH-A">WH-A</option>
                  <option value="WH-B">WH-B</option>
                  <option value="HUB-1">HUB-1</option>
                  <option value="HUB-2">HUB-2</option>
                  <option value="AREA-C">AREA-C</option>
                  <option value="AREA-D">AREA-D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Create Order
            </button>
          </form>
        </Card>
      )}

      {/* Orders List */}
      <Card title="All Orders" subtitle={`${orders.length} orders in system`}>
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
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.deadline).toLocaleString()}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Orders;
