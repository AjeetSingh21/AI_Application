import React, { createContext, useContext, useState, useEffect } from 'react';
import { ordersAPI, warehousesAPI, driversAPI, vehiclesAPI, alertsAPI } from '../api/client';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, warehousesRes, driversRes, vehiclesRes] = await Promise.all([
        ordersAPI.getAll(),
        warehousesAPI.getAll(),
        driversAPI.getAll(),
        vehiclesAPI.getAll(),
      ]);

      setOrders(ordersRes.data);
      setWarehouses(warehousesRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load alerts
  const loadAlerts = async () => {
    try {
      const res = await alertsAPI.getAll();
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  // Add order
  const addOrder = async (order) => {
    try {
      const res = await ordersAPI.create(order);
      setOrders(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      throw new Error('Failed to create order: ' + err.message);
    }
  };

  // Delete order
  const deleteOrder = async (id) => {
    try {
      await ordersAPI.delete(id);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      throw new Error('Failed to delete order: ' + err.message);
    }
  };

  // Get statistics
  const getStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const optimizedOrders = orders.filter(o => o.status === 'optimized').length;
    const highRiskAlerts = alerts.filter(a => a.severity === 'high').length;

    return {
      totalOrders,
      pendingOrders,
      optimizedOrders,
      highRiskAlerts,
      availableDrivers: drivers.filter(d => d.available).length,
      totalWarehouses: warehouses.length,
    };
  };

  useEffect(() => {
    loadAllData();
    loadAlerts();
  }, []);

  const value = {
    orders,
    warehouses,
    drivers,
    vehicles,
    alerts,
    loading,
    error,
    loadAllData,
    loadAlerts,
    addOrder,
    deleteOrder,
    getStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
