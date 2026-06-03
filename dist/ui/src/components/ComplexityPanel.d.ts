import React from 'react';
import type { ComplexityMetrics } from '../../../server/src/types';
interface ComplexityPanelProps {
    complexity: ComplexityMetrics;
    compact?: boolean;
}
export declare const ComplexityPanel: React.FC<ComplexityPanelProps>;
export {};
