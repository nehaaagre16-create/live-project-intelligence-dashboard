import type { GitHubIssue, GitHubCheckRun } from './GitHubMonitor.js';
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
export declare class FailureDetector {
    private owner;
    private repo;
    constructor(owner: string, repo: string);
    detect(issues: GitHubIssue[], checkRuns: Map<string, GitHubCheckRun[]>): DetectedFailure[];
    private getCIFixSteps;
    private getDaysSince;
}
