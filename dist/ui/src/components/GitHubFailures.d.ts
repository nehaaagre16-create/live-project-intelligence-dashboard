import React from 'react';
import type { DetectedFailure } from '../context/DashboardContext';
export interface Failure {
    type: string;
    issueNumber: number;
    title: string;
    description: string;
    suggestedFix: string;
    severity: 'high' | 'medium' | 'low';
    htmlUrl: string;
    repoOwner: string;
    repoName: string;
}
export declare const GitHubFailures: React.FC<{
    failures: DetectedFailure[];
}>;
