import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ActivityFeed = ({ events }) => {
    const getEventIcon = (type) => {
        switch (type) {
            case 'commit': return '💾';
            case 'agent_run': return '🤖';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📌';
        }
    };
    const getEventClass = (type) => {
        switch (type) {
            case 'error': return 'event-error';
            case 'warning': return 'event-warning';
            default: return '';
        }
    };
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        if (diff < 60000)
            return 'Just now';
        if (diff < 3600000)
            return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000)
            return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { children: [_jsx("div", { className: "card-title", children: "Activity Feed" }), _jsx("div", { className: "card-subtitle", children: "Recent events" })] }) }), events.length === 0 ? (_jsx("div", { className: "no-data", children: "No recent activity" })) : (_jsx("div", { className: "activity-list", children: events.map((event, idx) => (_jsxs("div", { className: `activity-item ${getEventClass(event.type)}`, children: [_jsx("span", { className: "activity-icon", children: getEventIcon(event.type) }), _jsxs("div", { className: "activity-content", children: [_jsx("span", { className: "activity-message", children: event.message }), _jsx("span", { className: "activity-time", children: formatTime(event.timestamp) })] })] }, `${event.id}-${idx}`))) }))] }));
};
