export class RetryManager {
    failedTasks = new Map();
    maxRetries = 3;
    backoffDelays = [2 * 60 * 1000, 5 * 60 * 1000, 10 * 60 * 1000]; // 2min, 5min, 10min
    detectFailedTasks(agents, events) {
        const newFailures = [];
        for (const event of events) {
            if (event.type === 'error' || (event.type === 'agent_run' && event.message.includes('failed'))) {
                const taskId = this.extractTaskId(event.message);
                const agentName = this.extractAgentName(event.message);
                if (!taskId || this.failedTasks.has(taskId))
                    continue;
                const failedTask = {
                    id: taskId,
                    agentId: this.findAgentId(agents, agentName),
                    agentName: agentName || 'Unknown',
                    taskId,
                    taskName: event.message,
                    error: event.metadata?.error || 'Unknown error',
                    failedAt: new Date(event.timestamp),
                    retryCount: 0,
                    maxRetries: this.maxRetries,
                    status: 'pending_approval',
                    retryHistory: [],
                };
                this.failedTasks.set(taskId, failedTask);
                newFailures.push(failedTask);
            }
        }
        return newFailures;
    }
    getPendingApprovals() {
        return Array.from(this.failedTasks.values())
            .filter(t => t.status === 'pending_approval');
    }
    getRetryHistory() {
        return Array.from(this.failedTasks.values())
            .filter(t => t.retryCount > 0)
            .sort((a, b) => b.failedAt.getTime() - a.failedAt.getTime());
    }
    async approveRetry(taskId) {
        const task = this.failedTasks.get(taskId);
        if (!task) {
            return { success: false, message: 'Task not found' };
        }
        if (task.status !== 'pending_approval') {
            return { success: false, message: `Task is ${task.status}` };
        }
        if (task.retryCount >= task.maxRetries) {
            task.status = 'failed_permanently';
            return { success: false, message: 'Max retries reached' };
        }
        task.status = 'retrying';
        // Simulate retry (in real implementation, this would call Paperclip API)
        const delay = this.backoffDelays[Math.min(task.retryCount, this.backoffDelays.length - 1)];
        // Wait for backoff delay
        await this.sleep(delay);
        // Simulate retry result (70% success rate for demo)
        const success = Math.random() > 0.3;
        task.retryCount++;
        task.retryHistory.push({
            attempt: task.retryCount,
            timestamp: new Date(),
            result: success ? 'success' : 'failed',
            error: success ? undefined : 'Retry failed with similar error',
        });
        if (success) {
            task.status = 'success';
            return { success: true, message: `Task retried successfully on attempt ${task.retryCount}` };
        }
        else {
            if (task.retryCount >= task.maxRetries) {
                task.status = 'failed_permanently';
                return { success: false, message: `Failed after ${task.retryCount} retries` };
            }
            task.status = 'pending_approval';
            return { success: false, message: `Retry failed. ${task.maxRetries - task.retryCount} attempts remaining.` };
        }
    }
    skipRetry(taskId) {
        const task = this.failedTasks.get(taskId);
        if (!task) {
            return { success: false, message: 'Task not found' };
        }
        task.status = 'skipped';
        return { success: true, message: 'Task skipped. Issue should be created manually.' };
    }
    extractTaskId(message) {
        const match = message.match(/PIX-(\d+)/);
        return match ? `PIX-${match[1]}` : null;
    }
    extractAgentName(message) {
        if (message.includes('CEO'))
            return 'CEO';
        if (message.includes('CTO'))
            return 'CTO';
        if (message.includes('Developer'))
            return 'Developer-1';
        return null;
    }
    findAgentId(agents, name) {
        if (!name)
            return 'unknown';
        const agent = agents.find(a => a.agentName === name);
        return agent?.agentId || 'unknown';
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, Math.min(ms, 5000))); // Cap at 5s for demo
    }
    clearOldTasks(olderThanHours = 24) {
        const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
        for (const [id, task] of Array.from(this.failedTasks.entries())) {
            if (task.failedAt < cutoff && (task.status === 'success' || task.status === 'skipped')) {
                this.failedTasks.delete(id);
            }
        }
    }
}
