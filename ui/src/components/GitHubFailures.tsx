import React from 'react';
import type { DetectedFailure } from '../context/DashboardContext';

export interface Failure {
  type: string;
  issueNumber: number;
  title: string;
  description: string;
  suggestedFix: string;
  severity: 'high' | 'medium' | 'low';
  htmlUrl: string;
  repoOwner: string;
  repoName: string;
}

export const GitHubFailures: React.FC<{ failures: DetectedFailure[] }> = ({ failures }) => {
  if (failures.length === 0) {
    return (
      <div className="failures-panel empty">
        <h3>✅ All Clear</h3>
        <p>No GitHub issues need attention right now.</p>
      </div>
    );
  }

  const severityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...failures].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div className="failures-panel">
      <h3>🚨 Issues Need Attention ({failures.length})</h3>
      
      {sorted.map(f => (
        <div key={f.issueNumber} className={`failure-card ${f.severity}`}>
          <div className="failure-header">
            <span className={`badge ${f.type}`}>{f.type.replace('_', ' ')}</span>
            <span className="issue-num">#{f.issueNumber}</span>
            <span className={`severity-badge ${f.severity}`}>{f.severity}</span>
          </div>
          
          <h4>{f.title}</h4>
          <p className="description">{f.description}</p>
          
          <div className="solution-box">
            <strong>💡 How to fix:</strong>
            <pre>{f.suggestedFix}</pre>
          </div>
          
          <a 
            href={f.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-btn"
          >
            View on GitHub →
          </a>
        </div>
      ))}
    </div>
  );
};
