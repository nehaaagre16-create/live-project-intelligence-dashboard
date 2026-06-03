import React from 'react';
import type { ProjectEvent } from '../../../server/src/types';

interface ActivityFeedProps {
  events: ProjectEvent[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events }) => {
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
      default: return '';
    }
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
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Activity Feed</div>
          <div className="card-subtitle">Recent events</div>
        </div>
      </div>
      
      {events.length === 0 ? (
        <div className="no-data">No recent activity</div>
      ) : (
        <div className="activity-list">
          {events.map((event, idx) => (
            <div key={`${event.id}-${idx}`} className={`activity-item ${getEventClass(event.type)}`}>
              <span className="activity-icon">{getEventIcon(event.type)}</span>
              <div className="activity-content">
                <span className="activity-message">{event.message}</span>
                <span className="activity-time">{formatTime(event.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
