import React from 'react';
import type { ModuleRisk } from '../../../server/src/types';

interface RiskPanelProps {
  risks: ModuleRisk[];
  compact?: boolean;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ risks, compact }) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`card risk-card ${compact ? 'compact' : ''}`}>
      <h2>Risky Systems</h2>
      
      {risks.length === 0 ? (
        <p className="no-data">No risks detected 🎉</p>
      ) : (
        <div className="risk-list">
          {risks.map((risk, idx) => (
            <div key={idx} className="risk-item">
              <div className="risk-header">
                <span className="risk-path">{risk.path}</span>
                <span 
                  className="risk-badge"
                  style={{ backgroundColor: getRiskColor(risk.riskScore) }}
                >
                  {getRiskLabel(risk.riskScore)} ({risk.riskScore})
                </span>
              </div>
              
              {!compact && (
                <div className="risk-metrics">
                  <div className="risk-metric">
                    <span className="metric-label">Error Rate</span>
                    <span className="metric-value">{risk.errorRate.toFixed(1)}%</span>
                  </div>
                  <div className="risk-metric">
                    <span className="metric-label">Avg Response</span>
                    <span className="metric-value">{risk.avgResponseTime.toFixed(0)}ms</span>
                  </div>
                  <div className="risk-metric">
                    <span className="metric-label">Failures</span>
                    <span className="metric-value">{risk.failureCount}</span>
                  </div>
                  {risk.lastFailure && (
                    <div className="risk-metric">
                      <span className="metric-label">Last Failure</span>
                      <span className="metric-value">
                        {new Date(risk.lastFailure).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="risk-bar">
                <div 
                  className="risk-bar-fill"
                  style={{ 
                    width: `${risk.riskScore}%`,
                    backgroundColor: getRiskColor(risk.riskScore)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
