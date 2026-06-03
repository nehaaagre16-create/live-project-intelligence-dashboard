import React from 'react';
import type { ComplexityMetrics } from '../../../server/src/types';

interface ComplexityPanelProps {
  complexity: ComplexityMetrics;
  compact?: boolean;
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ complexity, compact }) => {
  const formatNumber = (n: number) => n.toLocaleString();

  const stats = [
    { label: 'Files', value: formatNumber(complexity.totalFiles) },
    { label: 'Lines', value: formatNumber(complexity.totalLines) },
    { label: 'Avg Complexity', value: complexity.averageComplexity.toFixed(1) },
    { label: 'Max Complexity', value: complexity.maxComplexity },
  ];

  const getBarColor = (complexity: number) => {
    if (complexity > 50) return 'var(--danger)';
    if (complexity > 20) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Code Complexity</div>
          <div className="card-subtitle">Project metrics & hotspots</div>
        </div>
      </div>

      <div className="complexity-stats">
        {stats.map((stat, idx) => (
          <div key={idx} className="complexity-stat">
            <div className="complexity-stat-value">{stat.value}</div>
            <div className="complexity-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {!compact && complexity.hotspots.length > 0 && (
        <div>
          <div className="card-title" style={{ marginBottom: '12px', fontSize: '13px' }}>Hotspots</div>
          <div className="hotspot-list">
            {complexity.hotspots.slice(0, 10).map((file, idx) => (
              <div key={idx} className="hotspot-item">
                <div className="hotspot-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="hotspot-name">{file.path}</div>
                  <div className="hotspot-meta">{formatNumber(file.lines)} lines</div>
                </div>
                <div className="hotspot-bar" style={{ width: '100px', flexShrink: 0 }}>
                  <div
                    className="hotspot-bar-fill"
                    style={{
                      width: `${Math.min((file.complexity / complexity.maxComplexity) * 100, 100)}%`,
                      background: getBarColor(file.complexity),
                    }}
                  />
                </div>
                <div className="hotspot-value">{file.complexity}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
