import React, { useEffect, useRef } from 'react';
import type { ProjectEvent } from '../../../server/src/types';

interface LiveActivityStreamProps {
  events: ProjectEvent[];
  paperclipConnected: boolean;
}

export const LiveActivityStream: React.FC<LiveActivityStreamProps> = ({ 
  events, 
  paperclipConnected 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevEventsLength = useRef(events.length);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (events.length > prevEventsLength.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevEventsLength.current = events.length;
  }, [events.length]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'commit': return '💾';
      case 'agent_run': return '🤖';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  const getEventClass = (type: string) => {
    switch (type) {
      case 'error': return 'event-error';
      case 'warning': return 'event-warning';
      case 'agent_run': return 'event-agent';
      default: return '';
    }
  };

  const getEventSource = (metadata?: Record<string, unknown>) => {
    if (!metadata) return 'System';
    if (metadata.agentName) return `Agent: ${metadata.agentName}`;
    if (metadata.pluginName) return `Plugin: ${metadata.pluginName}`;
    if (metadata.runId) return `Run: ${metadata.runId}`;
    return 'Paperclip';
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card live-activity-card">
      <div className="live-activity-header">
        <h2>Live Activity Stream</h2>
        <div className="live-status">
          {paperclipConnected ? (
            <span className="status-badge connected">
              <span className="pulse-dot" />
              Paperclip Real-Time
            </span>
          ) : (
            <span className="status-badge disconnected">
              ⏸️ Polling Mode
            </span>
          )}
        </div>
      </div>
      
      {events.length === 0 ? (
        <div className="empty-state">
          <p className="no-data">Waiting for activity...</p>
          <p className="empty-hint">
            {paperclipConnected 
              ? 'Events will appear here as they happen in Paperclip'
              : 'Connect to Paperclip for real-time updates'}
          </p>
        </div>
      ) : (
        <div className="activity-stream" ref={scrollRef}>
          {events.map((event, idx) => (
            <div 
              key={`${event.id}-${idx}`} 
              className={`activity-stream-item ${getEventClass(event.type)} ${idx === 0 ? 'new' : ''}`}
            >
              <div className="activity-stream-left">
                <span className="activity-icon">{getEventIcon(event.type)}</span>
                <div className="activity-stream-content">
                  <span className="activity-message">{event.message}</span>
                  <span className="activity-source">{getEventSource(event.metadata)}</span>
                </div>
              </div>
              <span className="activity-time" title={new Date(event.timestamp).toLocaleString()}>
                {formatTime(event.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
