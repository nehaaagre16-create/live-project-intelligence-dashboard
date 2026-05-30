import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardState, ProjectSnapshot } from '../../../server/src/types';

interface DashboardContextType {
  state: DashboardState;
  refresh: () => Promise<void>;
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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

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
        if (message.type === 'snapshot') {
          setState(prev => ({
            ...prev,
            snapshot: message.data,
            lastUpdate: new Date(),
          }));
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
  }, []);

  const refresh = useCallback(async () => {
    await fetchSnapshot();
  }, [fetchSnapshot]);

  useEffect(() => {
    fetchSnapshot();
    connectWebSocket();

    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchSnapshot, connectWebSocket]);

  return (
    <DashboardContext.Provider value={{ state, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
};
