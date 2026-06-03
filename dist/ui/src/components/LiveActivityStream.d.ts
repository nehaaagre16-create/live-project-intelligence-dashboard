import React from 'react';
import type { ProjectEvent } from '../../../server/src/types';
interface LiveActivityStreamProps {
    events: ProjectEvent[];
    paperclipConnected: boolean;
}
export declare const LiveActivityStream: React.FC<LiveActivityStreamProps>;
export {};
