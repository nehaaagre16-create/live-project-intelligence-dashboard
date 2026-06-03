import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ComplexityPanel = ({ complexity, compact }) => {
    const formatNumber = (n) => n.toLocaleString();
    const stats = [
        { label: 'Files', value: formatNumber(complexity.totalFiles) },
        { label: 'Lines', value: formatNumber(complexity.totalLines) },
        { label: 'Avg Complexity', value: complexity.averageComplexity.toFixed(1) },
        { label: 'Max Complexity', value: complexity.maxComplexity },
    ];
    const getBarColor = (complexity) => {
        if (complexity > 50)
            return 'var(--danger)';
        if (complexity > 20)
            return 'var(--warning)';
        return 'var(--success)';
    };
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header", children: _jsxs("div", { children: [_jsx("div", { className: "card-title", children: "Code Complexity" }), _jsx("div", { className: "card-subtitle", children: "Project metrics & hotspots" })] }) }), _jsx("div", { className: "complexity-stats", children: stats.map((stat, idx) => (_jsxs("div", { className: "complexity-stat", children: [_jsx("div", { className: "complexity-stat-value", children: stat.value }), _jsx("div", { className: "complexity-stat-label", children: stat.label })] }, idx))) }), !compact && complexity.hotspots.length > 0 && (_jsxs("div", { children: [_jsx("div", { className: "card-title", style: { marginBottom: '12px', fontSize: '13px' }, children: "Hotspots" }), _jsx("div", { className: "hotspot-list", children: complexity.hotspots.slice(0, 10).map((file, idx) => (_jsxs("div", { className: "hotspot-item", children: [_jsxs("div", { className: "hotspot-info", style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { className: "hotspot-name", children: file.path }), _jsxs("div", { className: "hotspot-meta", children: [formatNumber(file.lines), " lines"] })] }), _jsx("div", { className: "hotspot-bar", style: { width: '100px', flexShrink: 0 }, children: _jsx("div", { className: "hotspot-bar-fill", style: {
                                            width: `${Math.min((file.complexity / complexity.maxComplexity) * 100, 100)}%`,
                                            background: getBarColor(file.complexity),
                                        } }) }), _jsx("div", { className: "hotspot-value", children: file.complexity })] }, idx))) })] }))] }));
};
