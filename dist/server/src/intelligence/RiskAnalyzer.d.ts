import type { ModuleRisk, ProjectEvent } from '../types.js';
export declare class RiskAnalyzer {
    private projectRoot;
    constructor(projectRoot: string);
    analyze(): Promise<{
        risks: ModuleRisk[];
        events: ProjectEvent[];
    }>;
    private findApiFiles;
    private assessFileRisk;
}
