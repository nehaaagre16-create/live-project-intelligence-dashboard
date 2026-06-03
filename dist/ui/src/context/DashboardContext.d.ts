import React from 'react';
import type { DashboardState, ProjectEvent } from '../../../server/src/types';
export interface DetectedFailure {
    type: 'ci_failed' | 'merge_conflict' | 'stale' | 'review_blocked' | 'test_failed' | 'build_error';
    issueNumber: number;
    title: string;
    description: string;
    suggestedFix: string;
    severity: 'high' | 'medium' | 'low';
    htmlUrl: string;
    repoOwner: string;
    repoName: string;
}
export interface DashboardContextType {
    state: DashboardState;
    refresh: () => Promise<void>;
    liveEvents: ProjectEvent[];
    paperclipConnected: boolean;
    failures: DetectedFailure[];
    failureCount: number;
}
export declare const DashboardContext: React.Context<DashboardContextType | undefined>;
export declare const DashboardProvider: React.FC<{
    children: React.ReactNode;
}>;
