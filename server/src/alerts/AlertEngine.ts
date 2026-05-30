import type { ProjectSnapshot, AgentActivity } from '../types.js';
import { DEFAULT_THRESHOLDS, type ThresholdConfig, type TriggerAction } from './ThresholdConfig.js';

export class AlertEngine {
  private thresholds: ThresholdConfig;
  private lastAlerted: Map<string, number> = new Map();
  private cooldownMs: number = 30 * 60 * 1000; // 30 min cooldown between same alert

  constructor(thresholds: ThresholdConfig = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  check(snapshot: ProjectSnapshot): TriggerAction[] {
    const actions: TriggerAction[] = [];

    // Health score check
    if (snapshot.health.score < this.thresholds.health.critical) {
      actions.push({
        severity: 'critical',
        metric: 'health',
        message: `Project health score is critically low: ${snapshot.health.score}/100`,
        currentValue: snapshot.health.score,
        threshold: this.thresholds.health.critical,
        suggestedAssignee: 'CTO',
        autoCreateIssue: true,
      });
    } else if (snapshot.health.score < this.thresholds.health.warning) {
      actions.push({
        severity: 'warning',
        metric: 'health',
        message: `Project health score is below recommended: ${snapshot.health.score}/100`,
        currentValue: snapshot.health.score,
        threshold: this.thresholds.health.warning,
        suggestedAssignee: 'CTO',
        autoCreateIssue: false,
      });
    }

    // Agent success rate checks
    for (const agent of snapshot.agentActivity) {
      const total = agent.tasksCompleted + agent.tasksFailed;
      if (total === 0) continue;
      const rate = Math.round((agent.tasksCompleted / total) * 100);

      if (rate < this.thresholds.agentSuccessRate.critical) {
        actions.push({
          severity: 'critical',
          metric: `agent_${agent.agentName}`,
          message: `${agent.agentName} agent success rate is critically low: ${rate}%`,
          currentValue: rate,
          threshold: this.thresholds.agentSuccessRate.critical,
          suggestedAssignee: 'Board',
          autoCreateIssue: true,
        });
      } else if (rate < this.thresholds.agentSuccessRate.warning) {
        actions.push({
          severity: 'warning',
          metric: `agent_${agent.agentName}`,
          message: `${agent.agentName} agent success rate is declining: ${rate}%`,
          currentValue: rate,
          threshold: this.thresholds.agentSuccessRate.warning,
          suggestedAssignee: 'Board',
          autoCreateIssue: false,
        });
      }
    }

    // Hotspot files check
    const hotspotCount = snapshot.complexity.hotspots.length;
    if (hotspotCount > this.thresholds.hotspots.critical) {
      actions.push({
        severity: 'critical',
        metric: 'hotspots',
        message: `Too many hotspot files: ${hotspotCount} files need refactoring`,
        currentValue: hotspotCount,
        threshold: this.thresholds.hotspots.critical,
        suggestedAssignee: 'Developer-1',
        autoCreateIssue: true,
      });
    } else if (hotspotCount > this.thresholds.hotspots.warning) {
      actions.push({
        severity: 'warning',
        metric: 'hotspots',
        message: `Growing number of hotspot files: ${hotspotCount}`,
        currentValue: hotspotCount,
        threshold: this.thresholds.hotspots.warning,
        suggestedAssignee: 'Developer-1',
        autoCreateIssue: false,
      });
    }

    // Max complexity check
    if (snapshot.complexity.maxComplexity > this.thresholds.maxComplexity.critical) {
      actions.push({
        severity: 'critical',
        metric: 'maxComplexity',
        message: `Extremely complex file detected: complexity ${snapshot.complexity.maxComplexity}`,
        currentValue: snapshot.complexity.maxComplexity,
        threshold: this.thresholds.maxComplexity.critical,
        suggestedAssignee: 'CTO',
        autoCreateIssue: true,
      });
    } else if (snapshot.complexity.maxComplexity > this.thresholds.maxComplexity.warning) {
      actions.push({
        severity: 'warning',
        metric: 'maxComplexity',
        message: `Very complex file detected: complexity ${snapshot.complexity.maxComplexity}`,
        currentValue: snapshot.complexity.maxComplexity,
        threshold: this.thresholds.maxComplexity.warning,
        suggestedAssignee: 'CTO',
        autoCreateIssue: false,
      });
    }

    // Failed tasks check (per agent streak)
    for (const agent of snapshot.agentActivity) {
      if (agent.tasksFailed > this.thresholds.failedTasks.critical) {
        actions.push({
          severity: 'critical',
          metric: `failed_${agent.agentName}`,
          message: `${agent.agentName} has ${agent.tasksFailed} failed tasks - needs investigation`,
          currentValue: agent.tasksFailed,
          threshold: this.thresholds.failedTasks.critical,
          suggestedAssignee: 'Board',
          autoCreateIssue: true,
        });
      } else if (agent.tasksFailed > this.thresholds.failedTasks.warning) {
        actions.push({
          severity: 'warning',
          metric: `failed_${agent.agentName}`,
          message: `${agent.agentName} has ${agent.tasksFailed} failed tasks`,
          currentValue: agent.tasksFailed,
          threshold: this.thresholds.failedTasks.warning,
          suggestedAssignee: 'Board',
          autoCreateIssue: false,
        });
      }
    }

    // Filter out alerts in cooldown
    const now = Date.now();
    const filtered = actions.filter(a => {
      const key = `${a.severity}_${a.metric}`;
      const last = this.lastAlerted.get(key);
      if (!last || now - last > this.cooldownMs) {
        this.lastAlerted.set(key, now);
        return true;
      }
      return false;
    });

    return filtered;
  }

  getActiveAlerts(snapshot: ProjectSnapshot): TriggerAction[] {
    // Return all current threshold breaches without cooldown filtering
    const actions: TriggerAction[] = [];

    if (snapshot.health.score < this.thresholds.health.warning) {
      actions.push({
        severity: snapshot.health.score < this.thresholds.health.critical ? 'critical' : 'warning',
        metric: 'health',
        message: `Health score: ${snapshot.health.score}/100`,
        currentValue: snapshot.health.score,
        threshold: this.thresholds.health.warning,
        suggestedAssignee: 'CTO',
        autoCreateIssue: snapshot.health.score < this.thresholds.health.critical,
      });
    }

    for (const agent of snapshot.agentActivity) {
      const total = agent.tasksCompleted + agent.tasksFailed;
      if (total === 0) continue;
      const rate = Math.round((agent.tasksCompleted / total) * 100);
      if (rate < this.thresholds.agentSuccessRate.warning) {
        actions.push({
          severity: rate < this.thresholds.agentSuccessRate.critical ? 'critical' : 'warning',
          metric: `agent_${agent.agentName}`,
          message: `${agent.agentName}: ${rate}% success`,
          currentValue: rate,
          threshold: this.thresholds.agentSuccessRate.warning,
          suggestedAssignee: 'Board',
          autoCreateIssue: rate < this.thresholds.agentSuccessRate.critical,
        });
      }
    }

    if (snapshot.complexity.hotspots.length > this.thresholds.hotspots.warning) {
      actions.push({
        severity: snapshot.complexity.hotspots.length > this.thresholds.hotspots.critical ? 'critical' : 'warning',
        metric: 'hotspots',
        message: `${snapshot.complexity.hotspots.length} hotspot files`,
        currentValue: snapshot.complexity.hotspots.length,
        threshold: this.thresholds.hotspots.warning,
        suggestedAssignee: 'Developer-1',
        autoCreateIssue: snapshot.complexity.hotspots.length > this.thresholds.hotspots.critical,
      });
    }

    if (snapshot.complexity.maxComplexity > this.thresholds.maxComplexity.warning) {
      actions.push({
        severity: snapshot.complexity.maxComplexity > this.thresholds.maxComplexity.critical ? 'critical' : 'warning',
        metric: 'maxComplexity',
        message: `Max complexity: ${snapshot.complexity.maxComplexity}`,
        currentValue: snapshot.complexity.maxComplexity,
        threshold: this.thresholds.maxComplexity.warning,
        suggestedAssignee: 'CTO',
        autoCreateIssue: snapshot.complexity.maxComplexity > this.thresholds.maxComplexity.critical,
      });
    }

    return actions;
  }
}
