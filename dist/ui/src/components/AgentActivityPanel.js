import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const AgentActivityPanel = ({ agents }) => {
    const formatDuration = (seconds) => {
        if (seconds < 60)
            return `${seconds}s`;
        if (seconds < 3600)
            return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };
    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 60000)
            return 'Just now';
        if (diff < 3600000)
            return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000)
            return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString();
    };
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsxs("div", { children: [_jsx("div", { className: "card-title", children: "Agent Activity" }), _jsx("div", { className: "card-subtitle", children: "AI agent performance" })] }), agents.length > 0 && (_jsxs("div", { className: "card-badge success", children: [agents.filter(a => a.status === 'active').length, " Active"] }))] }), agents.length === 0 ? (_jsx("div", { className: "no-data", children: "No agent data available" })) : (_jsx("div", { className: "agent-list", children: agents.map((agent, idx) => (_jsxs("div", { className: "agent-item", children: [_jsx("div", { className: `agent-status ${agent.status}` }), _jsxs("div", { className: "agent-info", children: [_jsx("div", { className: "agent-name", children: agent.agentName }), _jsx("div", { className: "agent-id", children: agent.agentId.slice(0, 12) })] }), _jsxs("div", { className: "agent-metrics", children: [_jsxs("div", { className: "agent-metric", children: [_jsx("div", { className: "agent-metric-value", children: agent.tasksCompleted }), _jsx("div", { className: "agent-metric-label", children: "Done" })] }), _jsxs("div", { className: "agent-metric", children: [_jsx("div", { className: "agent-metric-value failed", children: agent.tasksFailed }), _jsx("div", { className: "agent-metric-label", children: "Failed" })] }), _jsxs("div", { className: "agent-metric", children: [_jsx("div", { className: "agent-metric-value", children: formatDuration(agent.avgDuration) }), _jsx("div", { className: "agent-metric-label", children: "Avg" })] }), _jsxs("div", { className: "agent-metric", children: [_jsx("div", { className: "agent-metric-value", style: { fontSize: '12px' }, children: formatTime(agent.lastActivity) }), _jsx("div", { className: "agent-metric-label", children: "Last" })] })] })] }, idx))) }))] }));
};
