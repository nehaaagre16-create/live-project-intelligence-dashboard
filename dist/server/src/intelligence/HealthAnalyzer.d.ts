import type { ArchitectureHealth, ComplexityMetrics, ModuleRisk } from '../types.js';
export declare class HealthAnalyzer {
    analyze(complexity: ComplexityMetrics, risks: ModuleRisk[], totalFiles: number): ArchitectureHealth;
}
