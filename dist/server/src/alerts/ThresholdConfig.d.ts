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
export declare const DEFAULT_THRESHOLDS: ThresholdConfig;
export interface TriggerAction {
    severity: 'warning' | 'critical';
    metric: string;
    message: string;
    currentValue: number;
    threshold: number;
    suggestedAssignee: string;
    autoCreateIssue: boolean;
}
