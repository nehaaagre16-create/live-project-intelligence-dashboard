export declare class DashboardServer {
    private port;
    private app;
    private server;
    private wss;
    private engine;
    private alertEngine;
    private actionExecutor;
    private retryManager;
    private currentSnapshot;
    private currentAlerts;
    private updateInterval;
    private githubMonitor;
    private failureDetector;
    private currentFailures;
    constructor(projectRoot: string, port?: number);
    private setupMiddleware;
    private setupRoutes;
    private setupWebSocket;
    private broadcastSnapshot;
    private broadcastFailures;
    updateSnapshot(): Promise<void>;
    start(): Promise<void>;
    stop(): void;
}
