import React from 'react';
import type { ArchitectureHealth } from '../../../server/src/types';

interface HeaderProps {
  health: ArchitectureHealth;
  lastUpdate: Date | null;
  isLive: boolean;
  onRefresh: () => void;
  connectionStatus: string;
  paperclipConnected?: boolean;
  liveEventCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  lastUpdate,
  isLive,
  onRefresh,
  connectionStatus,
  paperclipConnected = false,
  liveEventCount = 0,
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const isFullyConnected = connectionStatus === 'connected';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Project Intelligence</h1>
        <span className="header-subtitle">
          {paperclipConnected ? 'Connected to Paperclip' : 'Standalone Mode'}
        </span>
      </div>

      <div className="header-center">
        <div className="health-badge">
          <span className="health-score" style={{ color: getHealthColor(health.score) }}>
            {health.score}
          </span>
          <span className="health-label">Health</span>
        </div>
      </div>

      <div className="header-right">
        <div className="status-group">
          {paperclipConnected && (
            <span className="status-pill paperclip">
              <span className="pulse-indicator" />
              Paperclip
            </span>
          )}
          <span className={`status-pill ${isLive && isFullyConnected ? 'live' : 'paused'}`}>
            {isLive && isFullyConnected ? '● Live' : '○ Paused'}
          </span>
          {liveEventCount > 0 && (
            <span className="status-pill" style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>
              {liveEventCount} new
            </span>
          )}
        </div>

        {lastUpdate && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {lastUpdate.toLocaleTimeString()}
          </span>
        )}

        <button className="refresh-btn" onClick={onRefresh}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>
    </header>
  );
};
