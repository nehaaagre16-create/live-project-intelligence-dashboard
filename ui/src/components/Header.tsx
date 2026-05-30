import React from 'react';
import type { ArchitectureHealth } from '../../../server/src/types';

interface HeaderProps {
  health: ArchitectureHealth;
  lastUpdate: Date | null;
  isLive: boolean;
  onRefresh: () => void;
  connectionStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  lastUpdate,
  isLive,
  onRefresh,
  connectionStatus,
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '➡️';
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Live Project Intelligence</h1>
        <span className="subtitle">Real-time engineering insights</span>
      </div>

      <div className="header-center">
        <div className="health-badge" style={{ borderColor: getHealthColor(health.score) }}>
          <span className="health-score" style={{ color: getHealthColor(health.score) }}>
            {health.score}
          </span>
          <span className="health-label">Health Score</span>
          <span className="health-trend">{getTrendIcon(health.trend)}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="status-indicators">
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢' : connectionStatus === 'connecting' ? '🟡' : '🔴'}
          </span>
          <span className={`live-indicator ${isLive ? 'active' : ''}`}>
            {isLive ? '● LIVE' : '○ PAUSED'}
          </span>
        </div>
        {lastUpdate && (
          <span className="last-update">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
        <button className="refresh-btn" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>
    </header>
  );
};
