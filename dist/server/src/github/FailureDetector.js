export class FailureDetector {
    owner;
    repo;
    constructor(owner, repo) {
        this.owner = owner;
        this.repo = repo;
    }
    detect(issues, checkRuns) {
        const failures = [];
        for (const issue of issues) {
            // Check 1: Is this a PR with failed CI?
            if (issue.pull_request) {
                const runs = checkRuns.get(issue.number.toString()) || [];
                const failedRun = runs.find(r => r.conclusion === 'failure');
                if (failedRun) {
                    const errorHint = failedRun.output?.summary || failedRun.output?.title || 'Check the logs for details';
                    failures.push({
                        type: 'ci_failed',
                        issueNumber: issue.number,
                        title: issue.title,
                        description: `CI check "${failedRun.name}" failed: ${errorHint}`,
                        suggestedFix: this.getCIFixSteps(failedRun.name, errorHint),
                        severity: 'high',
                        htmlUrl: issue.html_url,
                        repoOwner: this.owner,
                        repoName: this.repo,
                    });
                }
            }
            // Check 2: Is the issue stale (no update for 7 days)?
            const daysSinceUpdate = this.getDaysSince(issue.updated_at);
            if (daysSinceUpdate > 7) {
                failures.push({
                    type: 'stale',
                    issueNumber: issue.number,
                    title: issue.title,
                    description: `No activity for ${daysSinceUpdate} days`,
                    suggestedFix: '1. Add a comment with current status\n2. If resolved, close the issue\n3. If blocked, mention the blocker and tag the right person',
                    severity: 'low',
                    htmlUrl: issue.html_url,
                    repoOwner: this.owner,
                    repoName: this.repo,
                });
            }
            // Check 3: Merge conflict label
            if (issue.labels.some(l => l.name.toLowerCase().includes('conflict') || l.name.toLowerCase().includes('merge conflict'))) {
                failures.push({
                    type: 'merge_conflict',
                    issueNumber: issue.number,
                    title: issue.title,
                    description: 'This PR has merge conflicts that need resolution',
                    suggestedFix: '1. Pull latest main branch: git pull origin main\n2. Resolve conflicts in your editor\n3. Commit and push the resolved changes',
                    severity: 'medium',
                    htmlUrl: issue.html_url,
                    repoOwner: this.owner,
                    repoName: this.repo,
                });
            }
            // Check 4: Review blocked (has review comments but no response)
            if (issue.pull_request && issue.comments > 0 && daysSinceUpdate > 3) {
                failures.push({
                    type: 'review_blocked',
                    issueNumber: issue.number,
                    title: issue.title,
                    description: `Has ${issue.comments} review comment(s) but no response for ${daysSinceUpdate} days`,
                    suggestedFix: '1. Read all review comments\n2. Address each suggestion\n3. Reply to each comment with what you changed\n4. Re-request review when done',
                    severity: 'medium',
                    htmlUrl: issue.html_url,
                    repoOwner: this.owner,
                    repoName: this.repo,
                });
            }
            // Check 5: Open issues with bug label (treat as failures)
            if (issue.labels.some(l => l.name.toLowerCase() === 'bug' || l.name.toLowerCase() === 'critical')) {
                failures.push({
                    type: 'test_failed',
                    issueNumber: issue.number,
                    title: issue.title,
                    description: `Open bug report: ${issue.body?.substring(0, 100) || 'No description'}`,
                    suggestedFix: '1. Read the bug description carefully\n2. Reproduce the issue locally\n3. Write a failing test that captures the bug\n4. Fix the code and verify the test passes\n5. Close the issue with a reference to the fix',
                    severity: 'high',
                    htmlUrl: issue.html_url,
                    repoOwner: this.owner,
                    repoName: this.repo,
                });
            }
        }
        return failures;
    }
    getCIFixSteps(checkName, errorHint) {
        const lower = checkName.toLowerCase();
        if (lower.includes('test') || lower.includes('jest') || lower.includes('vitest')) {
            return `1. Run tests locally: pnpm test\n2. Find failing test: ${errorHint}\n3. Fix the code or update the test\n4. Push the fix`;
        }
        if (lower.includes('lint') || lower.includes('eslint') || lower.includes('prettier')) {
            return `1. Run linter locally: pnpm lint\n2. Auto-fix: pnpm lint:fix\n3. Check remaining errors manually\n4. Push the fix`;
        }
        if (lower.includes('build') || lower.includes('typecheck') || lower.includes('tsc')) {
            return `1. Run build locally: pnpm build\n2. Check TypeScript errors: pnpm typecheck\n3. Fix type errors\n4. Push the fix`;
        }
        if (lower.includes('deploy') || lower.includes('docker')) {
            return `1. Check deployment logs by clicking "Details"\n2. Verify Dockerfile builds locally: docker build .\n3. Fix the config or code\n4. Push the fix`;
        }
        return `1. Click "Details" on the failed check\n2. Read the error: ${errorHint}\n3. Fix the error locally\n4. Push the fix`;
    }
    getDaysSince(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    }
}
