import React from 'react';
import type { ModuleRisk } from '../../../server/src/types';

interface RiskPanelProps {
  risks: ModuleRisk[];
  compact?: boolean;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ risks, compact }) => {
  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'var(--danger)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--success)';
  };

  const displayRisks = compact ? risks.slice(0, 5) : risks;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Risk Analysis</div>
          <div className="card-subtitle">High-risk modules</div>
        </div>
        {risks.length > 0 && (
          <div className="card-badge danger">
            {risks.filter(r => r.riskScore >= 70).length} Critical
          </div>
        )}
      </div>

      {risks.length === 0 ? (
        <div className="no-data">No risks detected</div>
      ) : (
        <div className="risk-list">
          {displayRisks.map((risk, idx) => (
            <div key={idx} className={`risk-item ${getRiskLevel(risk.riskScore)}`}>
              <div className="risk-score">
                <div className="risk-score-value" style={{ color: getRiskColor(risk.riskScore) }}>
                  {risk.riskScore}
                </div>
                <div className="risk-score-label" style={{ color: getRiskColor(risk.riskScore) }}>
                  {getRiskLevel(risk.riskScore)}
                </div>
              </div>
              <div className="risk-info">
                <div className="risk-path">{risk.path}</div>
                {!compact && (
                  <div className="risk-metrics">
                    <div className="risk-metric">
                      Errors: <strong>{risk.failureCount}</strong>
                    </div>
                    <div className="risk-metric">
                      Avg: <strong>{Math.round(risk.avgResponseTime)}ms</strong>
                    </div>
                    <div className="risk-metric">
                      Rate: <strong>{risk.errorRate.toFixed(1)}%</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
