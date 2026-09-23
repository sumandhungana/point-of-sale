import React, { useState, useEffect } from 'react';
import {apiService} from "@/infrastructure/utils/ApiService";

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
  dangerStart?: number; // percentage where red zone starts, default 90
}

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

const SemiCircularGauge: React.FC<SemiCircularGaugeProps> = ({
  percentage,
  title,
  icon,
  dangerStart = 100
}) => {
  const pct = clamp(percentage);
  const radius = 80;
  const strokeWidth = 18; // thicker, like the screenshot
  const circumference = Math.PI * radius;

  const arcPath = `M 20 120 A ${radius} ${radius} 0 0 1 ${200 - 20} 120`;

  // green progress length
  const progressLength = (pct / 100) * circumference;

  // red zone slice (e.g., 90–100%)
  const redZoneStart = clamp(dangerStart);
  const redZoneLength = ((100 - redZoneStart) / 100) * circumference;
  const redZoneOffset = circumference - redZoneLength;

  // display one decimal
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
          {/* Dark track */}
          <path
            d={arcPath}
            fill="none"
            className="gauge-track"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Red alert slice on the far right */}
          <path
            d={arcPath}
            fill="none"
            className="gauge-redzone"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${redZoneLength} ${circumference}`}
            strokeDashoffset={redZoneOffset}
          />

          {/* Green progress */}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      ///api/v1/metrics/system-monitor
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
      <div className="monitor-grid">
        <SemiCircularGauge
          percentage={metrics.cpuUsage}
          title="CPU LOAD"
          icon="bi bi-robot"
        />
        <SemiCircularGauge
          percentage={metrics.memoryUsage}
          title="MEMORY USAGE"
          icon="bi bi-cpu"
        />
        <SemiCircularGauge
          percentage={metrics.diskUsage}
          title="DISK USAGE"
          icon="bi bi-hdd-rack"
        />
      </div>
    </div>
  );
};