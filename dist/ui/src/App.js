import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
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
const DashboardContent = () => {
    const { state, refresh, liveEvents, paperclipConnected, failures, failureCount } = useDashboard();
    const [activeTab, setActiveTab] = useState('overview');
    const [newEventCount, setNewEventCount] = useState(0);
    const [lastViewedEventTime, setLastViewedEventTime] = useState(Date.now());
    const [lastViewedFailureCount, setLastViewedFailureCount] = useState(0);
    // Count new events since last viewed
    useEffect(() => {
        const newCount = liveEvents.filter(e => new Date(e.timestamp).getTime() > lastViewedEventTime).length;
        setNewEventCount(newCount);
    }, [liveEvents, lastViewedEventTime]);
    const handleTabChange = useCallback((tab) => {
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
        return (_jsxs("div", { className: "loading-screen", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Initializing Project Intelligence..." }), _jsx("p", { className: "loading-subtitle", children: paperclipConnected ? 'Connecting to Paperclip...' : 'Loading project data...' })] }));
    }
    return (_jsxs("div", { className: "dashboard", children: [_jsx(Header, { health: state.snapshot.health, lastUpdate: state.lastUpdate, isLive: state.isLive, onRefresh: refresh, connectionStatus: state.connectionStatus, paperclipConnected: paperclipConnected, liveEventCount: newEventCount }), _jsxs("nav", { className: "dashboard-nav", children: [_jsx("button", { className: activeTab === 'overview' ? 'active' : '', onClick: () => handleTabChange('overview'), children: "Overview" }), _jsx("button", { className: activeTab === 'complexity' ? 'active' : '', onClick: () => handleTabChange('complexity'), children: "Complexity" }), _jsx("button", { className: activeTab === 'risks' ? 'active' : '', onClick: () => handleTabChange('risks'), children: "Risks" }), _jsx("button", { className: activeTab === 'agents' ? 'active' : '', onClick: () => handleTabChange('agents'), children: "Agents" }), _jsxs("button", { className: activeTab === 'activity' ? 'active' : '', onClick: () => handleTabChange('activity'), children: ["Live Activity", newEventCount > 0 && (_jsx("span", { className: "nav-badge", children: newEventCount }))] }), _jsxs("button", { className: activeTab === 'failures' ? 'active' : '', onClick: () => handleTabChange('failures'), children: ["Issues", failureCount > lastViewedFailureCount && (_jsx("span", { className: "nav-badge danger", children: failureCount - lastViewedFailureCount }))] })] }), _jsxs("main", { className: "dashboard-content", children: [activeTab === 'overview' && (_jsxs("div", { className: "grid-layout", children: [_jsxs("div", { className: "kpi-grid", children: [_jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Health Score" }), _jsx("div", { className: "kpi-value", style: { color: state.snapshot.health.score >= 80 ? 'var(--success)' : state.snapshot.health.score >= 60 ? 'var(--warning)' : 'var(--danger)' }, children: state.snapshot.health.score }), _jsx("div", { className: `kpi-trend ${state.snapshot.health.trend}`, children: state.snapshot.health.trend === 'up' ? '↗ Improving' : state.snapshot.health.trend === 'down' ? '↘ Declining' : '→ Stable' })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Total Files" }), _jsx("div", { className: "kpi-value", children: state.snapshot.complexity.totalFiles.toLocaleString() }), _jsxs("div", { className: "kpi-trend stable", children: [state.snapshot.complexity.totalLines.toLocaleString(), " lines"] })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Active Agents" }), _jsx("div", { className: "kpi-value", style: { color: 'var(--accent)' }, children: state.snapshot.agentActivity.filter(a => a.status === 'active').length }), _jsxs("div", { className: "kpi-trend stable", children: ["of ", state.snapshot.agentActivity.length, " total"] })] }), _jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Critical Risks" }), _jsx("div", { className: "kpi-value", style: { color: state.snapshot.risks.filter(r => r.riskScore >= 70).length > 0 ? 'var(--danger)' : 'var(--success)' }, children: state.snapshot.risks.filter(r => r.riskScore >= 70).length }), _jsxs("div", { className: "kpi-trend stable", children: [state.snapshot.risks.length, " total risks"] })] })] }), _jsxs("div", { className: "grid-row", children: [_jsx(HealthScoreCard, { health: state.snapshot.health }), _jsx(ComplexityPanel, { complexity: state.snapshot.complexity, compact: true })] }), _jsxs("div", { className: "grid-row", children: [_jsx(RiskPanel, { risks: state.snapshot.risks.slice(0, 5), compact: true }), _jsx(BottleneckPanel, { bottlenecks: state.snapshot.bottlenecks })] }), _jsx("div", { className: "grid-row full-width", children: _jsx(AgentActivityPanel, { agents: state.snapshot.agentActivity }) }), _jsx("div", { className: "grid-row full-width", children: _jsx(ActivityFeed, { events: state.snapshot.recentEvents.slice(0, 10) }) })] })), activeTab === 'complexity' && (_jsx(ComplexityPanel, { complexity: state.snapshot.complexity })), activeTab === 'risks' && (_jsx(RiskPanel, { risks: state.snapshot.risks })), activeTab === 'agents' && (_jsxs("div", { className: "grid-layout", children: [_jsx(AgentActivityPanel, { agents: state.snapshot.agentActivity }), _jsx(ActivityFeed, { events: state.snapshot.recentEvents })] })), activeTab === 'activity' && (_jsx("div", { className: "grid-layout", children: _jsx(LiveActivityStream, { events: liveEvents, paperclipConnected: paperclipConnected }) })), activeTab === 'failures' && (_jsx("div", { className: "grid-layout", children: _jsx(GitHubFailures, { failures: failures }) }))] })] }));
};
const App = () => {
    return (_jsx(DashboardProvider, { children: _jsx(DashboardContent, {}) }));
};
export default App;
