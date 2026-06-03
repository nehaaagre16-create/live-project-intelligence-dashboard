import type { AgentActivity, ProjectEvent } from '../types.js';
export interface FailedTask {
    id: string;
    agentId: string;
    agentName: string;
    taskId: string;
    taskName: string;
    error: string;
    failedAt: Date;
    retryCount: number;
    maxRetries: number;
    status: 'pending_approval' | 'retrying' | 'success' | 'failed_permanently' | 'skipped';
    retryHistory: RetryAttempt[];
}
export interface RetryAttempt {
    attempt: number;
    timestamp: Date;
    result: 'success' | 'failed';
    error?: string;
}
export declare class RetryManager {
    private failedTasks;
    private maxRetries;
    private backoffDelays;
    detectFailedTasks(agents: AgentActivity[], events: ProjectEvent[]): FailedTask[];
    getPendingApprovals(): FailedTask[];
    getRetryHistory(): FailedTask[];
    approveRetry(taskId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    skipRetry(taskId: string): {
        success: boolean;
        message: string;
    };
    private extractTaskId;
    private extractAgentName;
    private findAgentId;
    private sleep;
    clearOldTasks(olderThanHours?: number): void;
}
