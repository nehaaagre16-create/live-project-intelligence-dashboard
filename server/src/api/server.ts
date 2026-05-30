import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { IntelligenceEngine } from '../intelligence/Engine.js';
import { AlertEngine } from '../alerts/AlertEngine.js';
import { ActionExecutor } from '../alerts/ActionExecutor.js';
import { RetryManager } from '../retry/RetryManager.js';
import type { ProjectSnapshot, TriggerAction } from '../types.js';
import type { FailedTask } from '../retry/RetryManager.js';

export class DashboardServer {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private wss: WebSocketServer;
  private engine: IntelligenceEngine;
  private alertEngine: AlertEngine;
  private actionExecutor: ActionExecutor;
  private retryManager: RetryManager;
  private currentSnapshot: ProjectSnapshot | null = null;
  private currentAlerts: TriggerAction[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(projectRoot: string, private port: number = 3456) {
    this.engine = new IntelligenceEngine(projectRoot);
    this.alertEngine = new AlertEngine();
    this.actionExecutor = new ActionExecutor();
    this.retryManager = new RetryManager();
    this.app = express();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes(): void {
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

    // Approve retry
    this.app.post('/api/retries/:taskId/approve', async (req, res) => {
      const { taskId } = req.params;
      try {
        const result = await this.retryManager.approveRetry(taskId);
        res.json(result);
      } catch (error) {
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
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // Send current snapshot immediately
      if (this.currentSnapshot) {
        ws.send(JSON.stringify({
          type: 'snapshot',
          data: this.currentSnapshot,
        }));
      }

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });
  }

  private broadcastSnapshot(): void {
    if (!this.currentSnapshot) return;

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

  async updateSnapshot(): Promise<void> {
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
            } else {
              console.error(`Failed to create issue: ${result.error}`);
            }
          }
        }
      }
      
      // Detect failed tasks for retry
      if (this.currentSnapshot) {
        const newFailures = this.retryManager.detectFailedTasks(
          this.currentSnapshot.agentActivity,
          this.currentSnapshot.recentEvents
        );
        if (newFailures.length > 0) {
          console.log(`Detected ${newFailures.length} new failed tasks awaiting retry approval`);
        }
      }
      
      console.log(`Snapshot generated at ${new Date().toISOString()}`);
      this.broadcastSnapshot();
    } catch (error) {
      console.error('Failed to generate snapshot:', error);
    }
  }

  async start(): Promise<void> {
    // Generate initial snapshot
    await this.updateSnapshot();

    // Set up periodic updates (every 5 minutes)
    this.updateInterval = setInterval(() => {
      this.updateSnapshot();
    }, 5 * 60 * 1000);

    this.server.listen(this.port, () => {
      console.log(`Dashboard server running on http://localhost:${this.port}`);
      console.log(`WebSocket available at ws://localhost:${this.port}/ws`);
    });
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.wss.close();
    this.server.close();
  }
}
