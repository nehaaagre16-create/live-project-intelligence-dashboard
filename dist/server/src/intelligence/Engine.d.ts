import { PaperclipAnalyzer } from './PaperclipAnalyzer.js';
import type { ProjectSnapshot } from '../types.js';
export declare class IntelligenceEngine {
    private fileScanner;
    private gitAnalyzer;
    private riskAnalyzer;
    private healthAnalyzer;
    private agentMonitor;
    private paperclipAnalyzer;
    private projectRoot;
    constructor(projectRoot: string);
    generateSnapshot(): Promise<ProjectSnapshot>;
    getPaperclipAnalyzer(): PaperclipAnalyzer;
}
