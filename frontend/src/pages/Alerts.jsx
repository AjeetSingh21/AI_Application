import React, { useEffect, useState } from 'react';
import { alertsAPI } from '../api/client';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await alertsAPI.getAll();
      setAlerts(response.data.alerts || []);
    } catch (err) {
      setError('Failed to load alerts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Delay Alerts</h2>
          <p className="text-gray-500 mt-1">
            {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-red-300 bg-red-50">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {alerts.filter(a => a.severity === 'high').length}
              </div>
              <p className="text-gray-700">High Severity</p>
            </div>
          </Card>
          
          <Card className="border-yellow-300 bg-yellow-50">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {alerts.filter(a => a.severity === 'medium').length}
              </div>
              <p className="text-gray-700">Medium Severity</p>
            </div>
          </Card>
          
          <Card className="border-green-300 bg-green-50">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {alerts.filter(a => a.severity === 'low').length}
              </div>
              <p className="text-gray-700">Low Severity</p>
            </div>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="text-center py-16">
          <div className="animate-spin text-4xl">⏳</div>
          <p className="text-gray-500 mt-4">Loading alerts...</p>
        </Card>
      )}

      {/* Alerts List */}
      {!loading && alerts.length === 0 && (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Alerts</h3>
          <p className="text-gray-500">All deliveries are on schedule!</p>
        </Card>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <Card
              key={idx}
              className={`border-l-4 ${
                alert.severity === 'high'
                  ? 'border-l-red-500 bg-red-50'
                  : alert.severity === 'medium'
                  ? 'border-l-yellow-500 bg-yellow-50'
                  : 'border-l-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-3xl">{getSeverityIcon(alert.severity)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{alert.order_id}</h3>
                      <Badge color={alert.severity}>{alert.severity.toUpperCase()}</Badge>
                      <span className="text-sm text-gray-500">• {alert.alert_type}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{alert.message}</p>
                    
                    {alert.delay_score !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Delay Score:</span>
                          <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                alert.delay_score >= 7
                                  ? 'bg-red-500'
                                  : alert.delay_score >= 4
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${(alert.delay_score / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{alert.delay_score}/10</span>
                        </div>
                      </div>
                    )}
                    
                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">💡 Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {alert.recommendations.map((rec, recIdx) => (
                            <li key={recIdx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
