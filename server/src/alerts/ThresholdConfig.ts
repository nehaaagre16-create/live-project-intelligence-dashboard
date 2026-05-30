export interface ThresholdConfig {
  health: {
    warning: number;
    critical: number;
  };
  agentSuccessRate: {
    warning: number;
    critical: number;
  };
  hotspots: {
    warning: number;
    critical: number;
  };
  maxComplexity: {
    warning: number;
    critical: number;
  };
  failedTasks: {
    warning: number;
    critical: number;
  };
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  health: {
    warning: 70,
    critical: 50,
  },
  agentSuccessRate: {
    warning: 85,
    critical: 70,
  },
  hotspots: {
    warning: 25,
    critical: 40,
  },
  maxComplexity: {
    warning: 500,
    critical: 800,
  },
  failedTasks: {
    warning: 5,
    critical: 10,
  },
};

export interface TriggerAction {
  severity: 'warning' | 'critical';
  metric: string;
  message: string;
  currentValue: number;
  threshold: number;
  suggestedAssignee: string;
  autoCreateIssue: boolean;
}
