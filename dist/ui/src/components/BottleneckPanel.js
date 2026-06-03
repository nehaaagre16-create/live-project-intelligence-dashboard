import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const BottleneckPanel = ({ bottlenecks }) => {
    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 3600000)
            return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000)
            return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString();
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { children: [_jsx("div", { className: "card-title", children: "Developer Activity" }), _jsx("div", { className: "card-subtitle", children: "Top contributors" })] }) }), bottlenecks.length === 0 ? (_jsx("div", { className: "no-data", children: "No developer data" })) : (_jsx("div", { className: "bottleneck-list", children: bottlenecks.map((dev, idx) => (_jsxs("div", { className: "bottleneck-item", children: [_jsx("div", { className: `bottleneck-rank ${idx < 3 ? 'top' : ''}`, children: idx + 1 }), _jsxs("div", { className: "bottleneck-info", children: [_jsx("div", { className: "bottleneck-name", children: dev.name }), _jsx("div", { className: "bottleneck-email", children: dev.email })] }), _jsxs("div", { className: "bottleneck-stats", children: [_jsxs("div", { className: "bottleneck-stat", children: [_jsx("div", { className: "bottleneck-stat-value", children: dev.commits }), _jsx("div", { className: "bottleneck-stat-label", children: "Commits" })] }), _jsxs("div", { className: "bottleneck-stat", children: [_jsx("div", { className: "bottleneck-stat-value", children: dev.filesTouched }), _jsx("div", { className: "bottleneck-stat-label", children: "Files" })] }), _jsxs("div", { className: "bottleneck-stat", children: [_jsx("div", { className: "bottleneck-stat-value", style: { fontSize: '12px' }, children: formatTime(dev.lastCommit) }), _jsx("div", { className: "bottleneck-stat-label", children: "Last" })] })] })] }, idx))) }))] }));
};
