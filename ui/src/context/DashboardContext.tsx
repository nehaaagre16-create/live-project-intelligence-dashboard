import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardState, ProjectSnapshot, ProjectEvent } from '../../../server/src/types';

export interface DetectedFailure {
  type: 'ci_failed' | 'merge_conflict' | 'stale' | 'review_blocked' | 'test_failed' | 'build_error';
  issueNumber: number;
  title: string;
  description: string;
  suggestedFix: string;
  severity: 'high' | 'medium' | 'low';
  htmlUrl: string;
  repoOwner: string;
  repoName: string;
}

export interface DashboardContextType {
  state: DashboardState;
  refresh: () => Promise<void>;
  liveEvents: ProjectEvent[];
  paperclipConnected: boolean;
  failures: DetectedFailure[];
  failureCount: number;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3456/ws';

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DashboardState>({
    snapshot: null,
    isLive: true,
    lastUpdate: null,
    connectionStatus: 'connecting',
  });
  const [liveEvents, setLiveEvents] = useState<ProjectEvent[]>([]);
  const [paperclipConnected, setPaperclipConnected] = useState(false);
  const [failures, setFailures] = useState<DetectedFailure[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const eventBufferRef = useRef<ProjectEvent[]>([]);

  const fetchSnapshot = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/snapshot`);
      if (!response.ok) throw new Error('Failed to fetch snapshot');
      const snapshot: ProjectSnapshot = await response.json();
      setState(prev => ({
        ...prev,
        snapshot,
        lastUpdate: new Date(),
        connectionStatus: 'connected',
      }));
    } catch (error) {
      console.error('Fetch error:', error);
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    }
  }, []);

  const fetchFailures = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/github/failures`);
      if (!response.ok) {
        if (response.status === 503) {
          console.warn('GitHub not configured for failure detection');
        }
        return;
      }
      const data = await response.json();
      setFailures(data.failures || []);
    } catch (error) {
      console.error('Fetch failures error:', error);
    }
  }, []);

  const addLiveEvent = useCallback((event: ProjectEvent) => {
    eventBufferRef.current.unshift(event);
    if (eventBufferRef.current.length > 100) {
      eventBufferRef.current = eventBufferRef.current.slice(0, 100);
    }
    setLiveEvents([...eventBufferRef.current]);

    // Also update the snapshot's recent events if we have one
    setState(prev => {
      if (!prev.snapshot) return prev;
      const updatedEvents = [event, ...prev.snapshot.recentEvents].slice(0, 50);
      return {
        ...prev,
        snapshot: {
          ...prev.snapshot,
          recentEvents: updatedEvents,
        },
      };
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setState(prev => ({ ...prev, connectionStatus: 'connected' }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'snapshot':
            setState(prev => ({
              ...prev,
              snapshot: message.data,
              lastUpdate: new Date(),
            }));
            break;
          
          case 'event': {
            const liveEvent = message.data as ProjectEvent;
            addLiveEvent(liveEvent);
            break;
          }
          
          case 'recent_events': {
            const events = message.data as ProjectEvent[];
            events.forEach(e => addLiveEvent(e));
            break;
          }
          
          case 'agent_update': {
            const payload = message.data as Record<string, unknown>;
            const agentEvent: ProjectEvent = {
              id: `agent-update-${Date.now()}`,
              type: payload.status === 'failed' ? 'error' : 'agent_run',
              message: `Agent ${payload.agentName || 'unknown'}: ${payload.status}`,
              timestamp: new Date(),
              metadata: payload,
            };
            addLiveEvent(agentEvent);
            break;
          }

          case 'paperclip_status': {
            const status = message.data as { connected: boolean };
            setPaperclipConnected(status.connected);
            break;
          }

          case 'github_failures': {
            const failureData = message.data as DetectedFailure[];
            setFailures(failureData);
            break;
          }

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    };
  }, [addLiveEvent]);

  const refresh = useCallback(async () => {
    await fetchSnapshot();
    await fetchFailures();
  }, [fetchSnapshot, fetchFailures]);

  useEffect(() => {
    fetchSnapshot();
    fetchFailures();
    connectWebSocket();

    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchSnapshot, connectWebSocket]);

  return (
    <DashboardContext.Provider value={{ state, refresh, liveEvents, paperclipConnected, failures, failureCount: failures.length }}>
      {children}
    </DashboardContext.Provider>
  );
};
