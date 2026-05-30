import React, { useState, useEffect, useCallback } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { Header } from './components/Header';
import { HealthScoreCard } from './components/HealthScoreCard';
import { ComplexityPanel } from './components/ComplexityPanel';
import { RiskPanel } from './components/RiskPanel';
import { BottleneckPanel } from './components/BottleneckPanel';
import { AgentActivityPanel } from './components/AgentActivityPanel';
import { ActivityFeed } from './components/ActivityFeed';
import { useDashboard } from './hooks/useDashboard';
import './styles/dashboard.css';

const DashboardContent: React.FC = () => {
  const { state, refresh } = useDashboard();
  const [activeTab, setActiveTab] = useState('overview');

  if (!state.snapshot) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Initializing Project Intelligence...</p>
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
      />

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'complexity' ? 'active' : ''}
          onClick={() => setActiveTab('complexity')}
        >
          Complexity
        </button>
        <button 
          className={activeTab === 'risks' ? 'active' : ''}
          onClick={() => setActiveTab('risks')}
        >
          Risks
        </button>
        <button 
          className={activeTab === 'agents' ? 'active' : ''}
          onClick={() => setActiveTab('agents')}
        >
          Agents
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="grid-layout">
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
