import React from 'react';
import type { AgentActivity } from '../../../server/src/types';

interface AgentActivityPanelProps {
  agents: AgentActivity[];
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({ agents }) => {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Agent Activity</div>
          <div className="card-subtitle">AI agent performance</div>
        </div>
        {agents.length > 0 && (
          <div className="card-badge success">
            {agents.filter(a => a.status === 'active').length} Active
          </div>
        )}
      </div>

      {agents.length === 0 ? (
        <div className="no-data">No agent data available</div>
      ) : (
        <div className="agent-list">
          {agents.map((agent, idx) => (
            <div key={idx} className="agent-item">
              <div className={`agent-status ${agent.status}`} />
              <div className="agent-info">
                <div className="agent-name">{agent.agentName}</div>
                <div className="agent-id">{agent.agentId.slice(0, 12)}</div>
              </div>
              <div className="agent-metrics">
                <div className="agent-metric">
                  <div className="agent-metric-value">{agent.tasksCompleted}</div>
                  <div className="agent-metric-label">Done</div>
                </div>
                <div className="agent-metric">
                  <div className="agent-metric-value failed">{agent.tasksFailed}</div>
                  <div className="agent-metric-label">Failed</div>
                </div>
                <div className="agent-metric">
                  <div className="agent-metric-value">{formatDuration(agent.avgDuration)}</div>
                  <div className="agent-metric-label">Avg</div>
                </div>
                <div className="agent-metric">
                  <div className="agent-metric-value" style={{ fontSize: '12px' }}>
                    {formatTime(agent.lastActivity)}
                  </div>
                  <div className="agent-metric-label">Last</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
