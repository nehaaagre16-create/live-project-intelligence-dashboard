import { FileScanner } from './FileScanner.js';
import { GitAnalyzer } from './GitAnalyzer.js';
import { RiskAnalyzer } from './RiskAnalyzer.js';
import { HealthAnalyzer } from './HealthAnalyzer.js';
import { AgentMonitor } from './AgentMonitor.js';
import type { ProjectSnapshot, ProjectEvent } from '../types.js';

export class IntelligenceEngine {
  private fileScanner: FileScanner;
  private gitAnalyzer: GitAnalyzer;
  private riskAnalyzer: RiskAnalyzer;
  private healthAnalyzer: HealthAnalyzer;
  private agentMonitor: AgentMonitor;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.fileScanner = new FileScanner(projectRoot);
    this.gitAnalyzer = new GitAnalyzer(projectRoot);
    this.riskAnalyzer = new RiskAnalyzer(projectRoot);
    this.healthAnalyzer = new HealthAnalyzer();
    this.agentMonitor = new AgentMonitor(projectRoot);
  }

  async generateSnapshot(): Promise<ProjectSnapshot> {
    const timestamp = new Date();

    // Run all analyzers in parallel
    const [complexity, gitData, riskData, agentData] = await Promise.all([
      this.fileScanner.scan(),
      this.gitAnalyzer.analyze(),
      this.riskAnalyzer.analyze(),
      this.agentMonitor.analyze(),
    ]);

    // Calculate health
    const health = this.healthAnalyzer.analyze(
      complexity,
      riskData.risks,
      complexity.totalFiles
    );

    // Merge all events
    const recentEvents: ProjectEvent[] = [
      ...gitData.events,
      ...riskData.events,
      ...agentData.events,
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    // Find bottlenecks (developers with highest commit count = potential bottleneck)
    const bottlenecks = gitData.developers.slice(0, 5);

    return {
      timestamp,
      health,
      complexity,
      risks: riskData.risks.slice(0, 20),
      bottlenecks,
      agentActivity: agentData.agents,
      recentEvents,
    };
  }
}
