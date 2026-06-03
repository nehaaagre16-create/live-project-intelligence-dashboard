import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { IntelligenceEngine } from '../intelligence/Engine.js';
import { AlertEngine } from '../alerts/AlertEngine.js';
import { ActionExecutor } from '../alerts/ActionExecutor.js';
import { RetryManager } from '../retry/RetryManager.js';
import { GitHubMonitor } from '../github/GitHubMonitor.js';
import { FailureDetector } from '../github/FailureDetector.js';
export class DashboardServer {
    port;
    app;
    server;
    wss;
    engine;
    alertEngine;
    actionExecutor;
    retryManager;
    currentSnapshot = null;
    currentAlerts = [];
    updateInterval = null;
    githubMonitor = null;
    failureDetector = null;
    currentFailures = [];
    constructor(projectRoot, port = 3456) {
        this.port = port;
        this.engine = new IntelligenceEngine(projectRoot);
        this.alertEngine = new AlertEngine();
        this.actionExecutor = new ActionExecutor();
        this.retryManager = new RetryManager();
        this.app = express();
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server, path: '/ws' });
        // Setup GitHub integration if configured
        const githubToken = process.env.GITHUB_TOKEN;
        const githubOwner = process.env.GITHUB_OWNER;
        const githubRepo = process.env.GITHUB_REPO;
        if (githubToken && githubOwner && githubRepo) {
            this.githubMonitor = new GitHubMonitor(githubOwner, githubRepo, githubToken);
            this.failureDetector = new FailureDetector(githubOwner, githubRepo);
            console.log(`[GitHub] Configured for ${githubOwner}/${githubRepo}`);
        }
        else {
            console.warn('[GitHub] Not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO env vars.');
        }
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }
    setupRoutes() {
        // Health check
        this.app.get('/api/health', (_req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        // Get current snapshot
        this.app.get('/api/snapshot', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready yet' });
                return;
            }
            res.json(this.currentSnapshot);
        });
        // Get health score
        this.app.get('/api/health', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready' });
                return;
            }
            res.json(this.currentSnapshot.health);
        });
        // Get complexity metrics
        this.app.get('/api/complexity', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready' });
                return;
            }
            res.json(this.currentSnapshot.complexity);
        });
        // Get risks
        this.app.get('/api/risks', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready' });
                return;
            }
            res.json(this.currentSnapshot.risks);
        });
        // Get bottlenecks
        this.app.get('/api/bottlenecks', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready' });
                return;
            }
            res.json(this.currentSnapshot.bottlenecks);
        });
        // Get agent activity
        this.app.get('/api/agents', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready' });
                return;
            }
            res.json(this.currentSnapshot.agentActivity);
        });
        // Get recent events
        this.app.get('/api/events', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready' });
                return;
            }
            res.json(this.currentSnapshot.recentEvents);
        });
        // Get current alerts
        this.app.get('/api/alerts', (_req, res) => {
            if (!this.currentSnapshot) {
                res.status(503).json({ error: 'Snapshot not ready' });
                return;
            }
            const alerts = this.alertEngine.getActiveAlerts(this.currentSnapshot);
            res.json({
                alerts,
                triggered: this.currentAlerts,
                timestamp: new Date().toISOString(),
            });
        });
        // Get retry pending approvals
        this.app.get('/api/retries/pending', (_req, res) => {
            const pending = this.retryManager.getPendingApprovals();
            res.json({
                pending,
                count: pending.length,
                timestamp: new Date().toISOString(),
            });
        });
        // Get retry history
        this.app.get('/api/retries/history', (_req, res) => {
            const history = this.retryManager.getRetryHistory();
            res.json({
                history,
                count: history.length,
                timestamp: new Date().toISOString(),
            });
        });
        // Get GitHub issue failures with solutions
        this.app.get('/api/github/failures', async (_req, res) => {
            if (!this.githubMonitor || !this.failureDetector) {
                res.status(503).json({
                    error: 'GitHub not configured. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO env vars.',
                    failures: [],
                });
                return;
            }
            try {
                const issues = await this.githubMonitor.fetchIssues();
                const checkRunsMap = new Map();
                // Fetch check runs for PRs
                for (const issue of issues) {
                    if (issue.pull_request) {
                        try {
                            const prResponse = await fetch(issue.pull_request.url, {
                                headers: {
                                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                                    Accept: 'application/vnd.github.v3+json',
                                },
                            });
                            if (prResponse.ok) {
                                const prData = await prResponse.json();
                                const sha = prData.head?.sha;
                                if (sha) {
                                    const runs = await this.githubMonitor.fetchCheckRuns(sha);
                                    checkRunsMap.set(issue.number.toString(), runs);
                                }
                            }
                        }
                        catch (err) {
                            console.warn(`[GitHub] Failed to fetch check runs for PR #${issue.number}:`, err.message);
                        }
                    }
                }
                const failures = this.failureDetector.detect(issues, checkRunsMap);
                this.currentFailures = failures;
                res.json({
                    failures,
                    count: failures.length,
                    timestamp: new Date().toISOString(),
                });
            }
            catch (error) {
                console.error('[GitHub] Failed to fetch failures:', error);
                res.status(500).json({
                    error: String(error),
                    failures: [],
                });
            }
        });
        // Approve retry
        this.app.post('/api/retries/:taskId/approve', async (req, res) => {
            const { taskId } = req.params;
            try {
                const result = await this.retryManager.approveRetry(taskId);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, message: String(error) });
            }
        });
        // Skip retry
        this.app.post('/api/retries/:taskId/skip', (req, res) => {
            const { taskId } = req.params;
            const result = this.retryManager.skipRetry(taskId);
            res.json(result);
        });
        // Trigger manual refresh
        this.app.post('/api/refresh', async (_req, res) => {
            try {
                await this.updateSnapshot();
                res.json({ success: true, timestamp: new Date().toISOString() });
            }
            catch (error) {
                res.status(500).json({ error: String(error) });
            }
        });
        // Serve static UI files
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const uiDistPath = path.resolve(__dirname, '../../../ui/dist');
        this.app.use(express.static(uiDistPath));
        // SPA fallback
        this.app.get('*', (_req, res) => {
            res.sendFile(path.join(uiDistPath, 'index.html'));
        });
    }
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('WebSocket client connected');
            // Send current snapshot immediately
            if (this.currentSnapshot) {
                ws.send(JSON.stringify({
                    type: 'snapshot',
                    data: this.currentSnapshot,
                }));
            }
            // Send Paperclip connection status
            const paperclipAnalyzer = this.engine.getPaperclipAnalyzer();
            const isPaperclipConnected = paperclipAnalyzer.isRealtimeConnected();
            ws.send(JSON.stringify({
                type: 'paperclip_status',
                data: { connected: isPaperclipConnected },
            }));
            // Send recent Paperclip events immediately
            if (isPaperclipConnected) {
                const recentEvents = paperclipAnalyzer.getRecentEvents(20);
                if (recentEvents.length > 0) {
                    ws.send(JSON.stringify({
                        type: 'recent_events',
                        data: recentEvents,
                    }));
                }
            }
            // Send current failures immediately if any
            if (this.currentFailures.length > 0) {
                ws.send(JSON.stringify({
                    type: 'github_failures',
                    data: this.currentFailures,
                }));
            }
            const unsubscribeEvent = paperclipAnalyzer.on('event', (event) => {
                ws.send(JSON.stringify({
                    type: 'event',
                    data: event,
                }));
            });
            const unsubscribeAgent = paperclipAnalyzer.on('heartbeat.run.status', (payload) => {
                ws.send(JSON.stringify({
                    type: 'agent_update',
                    data: payload,
                }));
            });
            const unsubscribeConnected = paperclipAnalyzer.on('connected', () => {
                ws.send(JSON.stringify({
                    type: 'paperclip_status',
                    data: { connected: true },
                }));
            });
            const unsubscribeDisconnected = paperclipAnalyzer.on('disconnected', () => {
                ws.send(JSON.stringify({
                    type: 'paperclip_status',
                    data: { connected: false },
                }));
            });
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                unsubscribeEvent();
                unsubscribeAgent();
                unsubscribeConnected();
                unsubscribeDisconnected();
            });
        });
    }
    broadcastSnapshot() {
        if (!this.currentSnapshot)
            return;
        const message = JSON.stringify({
            type: 'snapshot',
            data: this.currentSnapshot,
        });
        this.wss.clients.forEach((client) => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(message);
            }
        });
    }
    broadcastFailures() {
        if (this.currentFailures.length === 0)
            return;
        const message = JSON.stringify({
            type: 'github_failures',
            data: this.currentFailures,
        });
        this.wss.clients.forEach((client) => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(message);
            }
        });
    }
    async updateSnapshot() {
        try {
            console.log('Generating project snapshot...');
            this.currentSnapshot = await this.engine.generateSnapshot();
            // Check for alerts
            const newAlerts = this.alertEngine.check(this.currentSnapshot);
            if (newAlerts.length > 0) {
                console.log(`Found ${newAlerts.length} new alerts`);
                this.currentAlerts = [...this.currentAlerts, ...newAlerts];
                // Execute actions for critical alerts
                for (const alert of newAlerts) {
                    if (alert.autoCreateIssue) {
                        console.log(`Auto-creating issue for: ${alert.message}`);
                        const result = await this.actionExecutor.execute(alert);
                        if (result.success) {
                            console.log(`Created issue: ${result.issueId}`);
                        }
                        else {
                            console.error(`Failed to create issue: ${result.error}`);
                        }
                    }
                }
            }
            // Detect failed tasks for retry
            if (this.currentSnapshot) {
                const newFailures = this.retryManager.detectFailedTasks(this.currentSnapshot.agentActivity, this.currentSnapshot.recentEvents);
                if (newFailures.length > 0) {
                    console.log(`Detected ${newFailures.length} new failed tasks awaiting retry approval`);
                }
            }
            // Broadcast failures to all connected WebSocket clients
            this.broadcastFailures();
            console.log(`Snapshot generated at ${new Date().toISOString()}`);
            this.broadcastSnapshot();
        }
        catch (error) {
            console.error('Failed to generate snapshot:', error);
        }
    }
    async start() {
        // Start Paperclip real-time connection FIRST (with timeout so it doesn't block)
        const paperclipAnalyzer = this.engine.getPaperclipAnalyzer();
        try {
            await Promise.race([
                paperclipAnalyzer.connect(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000)),
            ]);
            console.log('[DashboardServer] Paperclip real-time connection established');
        }
        catch (err) {
            console.warn('[DashboardServer] Could not connect to Paperclip:', err.message);
            console.warn('[DashboardServer] Will retry during snapshot generation');
        }
        // Generate initial snapshot
        await this.updateSnapshot();
        // Set up periodic updates (every 30 seconds for near real-time)
        this.updateInterval = setInterval(() => {
            this.updateSnapshot();
        }, 30 * 1000);
        this.server.listen(this.port, () => {
            console.log(`Dashboard server running on http://localhost:${this.port}`);
            console.log(`WebSocket available at ws://localhost:${this.port}/ws`);
        });
    }
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.wss.close();
        this.server.close();
    }
}
