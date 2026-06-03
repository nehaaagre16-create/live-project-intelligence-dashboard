import * as fs from 'fs/promises';
import * as path from 'path';
export class AgentMonitor {
    runLogsPath;
    constructor(projectRoot) {
        // Default Paperclip run logs path
        this.runLogsPath = path.join(process.env.HOME || '/root', '.paperclip', 'instances', 'default', 'data', 'run-logs');
    }
    async analyze() {
        const agents = [];
        const events = [];
        try {
            const companyDirs = await fs.readdir(this.runLogsPath);
            for (const companyId of companyDirs) {
                const companyPath = path.join(this.runLogsPath, companyId);
                const stat = await fs.stat(companyPath);
                if (!stat.isDirectory())
                    continue;
                const agentDirs = await fs.readdir(companyPath);
                for (const agentId of agentDirs) {
                    const agentPath = path.join(companyPath, agentId);
                    const agentStat = await fs.stat(agentPath);
                    if (!agentStat.isDirectory())
                        continue;
                    const activity = await this.analyzeAgentRuns(agentPath, agentId);
                    if (activity) {
                        agents.push(activity);
                        // Create events for recent activity
                        if (activity.status === 'error') {
                            events.push({
                                id: `agent-error-${agentId}`,
                                type: 'error',
                                message: `Agent ${activity.agentName} has errors`,
                                timestamp: activity.lastActivity,
                                metadata: {
                                    agentId,
                                    tasksFailed: activity.tasksFailed,
                                },
                            });
                        }
                    }
                }
            }
        }
        catch {
            // Run logs not available, return mock data for demo
            return this.getMockData();
        }
        return { agents, events };
    }
    async analyzeAgentRuns(agentPath, agentId) {
        try {
            const runFiles = await fs.readdir(agentPath);
            const runs = runFiles.filter(f => f.endsWith('.ndjson'));
            if (runs.length === 0)
                return null;
            let tasksCompleted = 0;
            let tasksFailed = 0;
            let totalDuration = 0;
            let lastActivity = new Date(0);
            let hasErrors = false;
            for (const runFile of runs.slice(-20)) { // Last 20 runs
                try {
                    const content = await fs.readFile(path.join(agentPath, runFile), 'utf-8');
                    const lines = content.split('\n').filter(Boolean);
                    for (const line of lines) {
                        try {
                            const entry = JSON.parse(line);
                            if (entry.ts) {
                                const ts = new Date(entry.ts);
                                if (ts > lastActivity)
                                    lastActivity = ts;
                            }
                            if (entry.chunk) {
                                const chunk = entry.chunk;
                                if (chunk.includes('error') || chunk.includes('Error')) {
                                    hasErrors = true;
                                }
                                if (chunk.includes('done') || chunk.includes('completed')) {
                                    tasksCompleted++;
                                }
                                if (chunk.includes('failed') || chunk.includes('blocked')) {
                                    tasksFailed++;
                                }
                            }
                        }
                        catch {
                            // Skip malformed lines
                        }
                    }
                    totalDuration += lines.length; // Rough proxy
                }
                catch {
                    // Skip unreadable files
                }
            }
            const avgDuration = runs.length > 0 ? totalDuration / runs.length : 0;
            return {
                agentId,
                agentName: `Agent-${agentId.slice(0, 8)}`,
                tasksCompleted,
                tasksFailed,
                avgDuration: Math.round(avgDuration),
                lastActivity,
                status: hasErrors ? 'error' : tasksCompleted > 0 ? 'active' : 'idle',
            };
        }
        catch {
            return null;
        }
    }
    getMockData() {
        const agents = [
            {
                agentId: 'agent-1',
                agentName: 'CEO',
                tasksCompleted: 45,
                tasksFailed: 2,
                avgDuration: 120,
                lastActivity: new Date(),
                status: 'active',
            },
            {
                agentId: 'agent-2',
                agentName: 'CTO',
                tasksCompleted: 38,
                tasksFailed: 5,
                avgDuration: 180,
                lastActivity: new Date(Date.now() - 3600000),
                status: 'active',
            },
            {
                agentId: 'agent-3',
                agentName: 'Developer-1',
                tasksCompleted: 62,
                tasksFailed: 8,
                avgDuration: 90,
                lastActivity: new Date(Date.now() - 7200000),
                status: 'idle',
            },
        ];
        const events = [
            {
                id: 'event-1',
                type: 'agent_run',
                message: 'CEO completed task PIX-45',
                timestamp: new Date(Date.now() - 300000),
            },
            {
                id: 'event-2',
                type: 'error',
                message: 'CTO encountered error in PIX-42',
                timestamp: new Date(Date.now() - 600000),
            },
        ];
        return { agents, events };
    }
}
