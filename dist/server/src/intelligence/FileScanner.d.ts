import type { ComplexityMetrics } from '../types.js';
export declare class FileScanner {
    private projectRoot;
    private excludePatterns;
    constructor(projectRoot: string, excludePatterns?: string[]);
    scan(): Promise<ComplexityMetrics>;
    private calculateComplexity;
    getFileChurn(filePath: string, days?: number): Promise<number>;
}
