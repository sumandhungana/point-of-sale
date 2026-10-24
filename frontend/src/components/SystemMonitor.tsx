import React, { useState, useEffect } from 'react';
import { apiService } from "@/infrastructure/utils/ApiService";

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  timestamp: string;
}

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

interface SemiCircularGaugeProps {
  percentage: number;
  title: string;
  icon: string;
  dangerStart?: number;
}

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

const SemiCircularGauge: React.FC<SemiCircularGaugeProps> = ({
  percentage,
  title,
  icon,
  dangerStart = 90
}) => {
  const pct = clamp(percentage);
  const radius = 80;
  const strokeWidth = 18;
  const circumference = Math.PI * radius;

  const arcPath = `M 20 120 A ${radius} ${radius} 0 0 1 ${200 - 20} 120`;

  // Progress length
  const progressLength = (pct / 100) * circumference;

  // Red alert zone
  const redZoneStart = clamp(dangerStart);
  const redZoneLength = ((100 - redZoneStart) / 100) * circumference;
  const redZoneOffset = circumference - redZoneLength;

  const display = Number.isFinite(pct) ? pct.toFixed(1) : '0.0';

  return (
    <div className="system-monitor-panel">
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
        <div className="panel-icon" aria-hidden="true">
          <i className={icon}></i>
        </div>
      </div>

      <div className="gauge-container">
        <svg
          width="200"
          height="120"
          className="semi-circular-gauge"
          viewBox="0 0 200 120"
          role="img"
          aria-label={`${title} ${display}%`}
        >
          {/* Track */}
          <path
            d={arcPath}
            fill="none"
            className="gauge-track"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Red alert slice */}
          <path
            d={arcPath}
            fill="none"
            className="gauge-redzone"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${redZoneLength} ${circumference}`}
            strokeDashoffset={redZoneOffset}
          />

          {/* Main progress */}
          <path
            d={arcPath}
            fill="none"
            className="gauge-progress"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${circumference}`}
            strokeDashoffset={0}
          />
        </svg>

        <div className="gauge-value">
          <span className="percentage-display">{display}%</span>
        </div>
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await apiService.get<RestResponse<SystemMetrics>>(
        'api/v1/metrics/system-monitor',
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (res.error) {
        throw new Error('Failed to fetch system metrics');
      }

      const data = res?.response?.data;
      if (data) {
        const cpu = clamp(Number(data.cpuUsage) || 0);
        const mem = clamp(Number(data.memoryUsage) || 0);
        const dsk = clamp(Number(data.diskUsage) || 0);

        setMetrics({
          cpuUsage: cpu,
          memoryUsage: mem,
          diskUsage: dsk,
          timestamp: data.timestamp || new Date().toISOString(),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Row of 3 Gauges Side-by-Side */}
      <div className="monitor-grid">
        <SemiCircularGauge
          percentage={metrics.cpuUsage}
          title="CPU LOAD"
          icon="bi bi-cpu-fill"
          dangerStart={90}
        />
        <SemiCircularGauge
          percentage={metrics.memoryUsage}
          title="MEMORY USAGE"
          icon="bi bi-memory"
          dangerStart={85}
        />
        <SemiCircularGauge
          percentage={metrics.diskUsage}
          title="DISK USAGE"
          icon="bi bi-hdd-rack-fill"
          dangerStart={90}
        />
      </div>
    </div>
  );
};