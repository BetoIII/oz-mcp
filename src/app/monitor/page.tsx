'use client';

import { useState, useEffect } from 'react';

interface ConnectionStats {
  activeConnections: number;
  totalConnections: number;
  maxConnections: number;
  connectionDetails: Array<{
    id: string;
    clientIP: string;
    userAgent: string;
    connectedAt: string;
    lastActivity: string;
    requestCount: number;
  }>;
}

interface MonitorData {
  timestamp: string;
  overview: {
    status: string;
    activeConnections: number;
    maxConnections: number;
    utilizationPercent: number;
  };
  connections: ConnectionStats;
  rateLimit: {
    requests: number;
    remaining: number;
    resetTime: string;
  };
  server: {
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
    };
  };
}

export default function MonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/mcp-monitor');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Monitor fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading monitor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong> {error}
          </div>
          <button 
            onClick={fetchData}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MCP Server Monitor</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh
            </label>
            <button
              onClick={fetchData}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.overview.status)}`}>
                {data.overview.status.toUpperCase()}
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-2">Server Status</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {data.overview.activeConnections}/{data.overview.maxConnections}
            </div>
            <p className="text-gray-600 text-sm">Active Connections</p>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${data.overview.utilizationPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {data.rateLimit.remaining}
            </div>
            <p className="text-gray-600 text-sm">Remaining Requests</p>
            <p className="text-xs text-gray-500 mt-1">
              {data.rateLimit.requests}/30 used
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {formatUptime(data.server.uptime)}
            </div>
            <p className="text-gray-600 text-sm">Server Uptime</p>
            <p className="text-xs text-gray-500 mt-1">
              {data.server.memory.heapUsed}MB / {data.server.memory.heapTotal}MB
            </p>
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Active Connections</h2>
            <p className="text-sm text-gray-600">Currently connected MCP clients</p>
          </div>
          <div className="p-6">
            {data.connections.connectionDetails.length === 0 ? (
              <p className="text-gray-500">No active connections</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Connection ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Connected At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.connections.connectionDetails.map((connection) => (
                      <tr key={connection.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {connection.id.substring(0, 20)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {connection.clientIP}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {connection.userAgent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(connection.connectedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(connection.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {connection.requestCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {formatTime(data.timestamp)}
          {autoRefresh && ' (auto-refreshing every 5 seconds)'}
        </div>
      </div>
    </div>
  );
}