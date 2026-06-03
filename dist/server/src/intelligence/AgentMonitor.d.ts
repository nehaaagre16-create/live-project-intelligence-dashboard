import type { AgentActivity, ProjectEvent } from '../types.js';
export declare class AgentMonitor {
    private runLogsPath;
    constructor(projectRoot: string);
    analyze(): Promise<{
        agents: AgentActivity[];
        events: ProjectEvent[];
    }>;
    private analyzeAgentRuns;
    private getMockData;
}
