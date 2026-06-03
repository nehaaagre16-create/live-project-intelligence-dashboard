import simpleGit from 'simple-git';
export class GitAnalyzer {
    git;
    constructor(projectRoot) {
        this.git = simpleGit(projectRoot);
    }
    async analyze() {
        try {
            const log = await this.git.log({ maxCount: 100 });
            const developerMap = new Map();
            const events = [];
            for (const commit of log.all) {
                const email = commit.author_email;
                const name = commit.author_name;
                const key = email;
                if (!developerMap.has(key)) {
                    developerMap.set(key, {
                        name,
                        email,
                        commits: 0,
                        filesTouched: 0,
                        lastCommit: new Date(commit.date),
                    });
                }
                const dev = developerMap.get(key);
                dev.commits++;
                dev.lastCommit = new Date(commit.date);
                // Try to get files changed in this commit
                try {
                    const diff = await this.git.show([commit.hash, '--stat', '--format=']);
                    const files = diff.split('\n')
                        .filter(line => line.includes('|'))
                        .length;
                    dev.filesTouched += files;
                }
                catch {
                    // Skip if we can't get diff
                }
                events.push({
                    id: commit.hash,
                    type: 'commit',
                    message: commit.message,
                    timestamp: new Date(commit.date),
                    metadata: {
                        author: name,
                        email,
                    },
                });
            }
            // Sort by commits to find bottlenecks (bus factor)
            const developers = Array.from(developerMap.values())
                .sort((a, b) => b.commits - a.commits);
            return { developers, events };
        }
        catch {
            // If not a git repo or error, return empty
            return { developers: [], events: [] };
        }
    }
    async getFileChurn(filePath, days = 30) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const log = await this.git.log({
                file: filePath,
                since: since.toISOString(),
            });
            return log.total;
        }
        catch {
            return 0;
        }
    }
}
