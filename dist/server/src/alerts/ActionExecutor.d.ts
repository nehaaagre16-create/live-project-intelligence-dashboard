import type { TriggerAction } from './ThresholdConfig.js';
export interface IssueCreateResult {
    success: boolean;
    issueId?: string;
    error?: string;
}
export declare class ActionExecutor {
    private paperclipApiUrl;
    private apiKey;
    constructor(paperclipApiUrl?: string, apiKey?: string);
    execute(action: TriggerAction): Promise<IssueCreateResult>;
    private createPaperclipIssue;
    getPendingActions(actions: TriggerAction[]): TriggerAction[];
}
