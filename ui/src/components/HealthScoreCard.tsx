import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ArchitectureHealth } from '../../../server/src/types';

interface HealthScoreCardProps {
  health: ArchitectureHealth;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ health }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const data = [
    { name: 'Health', value: health.score },
    { name: 'Issues', value: 100 - health.score },
  ];

  const COLORS = [getScoreColor(health.score), '#374151'];

  return (
    <div className="card health-card">
      <h2>Project Health</h2>
      <div className="health-chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="health-score-overlay">
          <span className="score" style={{ color: getScoreColor(health.score) }}>
            {health.score}
          </span>
          <span className="label">/ 100</span>
        </div>
      </div>

      <div className="issues-list">
        {health.issues.length === 0 ? (
          <p className="no-issues">No issues detected 🎉</p>
        ) : (
          health.issues.slice(0, 5).map((issue, idx) => (
            <div key={idx} className={`issue-item ${issue.severity}`}>
              <span className="issue-icon">
                {issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'}
              </span>
              <span className="issue-message">{issue.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
