import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const HealthScoreCard = ({ health }) => {
    const getColor = (score) => {
        if (score >= 80)
            return 'var(--success)';
        if (score >= 60)
            return 'var(--warning)';
        return 'var(--danger)';
    };
    const circumference = 2 * Math.PI * 58;
    const strokeDashoffset = circumference - (health.score / 100) * circumference;
    return (_jsxs("div", { className: "card health-card", children: [_jsxs("div", { className: "card-header", children: [_jsxs("div", { children: [_jsx("div", { className: "card-title", children: "Health Score" }), _jsx("div", { className: "card-subtitle", children: "Overall project health" })] }), _jsx("div", { className: `card-badge ${health.score >= 80 ? 'success' : health.score >= 60 ? 'warning' : 'danger'}`, children: health.trend === 'up' ? 'Improving' : health.trend === 'down' ? 'Declining' : 'Stable' })] }), _jsxs("div", { className: "health-ring", children: [_jsxs("svg", { width: "140", height: "140", viewBox: "0 0 140 140", children: [_jsx("circle", { className: "health-ring-bg", cx: "70", cy: "70", r: "58" }), _jsx("circle", { className: "health-ring-progress", cx: "70", cy: "70", r: "58", stroke: getColor(health.score), strokeDasharray: circumference, strokeDashoffset: strokeDashoffset })] }), _jsxs("div", { className: "health-ring-value", children: [_jsx("div", { className: "health-ring-number", style: { color: getColor(health.score) }, children: health.score }), _jsx("div", { className: "health-ring-label", children: "Score" })] })] }), health.issues.length > 0 && (_jsx("div", { className: "health-issues", children: health.issues.slice(0, 5).map((issue, idx) => (_jsxs("div", { className: "health-issue", children: [_jsx("span", { className: `health-issue-dot ${issue.severity}` }), _jsx("span", { className: "health-issue-text", children: issue.message })] }, idx))) }))] }));
};
