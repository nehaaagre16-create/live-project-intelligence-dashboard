import React from 'react';
import type { ArchitectureHealth } from '../../../server/src/types';
interface HeaderProps {
    health: ArchitectureHealth;
    lastUpdate: Date | null;
    isLive: boolean;
    onRefresh: () => void;
    connectionStatus: string;
    paperclipConnected?: boolean;
    liveEventCount?: number;
}
export declare const Header: React.FC<HeaderProps>;
export {};
