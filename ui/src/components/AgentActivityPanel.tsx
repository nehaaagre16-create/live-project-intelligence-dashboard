import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AgentActivity } from '../../../server/src/types';

interface AgentActivityPanelProps {
  agents: AgentActivity[];
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({ agents }) => {
  const getStatusColor = (status: string) => {
    if (status === 'active') return '#10b981';
    if (status === 'error') return '#ef4444';
    return '#6b7280';
  };

  const chartData = agents.map(a => ({
    name: a.agentName,
    completed: a.tasksCompleted,
    failed: a.tasksFailed,
  }));

  return (
    <div className="card agent-card">
      <h2>Agent Activity</h2>

      {agents.length === 0 ? (
        <p className="no-data">No agent data available</p>
      ) : (
        <>
          <div className="agent-list">
            {agents.map((agent, idx) => (
              <div key={idx} className="agent-item">
                <div className="agent-header">
                  <span 
                    className="agent-status-dot"
                    style={{ backgroundColor: getStatusColor(agent.status) }}
                  />
                  <span className="agent-name">{agent.agentName}</span>
                  <span className="agent-status">{agent.status}</span>
                </div>
                <div className="agent-metrics">
                  <div className="agent-metric">
                    <span className="metric-value">{agent.tasksCompleted}</span>
                    <span className="metric-label">Done</span>
                  </div>
                  <div className="agent-metric">
                    <span className="metric-value" style={{ color: '#ef4444' }}>
                      {agent.tasksFailed}
                    </span>
                    <span className="metric-label">Failed</span>
                  </div>
                  <div className="agent-metric">
                    <span className="metric-value">{agent.avgDuration}s</span>
                    <span className="metric-label">Avg Time</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};
