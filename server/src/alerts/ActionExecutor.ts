import type { TriggerAction } from './ThresholdConfig.js';

export interface IssueCreateResult {
  success: boolean;
  issueId?: string;
  error?: string;
}

export class ActionExecutor {
  private paperclipApiUrl: string;
  private apiKey: string | null;

  constructor(paperclipApiUrl: string = 'http://localhost:3100', apiKey?: string) {
    this.paperclipApiUrl = paperclipApiUrl;
    this.apiKey = apiKey || null;
  }

  async execute(action: TriggerAction): Promise<IssueCreateResult> {
    if (!action.autoCreateIssue) {
      return { success: true };
    }

    try {
      const result = await this.createPaperclipIssue(action);
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  private async createPaperclipIssue(action: TriggerAction): Promise<IssueCreateResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const title = `[${action.severity.toUpperCase()}] ${action.message}`;
    const body = `## Alert Triggered

**Metric:** ${action.metric}
**Current Value:** ${action.currentValue}
**Threshold:** ${action.threshold}
**Severity:** ${action.severity}
**Suggested Assignee:** ${action.suggestedAssignee}
**Time:** ${new Date().toISOString()}

### Action Required
This issue was auto-created because the ${action.metric} metric exceeded the ${action.severity} threshold.

- [ ] Investigate root cause
- [ ] Implement fix
- [ ] Verify metric returns to normal
`;

    // Try to create via Paperclip API
    try {
      const response = await fetch(`${this.paperclipApiUrl}/api/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          description: body,
          priority: action.severity === 'critical' ? 'critical' : 'high',
          assignee: action.suggestedAssignee,
          labels: ['intelligence-alert', action.severity, action.metric],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, issueId: data.id };
      }

      // If API fails, return the action details so UI can show it
      return {
        success: false,
        error: `API returned ${response.status}: ${await response.text()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${String(error)}`,
      };
    }
  }

  // Get pending actions (for UI display)
  getPendingActions(actions: TriggerAction[]): TriggerAction[] {
    return actions.filter(a => a.autoCreateIssue);
  }
}
