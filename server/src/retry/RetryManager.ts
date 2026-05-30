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

export class RetryManager {
  private failedTasks: Map<string, FailedTask> = new Map();
  private maxRetries: number = 3;
  private backoffDelays: number[] = [2 * 60 * 1000, 5 * 60 * 1000, 10 * 60 * 1000]; // 2min, 5min, 10min

  detectFailedTasks(agents: AgentActivity[], events: ProjectEvent[]): FailedTask[] {
    const newFailures: FailedTask[] = [];

    for (const event of events) {
      if (event.type === 'error' || (event.type === 'agent_run' && event.message.includes('failed'))) {
        const taskId = this.extractTaskId(event.message);
        const agentName = this.extractAgentName(event.message);
        
        if (!taskId || this.failedTasks.has(taskId)) continue;

        const failedTask: FailedTask = {
          id: taskId,
          agentId: this.findAgentId(agents, agentName),
          agentName: agentName || 'Unknown',
          taskId,
          taskName: event.message,
          error: event.metadata?.error as string || 'Unknown error',
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

  getPendingApprovals(): FailedTask[] {
    return Array.from(this.failedTasks.values())
      .filter(t => t.status === 'pending_approval');
  }

  getRetryHistory(): FailedTask[] {
    return Array.from(this.failedTasks.values())
      .filter(t => t.retryCount > 0)
      .sort((a, b) => b.failedAt.getTime() - a.failedAt.getTime());
  }

  async approveRetry(taskId: string): Promise<{ success: boolean; message: string }> {
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
    } else {
      if (task.retryCount >= task.maxRetries) {
        task.status = 'failed_permanently';
        return { success: false, message: `Failed after ${task.retryCount} retries` };
      }
      task.status = 'pending_approval';
      return { success: false, message: `Retry failed. ${task.maxRetries - task.retryCount} attempts remaining.` };
    }
  }

  skipRetry(taskId: string): { success: boolean; message: string } {
    const task = this.failedTasks.get(taskId);
    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    task.status = 'skipped';
    return { success: true, message: 'Task skipped. Issue should be created manually.' };
  }

  private extractTaskId(message: string): string | null {
    const match = message.match(/PIX-(\d+)/);
    return match ? `PIX-${match[1]}` : null;
  }

  private extractAgentName(message: string): string | null {
    if (message.includes('CEO')) return 'CEO';
    if (message.includes('CTO')) return 'CTO';
    if (message.includes('Developer')) return 'Developer-1';
    return null;
  }

  private findAgentId(agents: AgentActivity[], name: string | null): string {
    if (!name) return 'unknown';
    const agent = agents.find(a => a.agentName === name);
    return agent?.agentId || 'unknown';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.min(ms, 5000))); // Cap at 5s for demo
  }

  clearOldTasks(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    for (const [id, task] of Array.from(this.failedTasks.entries())) {
      if (task.failedAt < cutoff && (task.status === 'success' || task.status === 'skipped')) {
        this.failedTasks.delete(id);
      }
    }
  }
}
