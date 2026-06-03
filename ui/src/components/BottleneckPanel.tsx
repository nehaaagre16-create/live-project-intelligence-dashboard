import React from 'react';
import type { DeveloperActivity } from '../../../server/src/types';

interface BottleneckPanelProps {
  bottlenecks: DeveloperActivity[];
}

export const BottleneckPanel: React.FC<BottleneckPanelProps> = ({ bottlenecks }) => {
  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Developer Activity</div>
          <div className="card-subtitle">Top contributors</div>
        </div>
      </div>

      {bottlenecks.length === 0 ? (
        <div className="no-data">No developer data</div>
      ) : (
        <div className="bottleneck-list">
          {bottlenecks.map((dev, idx) => (
            <div key={idx} className="bottleneck-item">
              <div className={`bottleneck-rank ${idx < 3 ? 'top' : ''}`}>
                {idx + 1}
              </div>
              <div className="bottleneck-info">
                <div className="bottleneck-name">{dev.name}</div>
                <div className="bottleneck-email">{dev.email}</div>
              </div>
              <div className="bottleneck-stats">
                <div className="bottleneck-stat">
                  <div className="bottleneck-stat-value">{dev.commits}</div>
                  <div className="bottleneck-stat-label">Commits</div>
                </div>
                <div className="bottleneck-stat">
                  <div className="bottleneck-stat-value">{dev.filesTouched}</div>
                  <div className="bottleneck-stat-label">Files</div>
                </div>
                <div className="bottleneck-stat">
                  <div className="bottleneck-stat-value" style={{ fontSize: '12px' }}>
                    {formatTime(dev.lastCommit)}
                  </div>
                  <div className="bottleneck-stat-label">Last</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
