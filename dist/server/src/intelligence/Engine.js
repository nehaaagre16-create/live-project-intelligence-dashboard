import { FileScanner } from './FileScanner.js';
import { GitAnalyzer } from './GitAnalyzer.js';
import { RiskAnalyzer } from './RiskAnalyzer.js';
import { HealthAnalyzer } from './HealthAnalyzer.js';
import { AgentMonitor } from './AgentMonitor.js';
import { PaperclipAnalyzer } from './PaperclipAnalyzer.js';
export class IntelligenceEngine {
    fileScanner;
    gitAnalyzer;
    riskAnalyzer;
    healthAnalyzer;
    agentMonitor;
    paperclipAnalyzer;
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.fileScanner = new FileScanner(projectRoot);
        this.gitAnalyzer = new GitAnalyzer(projectRoot);
        this.riskAnalyzer = new RiskAnalyzer(projectRoot);
        this.healthAnalyzer = new HealthAnalyzer();
        this.agentMonitor = new AgentMonitor(projectRoot);
        this.paperclipAnalyzer = new PaperclipAnalyzer();
    }
    async generateSnapshot() {
        const timestamp = new Date();
        // Run all analyzers in parallel with individual timeouts
        const [complexity, gitData, riskData, agentData, paperclipData] = await Promise.all([
            this.fileScanner.scan(),
            this.gitAnalyzer.analyze(),
            this.riskAnalyzer.analyze(),
            this.agentMonitor.analyze(),
            Promise.race([
                this.paperclipAnalyzer.analyze(),
                new Promise((resolve) => setTimeout(() => resolve({ agents: [], events: [] }), 4000)),
            ]),
        ]);
        // Calculate health
        const health = this.healthAnalyzer.analyze(complexity, riskData.risks, complexity.totalFiles);
        // Merge all events - Paperclip events take priority for real-time
        const recentEvents = [
            ...paperclipData.events,
            ...gitData.events,
            ...riskData.events,
            ...agentData.events,
        ]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 50);
        // Find bottlenecks (developers with highest commit count = potential bottleneck)
        const bottlenecks = gitData.developers.slice(0, 5);
        // Merge agent activity - Paperclip data is more real-time
        const mergedAgents = paperclipData.agents.length > 0
            ? paperclipData.agents
            : agentData.agents;
        return {
            timestamp,
            health,
            complexity,
            risks: riskData.risks.slice(0, 20),
            bottlenecks,
            agentActivity: mergedAgents,
            recentEvents,
        };
    }
    getPaperclipAnalyzer() {
        return this.paperclipAnalyzer;
    }
}
