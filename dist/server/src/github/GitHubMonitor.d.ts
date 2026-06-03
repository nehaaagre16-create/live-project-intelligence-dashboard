export interface GitHubIssue {
    number: number;
    title: string;
    state: string;
    created_at: string;
    updated_at: string;
    html_url: string;
    pull_request?: {
        url: string;
        html_url: string;
    };
    body?: string | null;
    labels: Array<{
        name: string;
        color: string;
    }>;
    user: {
        login: string;
        avatar_url: string;
    };
    comments: number;
}
export interface GitHubCheckRun {
    name: string;
    status: string;
    conclusion: string | null;
    html_url: string | null;
    output?: {
        title: string | null;
        summary: string | null;
        text: string | null;
    };
}
export declare class GitHubMonitor {
    private owner;
    private repo;
    private token;
    constructor(owner: string, repo: string, token: string);
    fetchIssues(): Promise<GitHubIssue[]>;
    fetchCheckRuns(sha: string): Promise<GitHubCheckRun[]>;
}
