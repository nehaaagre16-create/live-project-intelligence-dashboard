import React from 'react';
import type { ProjectEvent } from '../../../server/src/types';
interface ActivityFeedProps {
    events: ProjectEvent[];
}
export declare const ActivityFeed: React.FC<ActivityFeedProps>;
export {};
