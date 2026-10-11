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

interface TelemetrySample {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
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
  const [history, setHistory] = useState<TelemetrySample[]>([]);
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

        const timeLabel = new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        setHistory((prev) => {
          const next = [...prev, { time: timeLabel, cpu, memory: mem, disk: dsk }];
          return next.slice(-18);
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

  // Calculate coordinates for graph polyline and area
  const sampleCount = history.length;
  const startX = 50;
  const endX = 770;
  const graphWidth = endX - startX;
  const slotWidth = sampleCount > 1 ? graphWidth / (sampleCount - 1) : graphWidth;

  const toY = (val: number) => 140 - (clamp(val) / 100) * 120;

  const cpuPoints = history.map((s, i) => `${startX + i * slotWidth},${toY(s.cpu)}`);
  const memPoints = history.map((s, i) => `${startX + i * slotWidth},${toY(s.memory)}`);
  const diskPoints = history.map((s, i) => `${startX + i * slotWidth},${toY(s.disk)}`);

  const cpuAreaPath = history.length > 1
    ? `M ${startX} 140 L ${cpuPoints.join(' L ')} L ${startX + (history.length - 1) * slotWidth} 140 Z`
    : '';

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

      {/* Live System Performance Telemetry Graph */}
      <div className="system-telemetry-panel">
        <div className="telemetry-header">
          <div className="telemetry-title-wrap">
            <h4 className="telemetry-title">
              <i className="bi bi-activity" /> Real-time Performance Telemetry
            </h4>
            <span className="telemetry-subtitle">Live system resource timeline sampled every 5 seconds</span>
          </div>
          <div className="telemetry-legend">
            <span className="telemetry-legend-item">
              <span className="telemetry-dot" style={{ backgroundColor: '#38BDF8' }} /> CPU ({metrics.cpuUsage.toFixed(1)}%)
            </span>
            <span className="telemetry-legend-item">
              <span className="telemetry-dot" style={{ backgroundColor: '#F59E0B' }} /> Memory ({metrics.memoryUsage.toFixed(1)}%)
            </span>
            <span className="telemetry-legend-item">
              <span className="telemetry-dot" style={{ backgroundColor: '#10B981' }} /> Disk ({metrics.diskUsage.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="telemetry-chart-wrap">
          <svg className="telemetry-svg" viewBox="0 0 800 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cpuTelemetryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[25, 50, 75].map((lvl) => (
              <line
                key={lvl}
                x1={startX}
                y1={toY(lvl)}
                x2={endX}
                y2={toY(lvl)}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 4"
              />
            ))}
            <line x1={startX} y1="140" x2={endX} y2="140" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

            {/* Axis Labels */}
            <text x={startX - 8} y="24" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="end">100%</text>
            <text x={startX - 8} y={toY(50) + 4} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="end">50%</text>
            <text x={startX - 8} y="144" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="end">0%</text>

            {/* CPU Area Fill */}
            {cpuAreaPath && (
              <path d={cpuAreaPath} fill="url(#cpuTelemetryGrad)" />
            )}

            {/* Disk Line */}
            {diskPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                points={diskPoints.join(' ')}
              />
            )}

            {/* Memory Line */}
            {memPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                points={memPoints.join(' ')}
              />
            )}

            {/* CPU Line */}
            {cpuPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                points={cpuPoints.join(' ')}
              />
            )}

            {/* Time labels under bottom axis */}
            {history.map((s, idx) => {
              if (idx % 3 === 0 || idx === history.length - 1) {
                return (
                  <text
                    key={idx}
                    x={startX + idx * slotWidth}
                    y="155"
                    fill="rgba(255,255,255,0.45)"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {s.time}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};