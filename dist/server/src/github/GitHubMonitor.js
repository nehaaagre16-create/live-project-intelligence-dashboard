export class GitHubMonitor {
    owner;
    repo;
    token;
    constructor(owner, repo, token) {
        this.owner = owner;
        this.repo = repo;
        this.token = token;
    }
    async fetchIssues() {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/issues?state=open`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        return response.json();
    }
    async fetchCheckRuns(sha) {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/commits/${sha}/check-runs`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        const data = await response.json();
        return data.check_runs;
    }
}
