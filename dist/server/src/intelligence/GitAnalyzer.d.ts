import type { DeveloperActivity, ProjectEvent } from '../types.js';
export declare class GitAnalyzer {
    private git;
    constructor(projectRoot: string);
    analyze(): Promise<{
        developers: DeveloperActivity[];
        events: ProjectEvent[];
    }>;
    getFileChurn(filePath: string, days?: number): Promise<number>;
}
