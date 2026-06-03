import type { AgentActivity, ProjectEvent } from '../types.js';
interface PaperclipConfig {
    apiUrl: string;
    wsUrl: string;
    apiKey?: string;
    companyId?: string;
}
export declare class PaperclipAnalyzer {
    private config;
    private ws;
    private reconnectTimeout;
    private eventBuffer;
    private agentMap;
    private isConnected;
    private messageHandlers;
    constructor(config?: Partial<PaperclipConfig>);
    on(eventType: string, handler: (data: unknown) => void): () => void;
    private emit;
    connect(): Promise<void>;
    private scheduleReconnect;
    private handleLiveEvent;
    private transformToProjectEvent;
    private updateAgentActivity;
    analyze(): Promise<{
        agents: AgentActivity[];
        events: ProjectEvent[];
    }>;
    getRecentEvents(limit?: number): ProjectEvent[];
    getAgentActivity(): AgentActivity[];
    isRealtimeConnected(): boolean;
    disconnect(): void;
}
export {};
