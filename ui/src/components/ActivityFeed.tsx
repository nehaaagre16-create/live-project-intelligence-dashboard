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

  return (
    <div className="card activity-card">
      <h2>Live Activity Feed</h2>
      
      {events.length === 0 ? (
        <p className="no-data">No recent activity</p>
      ) : (
        <div className="activity-list">
          {events.map((event, idx) => (
            <div key={idx} className={`activity-item ${getEventClass(event.type)}`}>
              <span className="activity-icon">{getEventIcon(event.type)}</span>
              <div className="activity-content">
                <span className="activity-message">{event.message}</span>
                <span className="activity-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
