import React, { useState, useEffect, useCallback } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { Header } from './components/Header';
import { HealthScoreCard } from './components/HealthScoreCard';
import { ComplexityPanel } from './components/ComplexityPanel';
import { RiskPanel } from './components/RiskPanel';
import { BottleneckPanel } from './components/BottleneckPanel';
import { AgentActivityPanel } from './components/AgentActivityPanel';
import { ActivityFeed } from './components/ActivityFeed';
import { LiveActivityStream } from './components/LiveActivityStream';
import { GitHubFailures } from './components/GitHubFailures';
import { useDashboard } from './hooks/useDashboard';
import './styles/dashboard.css';

const DashboardContent: React.FC = () => {
  const { state, refresh, liveEvents, paperclipConnected, failures, failureCount } = useDashboard();
  const [activeTab, setActiveTab] = useState('overview');
  const [newEventCount, setNewEventCount] = useState(0);
  const [lastViewedEventTime, setLastViewedEventTime] = useState(Date.now());
  const [lastViewedFailureCount, setLastViewedFailureCount] = useState(0);

  // Count new events since last viewed
  useEffect(() => {
    const newCount = liveEvents.filter(
      e => new Date(e.timestamp).getTime() > lastViewedEventTime
    ).length;
    setNewEventCount(newCount);
  }, [liveEvents, lastViewedEventTime]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === 'activity') {
      setLastViewedEventTime(Date.now());
      setNewEventCount(0);
    }
    if (tab === 'failures') {
      setLastViewedFailureCount(failureCount);
    }
  }, [failureCount]);

  if (!state.snapshot) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Initializing Project Intelligence...</p>
        <p className="loading-subtitle">
          {paperclipConnected ? 'Connecting to Paperclip...' : 'Loading project data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header 
        health={state.snapshot.health}
        lastUpdate={state.lastUpdate}
        isLive={state.isLive}
        onRefresh={refresh}
        connectionStatus={state.connectionStatus}
        paperclipConnected={paperclipConnected}
        liveEventCount={newEventCount}
      />

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'complexity' ? 'active' : ''}
          onClick={() => handleTabChange('complexity')}
        >
          Complexity
        </button>
        <button 
          className={activeTab === 'risks' ? 'active' : ''}
          onClick={() => handleTabChange('risks')}
        >
          Risks
        </button>
        <button 
          className={activeTab === 'agents' ? 'active' : ''}
          onClick={() => handleTabChange('agents')}
        >
          Agents
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''}
          onClick={() => handleTabChange('activity')}
        >
          Live Activity
          {newEventCount > 0 && (
            <span className="nav-badge">{newEventCount}</span>
          )}
        </button>
        <button 
          className={activeTab === 'failures' ? 'active' : ''}
          onClick={() => handleTabChange('failures')}
        >
          Issues
          {failureCount > lastViewedFailureCount && (
            <span className="nav-badge danger">{failureCount - lastViewedFailureCount}</span>
          )}
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="grid-layout">
            {/* KPI Row */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label">Health Score</div>
                <div className="kpi-value" style={{ color: state.snapshot.health.score >= 80 ? 'var(--success)' : state.snapshot.health.score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                  {state.snapshot.health.score}
                </div>
                <div className={`kpi-trend ${state.snapshot.health.trend}`}>
                  {state.snapshot.health.trend === 'up' ? '↗ Improving' : state.snapshot.health.trend === 'down' ? '↘ Declining' : '→ Stable'}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Total Files</div>
                <div className="kpi-value">{state.snapshot.complexity.totalFiles.toLocaleString()}</div>
                <div className="kpi-trend stable">
                  {state.snapshot.complexity.totalLines.toLocaleString()} lines
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Active Agents</div>
                <div className="kpi-value" style={{ color: 'var(--accent)' }}>
                  {state.snapshot.agentActivity.filter(a => a.status === 'active').length}
                </div>
                <div className="kpi-trend stable">
                  of {state.snapshot.agentActivity.length} total
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Critical Risks</div>
                <div className="kpi-value" style={{ color: state.snapshot.risks.filter(r => r.riskScore >= 70).length > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {state.snapshot.risks.filter(r => r.riskScore >= 70).length}
                </div>
                <div className="kpi-trend stable">
                  {state.snapshot.risks.length} total risks
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid-row">
              <HealthScoreCard health={state.snapshot.health} />
              <ComplexityPanel complexity={state.snapshot.complexity} compact />
            </div>

            <div className="grid-row">
              <RiskPanel risks={state.snapshot.risks.slice(0, 5)} compact />
              <BottleneckPanel bottlenecks={state.snapshot.bottlenecks} />
            </div>

            <div className="grid-row full-width">
              <AgentActivityPanel agents={state.snapshot.agentActivity} />
            </div>

            <div className="grid-row full-width">
              <ActivityFeed events={state.snapshot.recentEvents.slice(0, 10)} />
            </div>
          </div>
        )}

        {activeTab === 'complexity' && (
          <ComplexityPanel complexity={state.snapshot.complexity} />
        )}

        {activeTab === 'risks' && (
          <RiskPanel risks={state.snapshot.risks} />
        )}

        {activeTab === 'agents' && (
          <div className="grid-layout">
            <AgentActivityPanel agents={state.snapshot.agentActivity} />
            <ActivityFeed events={state.snapshot.recentEvents} />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="grid-layout">
            <LiveActivityStream 
              events={liveEvents} 
              paperclipConnected={paperclipConnected}
            />
          </div>
        )}

        {activeTab === 'failures' && (
          <div className="grid-layout">
            <GitHubFailures failures={failures} />
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default App;
