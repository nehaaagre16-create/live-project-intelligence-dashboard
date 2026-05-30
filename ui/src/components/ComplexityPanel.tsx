import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ComplexityMetrics } from '../../../server/src/types';

interface ComplexityPanelProps {
  complexity: ComplexityMetrics;
  compact?: boolean;
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ complexity, compact }) => {
  const chartData = complexity.hotspots.slice(0, compact ? 5 : 15).map(h => ({
    name: h.path.split('/').pop() || h.path,
    fullPath: h.path,
    complexity: h.complexity,
    lines: h.lines,
  }));

  return (
    <div className={`card complexity-card ${compact ? 'compact' : ''}`}>
      <h2>Code Complexity</h2>
      
      <div className="complexity-stats">
        <div className="stat">
          <span className="stat-value">{complexity.totalFiles}</span>
          <span className="stat-label">Files</span>
        </div>
        <div className="stat">
          <span className="stat-value">{complexity.totalLines.toLocaleString()}</span>
          <span className="stat-label">Lines</span>
        </div>
        <div className="stat">
          <span className="stat-value">{complexity.averageComplexity.toFixed(1)}</span>
          <span className="stat-label">Avg Complexity</span>
        </div>
        <div className="stat">
          <span className="stat-value">{complexity.maxComplexity}</span>
          <span className="stat-label">Max Complexity</span>
        </div>
      </div>

      {!compact && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip 
                formatter={(value: number, _name: string, props: any) => [
                  `Complexity: ${value}`,
                  props.payload.fullPath,
                ]}
              />
              <Bar dataKey="complexity" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {compact && (
        <div className="hotspots-list">
          {complexity.hotspots.slice(0, 5).map((hotspot, idx) => (
            <div key={idx} className="hotspot-item">
              <span className="hotspot-path">{hotspot.path}</span>
              <span className="hotspot-complexity">{hotspot.complexity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
