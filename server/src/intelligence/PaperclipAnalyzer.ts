import { WebSocket } from 'ws';
import type { AgentActivity, ProjectEvent, ProjectSnapshot } from '../types.js';

interface PaperclipConfig {
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
  companyId?: string;
}

interface LiveEvent {
  id: number;
  companyId: string;
  type: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export class PaperclipAnalyzer {
  private config: PaperclipConfig;
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private eventBuffer: ProjectEvent[] = [];
  private agentMap: Map<string, AgentActivity> = new Map();
  private isConnected = false;
  private messageHandlers: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor(config?: Partial<PaperclipConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.PAPERCLIP_API_URL || 'http://localhost:3100',
      wsUrl: config?.wsUrl || process.env.PAPERCLIP_WS_URL || 'ws://localhost:3100',
      apiKey: config?.apiKey || process.env.PAPERCLIP_API_KEY,
      companyId: config?.companyId || process.env.PAPERCLIP_COMPANY_ID,
    };
  }

  // Subscribe to specific event types
  on(eventType: string, handler: (data: unknown) => void): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);

    return () => {
      const handlers = this.messageHandlers.get(eventType);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx > -1) handlers.splice(idx, 1);
      }
    };
  }

  private emit(eventType: string, data: unknown): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(h => {
        try {
          h(data);
        } catch (err) {
          console.error(`Error in handler for ${eventType}:`, err);
        }
      });
    }
    // Also emit to wildcard listeners
    const wildcards = this.messageHandlers.get('*');
    if (wildcards) {
      wildcards.forEach(h => {
        try {
          h({ type: eventType, data });
        } catch (err) {
          console.error('Error in wildcard handler:', err);
        }
      });
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.config.companyId
          ? `${this.config.wsUrl}/api/companies/${this.config.companyId}/events/ws`
          : `${this.config.wsUrl}/api/events/ws`;

        console.log(`[PaperclipAnalyzer] Connecting to ${wsUrl}`);

        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        this.ws = new WebSocket(wsUrl, { headers });

        this.ws.on('open', () => {
          console.log('[PaperclipAnalyzer] Connected to Paperclip live events');
          this.isConnected = true;
          this.emit('connected', {});
          resolve();
        });

        this.ws.on('message', (data: Buffer) => {
          try {
            const event: LiveEvent = JSON.parse(data.toString());
            this.handleLiveEvent(event);
          } catch (err) {
            console.error('[PaperclipAnalyzer] Failed to parse message:', err);
          }
        });

        this.ws.on('close', () => {
          console.log('[PaperclipAnalyzer] Disconnected, reconnecting...');
          this.isConnected = false;
          this.emit('disconnected', {});
          this.scheduleReconnect();
        });

        this.ws.on('error', (err) => {
          console.error('[PaperclipAnalyzer] WebSocket error:', err.message);
          this.isConnected = false;
          this.emit('error', err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch(() => {
        // Will retry again via close handler
      });
    }, 30000); // Retry every 30s instead of 5s to avoid spam
  }

  private handleLiveEvent(event: LiveEvent): void {
    // Transform Paperclip event to ProjectEvent
    const projectEvent = this.transformToProjectEvent(event);
    if (projectEvent) {
      this.eventBuffer.unshift(projectEvent);
      // Keep only last 100 events
      if (this.eventBuffer.length > 100) {
        this.eventBuffer = this.eventBuffer.slice(0, 100);
      }
    }

    // Update agent activity tracking
    this.updateAgentActivity(event);

    // Emit specific event types for real-time consumers
    this.emit(event.type, event.payload);
    this.emit('event', event);
  }

  private transformToProjectEvent(event: LiveEvent): ProjectEvent | null {
    const timestamp = new Date(event.createdAt);

    switch (event.type) {
      case 'heartbeat.run.queued':
        return {
          id: `run-queued-${event.id}`,
          type: 'info',
          message: `Run queued: ${event.payload.runId || 'unknown'}`,
          timestamp,
          metadata: event.payload,
        };

      case 'heartbeat.run.status':
        const status = event.payload.status as string;
        return {
          id: `run-status-${event.id}`,
          type: status === 'failed' ? 'error' : status === 'completed' ? 'info' : 'agent_run',
          message: `Run ${status}: ${event.payload.runId || 'unknown'}`,
          timestamp,
          metadata: event.payload,
        };

      case 'heartbeat.run.event':
        return {
          id: `run-event-${event.id}`,
          type: 'agent_run',
          message: `Agent event: ${event.payload.eventType || 'update'}`,
          timestamp,
          metadata: event.payload,
        };

      case 'agent.status':
        const agentStatus = event.payload.status as string;
        return {
          id: `agent-${event.id}`,
          type: agentStatus === 'error' ? 'error' : 'info',
          message: `Agent ${event.payload.agentName || 'unknown'} is ${agentStatus}`,
          timestamp,
          metadata: event.payload,
        };

      case 'activity.logged':
        return {
          id: `activity-${event.id}`,
          type: 'info',
          message: event.payload.message as string || 'Activity logged',
          timestamp,
          metadata: event.payload,
        };

      case 'plugin.worker.crashed':
        return {
          id: `plugin-crash-${event.id}`,
          type: 'error',
          message: `Plugin worker crashed: ${event.payload.pluginName || 'unknown'}`,
          timestamp,
          metadata: event.payload,
        };

      case 'plugin.worker.restarted':
        return {
          id: `plugin-restart-${event.id}`,
          type: 'warning',
          message: `Plugin worker restarted: ${event.payload.pluginName || 'unknown'}`,
          timestamp,
          metadata: event.payload,
        };

      default:
        return {
          id: `unknown-${event.id}`,
          type: 'info',
          message: `Event: ${event.type}`,
          timestamp,
          metadata: event.payload,
        };
    }
  }

  private updateAgentActivity(event: LiveEvent): void {
    if (event.type === 'heartbeat.run.status' || event.type === 'agent.status') {
      const agentId = (event.payload.agentId || event.payload.agentName || 'unknown') as string;
      const existing = this.agentMap.get(agentId);

      if (!existing) {
        this.agentMap.set(agentId, {
          agentId,
          agentName: (event.payload.agentName || agentId) as string,
          tasksCompleted: event.type === 'heartbeat.run.status' && event.payload.status === 'completed' ? 1 : 0,
          tasksFailed: event.type === 'heartbeat.run.status' && event.payload.status === 'failed' ? 1 : 0,
          avgDuration: 0,
          lastActivity: new Date(event.createdAt),
          status: (event.payload.status as AgentActivity['status']) || 'idle',
        });
      } else {
        existing.lastActivity = new Date(event.createdAt);
        if (event.type === 'heartbeat.run.status') {
          if (event.payload.status === 'completed') {
            existing.tasksCompleted++;
            existing.status = 'active';
          } else if (event.payload.status === 'failed') {
            existing.tasksFailed++;
            existing.status = 'error';
          }
        }
        if (event.type === 'agent.status') {
          existing.status = (event.payload.status as AgentActivity['status']) || existing.status;
        }
      }
    }
  }

  async analyze(): Promise<{ agents: AgentActivity[]; events: ProjectEvent[] }> {
    // If not connected, try to connect with timeout
    if (!this.isConnected) {
      try {
        await Promise.race([
          this.connect(),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Paperclip connect timeout')), 3000)
          ),
        ]);
      } catch {
        console.log('[PaperclipAnalyzer] Could not connect to Paperclip, using fallback');
      }
    }

    return {
      agents: Array.from(this.agentMap.values()),
      events: [...this.eventBuffer],
    };
  }

  getRecentEvents(limit = 50): ProjectEvent[] {
    return this.eventBuffer.slice(0, limit);
  }

  getAgentActivity(): AgentActivity[] {
    return Array.from(this.agentMap.values());
  }

  isRealtimeConnected(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}
