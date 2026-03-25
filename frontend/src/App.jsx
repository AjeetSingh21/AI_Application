import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Warehouses from './pages/Warehouses';
import Drivers from './pages/Drivers';
import Optimization from './pages/Optimization';
import Simulation from './pages/Simulation';
import Alerts from './pages/Alerts';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <div className="ml-64 flex-1">
            <Navbar title="Smart Supply Chain AI" />
            <main className="pt-20 px-8 pb-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/optimization" element={<Optimization />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/alerts" element={<Alerts />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
