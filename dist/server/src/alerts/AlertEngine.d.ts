import type { ProjectSnapshot } from '../types.js';
import { type ThresholdConfig, type TriggerAction } from './ThresholdConfig.js';
export declare class AlertEngine {
    private thresholds;
    private lastAlerted;
    private cooldownMs;
    constructor(thresholds?: ThresholdConfig);
    check(snapshot: ProjectSnapshot): TriggerAction[];
    getActiveAlerts(snapshot: ProjectSnapshot): TriggerAction[];
}
