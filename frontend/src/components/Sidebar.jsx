import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/orders', label: 'Orders', icon: '📦' },
    { path: '/warehouses', label: 'Warehouses', icon: '🏭' },
    { path: '/drivers', label: 'Drivers', icon: '👨‍✈️' },
    { path: '/optimization', label: 'Optimization', icon: '⚡' },
    { path: '/simulation', label: 'Simulation', icon: '🎬' },
    { path: '/alerts', label: 'Alerts', icon: '🚨' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-400">SmartHub AI</h1>
        <p className="text-xs text-gray-400 mt-1">Supply Chain Optimizer</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-sm transition-colors ${
              location.pathname === item.path
                ? 'bg-primary-600 text-white border-l-4 border-primary-300'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-800">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-300">System Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
