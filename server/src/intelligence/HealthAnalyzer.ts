import type { ArchitectureHealth, HealthIssue, ComplexityMetrics, ModuleRisk } from '../types.js';

export class HealthAnalyzer {
  analyze(
    complexity: ComplexityMetrics,
    risks: ModuleRisk[],
    totalFiles: number
  ): ArchitectureHealth {
    const issues: HealthIssue[] = [];
    let score = 100;

    // Complexity penalties
    if (complexity.averageComplexity > 20) {
      score -= 15;
      issues.push({
        severity: 'warning',
        message: `High average complexity (${complexity.averageComplexity.toFixed(1)})`,
        metric: 'complexity',
      });
    }

    if (complexity.maxComplexity > 50) {
      score -= 10;
      issues.push({
        severity: 'critical',
        message: `Extremely complex file detected (${complexity.maxComplexity})`,
        metric: 'maxComplexity',
      });
    }

    // Risk penalties
    const highRiskCount = risks.filter(r => r.riskScore > 70).length;
    if (highRiskCount > 0) {
      score -= highRiskCount * 5;
      issues.push({
        severity: 'critical',
        message: `${highRiskCount} high-risk modules detected`,
        metric: 'riskCount',
      });
    }

    const mediumRiskCount = risks.filter(r => r.riskScore > 40 && r.riskScore <= 70).length;
    if (mediumRiskCount > 5) {
      score -= 10;
      issues.push({
        severity: 'warning',
        message: `${mediumRiskCount} medium-risk modules`,
        metric: 'riskCount',
      });
    }

    // File size penalties
    const largeFiles = complexity.hotspots.filter(f => f.lines > 300).length;
    if (largeFiles > 0) {
      score -= Math.min(largeFiles * 2, 10);
      issues.push({
        severity: 'warning',
        message: `${largeFiles} files exceed 300 lines`,
        metric: 'fileSize',
      });
    }

    // Empty project penalty
    if (totalFiles === 0) {
      score = 0;
      issues.push({
        severity: 'info',
        message: 'No source files found in project',
      });
    }

    // Ensure score stays in 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine trend (placeholder - would compare with historical data)
    const trend = score > 80 ? 'up' : score > 50 ? 'stable' : 'down';

    return {
      score: Math.round(score),
      trend,
      issues,
    };
  }
}
