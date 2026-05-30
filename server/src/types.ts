export interface TriggerAction {
  severity: 'warning' | 'critical';
  metric: string;
  message: string;
  currentValue: number;
  threshold: number;
  suggestedAssignee: string;
  autoCreateIssue: boolean;
}

export interface FileMetrics {
  path: string;
  lines: number;
  complexity: number;
  churn: number;
  lastModified: Date;
  type: string;
}

export interface ModuleRisk {
  path: string;
  riskScore: number;
  errorRate: number;
  avgResponseTime: number;
  failureCount: number;
  lastFailure: Date | null;
}

export interface DeveloperActivity {
  name: string;
  email: string;
  commits: number;
  filesTouched: number;
  lastCommit: Date;
}

export interface AgentActivity {
  agentId: string;
  agentName: string;
  tasksCompleted: number;
  tasksFailed: number;
  avgDuration: number;
  lastActivity: Date;
  status: 'active' | 'idle' | 'error';
}

export interface ArchitectureHealth {
  score: number;
  trend: 'up' | 'down' | 'stable';
  issues: HealthIssue[];
}

export interface HealthIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  file?: string;
  metric?: string;
}

export interface ProjectSnapshot {
  timestamp: Date;
  health: ArchitectureHealth;
  complexity: ComplexityMetrics;
  risks: ModuleRisk[];
  bottlenecks: DeveloperActivity[];
  agentActivity: AgentActivity[];
  recentEvents: ProjectEvent[];
}

export interface ComplexityMetrics {
  averageComplexity: number;
  maxComplexity: number;
  totalFiles: number;
  totalLines: number;
  hotspots: FileMetrics[];
}

export interface ProjectEvent {
  id: string;
  type: 'commit' | 'agent_run' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface DashboardState {
  snapshot: ProjectSnapshot | null;
  isLive: boolean;
  lastUpdate: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}
