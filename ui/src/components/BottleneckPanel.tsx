import React from 'react';
import type { DeveloperActivity } from '../../../server/src/types';

interface BottleneckPanelProps {
  bottlenecks: DeveloperActivity[];
}

export const BottleneckPanel: React.FC<BottleneckPanelProps> = ({ bottlenecks }) => {
  if (bottlenecks.length === 0) {
    return (
      <div className="card bottleneck-card">
        <h2>Developer Bottlenecks</h2>
        <p className="no-data">No git history available</p>
      </div>
    );
  }

  const maxCommits = Math.max(...bottlenecks.map(b => b.commits));

  return (
    <div className="card bottleneck-card">
      <h2>Developer Bottlenecks</h2>
      <p className="panel-subtitle">Top contributors (potential bus factor risks)</p>
      
      <div className="bottleneck-list">
        {bottlenecks.map((dev, idx) => (
          <div key={idx} className="bottleneck-item">
            <div className="dev-info">
              <span className="dev-rank">#{idx + 1}</span>
              <div className="dev-details">
                <span className="dev-name">{dev.name}</span>
                <span className="dev-email">{dev.email}</span>
              </div>
            </div>
            
            <div className="dev-stats">
              <div className="dev-stat">
                <span className="stat-value">{dev.commits}</span>
                <span className="stat-label">commits</span>
              </div>
              <div className="dev-stat">
                <span className="stat-value">{dev.filesTouched}</span>
                <span className="stat-label">files</span>
              </div>
            </div>
            
            <div className="commit-bar">
              <div 
                className="commit-bar-fill"
                style={{ width: `${(dev.commits / maxCommits) * 100}%` }}
              />
            </div>
            
            <span className="last-commit">
              {new Date(dev.lastCommit).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
