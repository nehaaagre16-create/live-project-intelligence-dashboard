import React from 'react';
import type { ModuleRisk } from '../../../server/src/types';
interface RiskPanelProps {
    risks: ModuleRisk[];
    compact?: boolean;
}
export declare const RiskPanel: React.FC<RiskPanelProps>;
export {};
