import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const RiskPanel = ({ risks, compact }) => {
    const getRiskLevel = (score) => {
        if (score >= 70)
            return 'high';
        if (score >= 40)
            return 'medium';
        return 'low';
    };
    const getRiskColor = (score) => {
        if (score >= 70)
            return 'var(--danger)';
        if (score >= 40)
            return 'var(--warning)';
        return 'var(--success)';
    };
    const displayRisks = compact ? risks.slice(0, 5) : risks;
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-header", children: [_jsxs("div", { children: [_jsx("div", { className: "card-title", children: "Risk Analysis" }), _jsx("div", { className: "card-subtitle", children: "High-risk modules" })] }), risks.length > 0 && (_jsxs("div", { className: "card-badge danger", children: [risks.filter(r => r.riskScore >= 70).length, " Critical"] }))] }), risks.length === 0 ? (_jsx("div", { className: "no-data", children: "No risks detected" })) : (_jsx("div", { className: "risk-list", children: displayRisks.map((risk, idx) => (_jsxs("div", { className: `risk-item ${getRiskLevel(risk.riskScore)}`, children: [_jsxs("div", { className: "risk-score", children: [_jsx("div", { className: "risk-score-value", style: { color: getRiskColor(risk.riskScore) }, children: risk.riskScore }), _jsx("div", { className: "risk-score-label", style: { color: getRiskColor(risk.riskScore) }, children: getRiskLevel(risk.riskScore) })] }), _jsxs("div", { className: "risk-info", children: [_jsx("div", { className: "risk-path", children: risk.path }), !compact && (_jsxs("div", { className: "risk-metrics", children: [_jsxs("div", { className: "risk-metric", children: ["Errors: ", _jsx("strong", { children: risk.failureCount })] }), _jsxs("div", { className: "risk-metric", children: ["Avg: ", _jsxs("strong", { children: [Math.round(risk.avgResponseTime), "ms"] })] }), _jsxs("div", { className: "risk-metric", children: ["Rate: ", _jsxs("strong", { children: [risk.errorRate.toFixed(1), "%"] })] })] }))] })] }, idx))) }))] }));
};
