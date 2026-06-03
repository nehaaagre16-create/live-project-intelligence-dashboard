import React from 'react';
import type { ArchitectureHealth } from '../../../server/src/types';

interface HealthScoreCardProps {
  health: ArchitectureHealth;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ health }) => {
  const getColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  return (
    <div className="card health-card">
      <div className="card-header">
        <div>
          <div className="card-title">Health Score</div>
          <div className="card-subtitle">Overall project health</div>
        </div>
        <div className={`card-badge ${health.score >= 80 ? 'success' : health.score >= 60 ? 'warning' : 'danger'}`}>
          {health.trend === 'up' ? 'Improving' : health.trend === 'down' ? 'Declining' : 'Stable'}
        </div>
      </div>

      <div className="health-ring">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle className="health-ring-bg" cx="70" cy="70" r="58" />
          <circle
            className="health-ring-progress"
            cx="70"
            cy="70"
            r="58"
            stroke={getColor(health.score)}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="health-ring-value">
          <div className="health-ring-number" style={{ color: getColor(health.score) }}>
            {health.score}
          </div>
          <div className="health-ring-label">Score</div>
        </div>
      </div>

      {health.issues.length > 0 && (
        <div className="health-issues">
          {health.issues.slice(0, 5).map((issue, idx) => (
            <div key={idx} className="health-issue">
              <span className={`health-issue-dot ${issue.severity}`} />
              <span className="health-issue-text">{issue.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
