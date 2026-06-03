import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Header = ({ health, lastUpdate, isLive, onRefresh, connectionStatus, paperclipConnected = false, liveEventCount = 0, }) => {
    const getHealthColor = (score) => {
        if (score >= 80)
            return 'var(--success)';
        if (score >= 60)
            return 'var(--warning)';
        return 'var(--danger)';
    };
    const isFullyConnected = connectionStatus === 'connected';
    return (_jsxs("header", { className: "dashboard-header", children: [_jsxs("div", { className: "header-left", children: [_jsx("h1", { children: "Project Intelligence" }), _jsx("span", { className: "header-subtitle", children: paperclipConnected ? 'Connected to Paperclip' : 'Standalone Mode' })] }), _jsx("div", { className: "header-center", children: _jsxs("div", { className: "health-badge", children: [_jsx("span", { className: "health-score", style: { color: getHealthColor(health.score) }, children: health.score }), _jsx("span", { className: "health-label", children: "Health" })] }) }), _jsxs("div", { className: "header-right", children: [_jsxs("div", { className: "status-group", children: [paperclipConnected && (_jsxs("span", { className: "status-pill paperclip", children: [_jsx("span", { className: "pulse-indicator" }), "Paperclip"] })), _jsx("span", { className: `status-pill ${isLive && isFullyConnected ? 'live' : 'paused'}`, children: isLive && isFullyConnected ? '● Live' : '○ Paused' }), liveEventCount > 0 && (_jsxs("span", { className: "status-pill", style: { background: 'var(--danger-dim)', color: 'var(--danger)' }, children: [liveEventCount, " new"] }))] }), lastUpdate && (_jsx("span", { style: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }, children: lastUpdate.toLocaleTimeString() })), _jsxs("button", { className: "refresh-btn", onClick: onRefresh, children: [_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "23 4 23 10 17 10" }), _jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })] }), "Refresh"] })] })] }));
};
