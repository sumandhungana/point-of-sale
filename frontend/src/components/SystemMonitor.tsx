import React, { useState, useEffect } from 'react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  timestamp: string;
}

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size,
  strokeWidth,
  color
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress">
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#dcdcdc"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="progress-circle"
        />
      </svg>
      <div className="percentage-text">
        <span className="percentage-value">{percentage}%</span>
      </div>
    </div>
  );
};

export const SystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    timestamp: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/systemmonitor/metrics', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch system metrics');
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getColorByPercentage = (percentage: number): string => {
    if (percentage < 30) return '#10B981'; // Green
    if (percentage < 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  if (loading) {
    return (
      <div className="system-monitor-container">
        <div className="loading-message">
          <i className="bi bi-arrow-clockwise loading-spinner"></i>
          <p>Loading system metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-monitor-container">
        <div className="error-message">
          <i className="bi bi-exclamation-triangle"></i>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-monitor-container">
      <div className="monitor-grid">
        <div className="monitor-card">
          <div className="monitor-header">
            <h3 className="monitor-title">CPU LOAD</h3>
            <div className="monitor-icon">
              <i className="bi bi-cpu"></i>
            </div>
          </div>
          <div className="monitor-content">
            <CircularProgress
              percentage={metrics.cpuUsage}
              size={120}
              strokeWidth={8}
              color={getColorByPercentage(metrics.cpuUsage)}
            />
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-header">
            <h3 className="monitor-title">MEMORY USAGE</h3>
            <div className="monitor-icon">
              <i className="bi bi-memory"></i>
            </div>
          </div>
          <div className="monitor-content">
            <CircularProgress
              percentage={metrics.memoryUsage}
              size={120}
              strokeWidth={8}
              color={getColorByPercentage(metrics.memoryUsage)}
            />
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-header">
            <h3 className="monitor-title">DISK USAGE</h3>
            <div className="monitor-icon">
              <i className="bi bi-hdd"></i>
            </div>
          </div>
          <div className="monitor-content">
            <CircularProgress
              percentage={metrics.diskUsage}
              size={120}
              strokeWidth={8}
              color={getColorByPercentage(metrics.diskUsage)}
            />
          </div>
        </div>
      </div>
      
      <div className="last-updated">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

