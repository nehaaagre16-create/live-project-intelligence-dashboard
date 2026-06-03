export class ActionExecutor {
    paperclipApiUrl;
    apiKey;
    constructor(paperclipApiUrl = 'http://localhost:3100', apiKey) {
        this.paperclipApiUrl = paperclipApiUrl;
        this.apiKey = apiKey || null;
    }
    async execute(action) {
        if (!action.autoCreateIssue) {
            return { success: true };
        }
        try {
            const result = await this.createPaperclipIssue(action);
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: String(error),
            };
        }
    }
    async createPaperclipIssue(action) {
        const headers = {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Network error: ${String(error)}`,
            };
        }
    }
    // Get pending actions (for UI display)
    getPendingActions(actions) {
        return actions.filter(a => a.autoCreateIssue);
    }
}
