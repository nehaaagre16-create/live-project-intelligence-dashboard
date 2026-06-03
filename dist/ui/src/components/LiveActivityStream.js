import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export const LiveActivityStream = ({ events, paperclipConnected }) => {
    const scrollRef = useRef(null);
    const prevEventsLength = useRef(events.length);
    // Auto-scroll to top when new events arrive
    useEffect(() => {
        if (events.length > prevEventsLength.current && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
        prevEventsLength.current = events.length;
    }, [events.length]);
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
            case 'agent_run': return 'event-agent';
            default: return '';
        }
    };
    const getEventSource = (metadata) => {
        if (!metadata)
            return 'System';
        if (metadata.agentName)
            return `Agent: ${metadata.agentName}`;
        if (metadata.pluginName)
            return `Plugin: ${metadata.pluginName}`;
        if (metadata.runId)
            return `Run: ${metadata.runId}`;
        return 'Paperclip';
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
    return (_jsxs("div", { className: "card live-activity-card", children: [_jsxs("div", { className: "live-activity-header", children: [_jsx("h2", { children: "Live Activity Stream" }), _jsx("div", { className: "live-status", children: paperclipConnected ? (_jsxs("span", { className: "status-badge connected", children: [_jsx("span", { className: "pulse-dot" }), "Paperclip Real-Time"] })) : (_jsx("span", { className: "status-badge disconnected", children: "\u23F8\uFE0F Polling Mode" })) })] }), events.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("p", { className: "no-data", children: "Waiting for activity..." }), _jsx("p", { className: "empty-hint", children: paperclipConnected
                            ? 'Events will appear here as they happen in Paperclip'
                            : 'Connect to Paperclip for real-time updates' })] })) : (_jsx("div", { className: "activity-stream", ref: scrollRef, children: events.map((event, idx) => (_jsxs("div", { className: `activity-stream-item ${getEventClass(event.type)} ${idx === 0 ? 'new' : ''}`, children: [_jsxs("div", { className: "activity-stream-left", children: [_jsx("span", { className: "activity-icon", children: getEventIcon(event.type) }), _jsxs("div", { className: "activity-stream-content", children: [_jsx("span", { className: "activity-message", children: event.message }), _jsx("span", { className: "activity-source", children: getEventSource(event.metadata) })] })] }), _jsx("span", { className: "activity-time", title: new Date(event.timestamp).toLocaleString(), children: formatTime(event.timestamp) })] }, `${event.id}-${idx}`))) }))] }));
};
