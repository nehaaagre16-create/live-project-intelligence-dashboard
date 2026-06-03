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
  labels: Array<{ name: string; color: string }>;
  user: { login: string; avatar_url: string };
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

export class GitHubMonitor {
  private owner: string;
  private repo: string;
  private token: string;

  constructor(owner: string, repo: string, token: string) {
    this.owner = owner;
    this.repo = repo;
    this.token = token;
  }

  async fetchIssues(): Promise<GitHubIssue[]> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/issues?state=open`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return response.json();
  }

  async fetchCheckRuns(sha: string): Promise<GitHubCheckRun[]> {
    const response = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/commits/${sha}/check-runs`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    const data = await response.json();
    return data.check_runs;
  }
}
