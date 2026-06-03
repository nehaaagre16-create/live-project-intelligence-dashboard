import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const GitHubFailures = ({ failures }) => {
    if (failures.length === 0) {
        return (_jsxs("div", { className: "failures-panel empty", children: [_jsx("h3", { children: "\u2705 All Clear" }), _jsx("p", { children: "No GitHub issues need attention right now." })] }));
    }
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...failures].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    return (_jsxs("div", { className: "failures-panel", children: [_jsxs("h3", { children: ["\uD83D\uDEA8 Issues Need Attention (", failures.length, ")"] }), sorted.map(f => (_jsxs("div", { className: `failure-card ${f.severity}`, children: [_jsxs("div", { className: "failure-header", children: [_jsx("span", { className: `badge ${f.type}`, children: f.type.replace('_', ' ') }), _jsxs("span", { className: "issue-num", children: ["#", f.issueNumber] }), _jsx("span", { className: `severity-badge ${f.severity}`, children: f.severity })] }), _jsx("h4", { children: f.title }), _jsx("p", { className: "description", children: f.description }), _jsxs("div", { className: "solution-box", children: [_jsx("strong", { children: "\uD83D\uDCA1 How to fix:" }), _jsx("pre", { children: f.suggestedFix })] }), _jsx("a", { href: f.htmlUrl, target: "_blank", rel: "noopener noreferrer", className: "view-btn", children: "View on GitHub \u2192" })] }, f.issueNumber)))] }));
};
