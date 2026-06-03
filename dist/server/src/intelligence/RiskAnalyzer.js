import * as fs from 'fs/promises';
import * as path from 'path';
export class RiskAnalyzer {
    projectRoot;
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async analyze() {
        const risks = [];
        const events = [];
        // Scan for API routes and handlers
        const apiFiles = await this.findApiFiles();
        for (const file of apiFiles) {
            const risk = await this.assessFileRisk(file);
            risks.push(risk);
            if (risk.riskScore > 70) {
                events.push({
                    id: `risk-${file}`,
                    type: 'warning',
                    message: `High risk detected in ${path.basename(file)}`,
                    timestamp: new Date(),
                    metadata: {
                        file,
                        riskScore: risk.riskScore,
                        errorRate: risk.errorRate,
                    },
                });
            }
        }
        // Sort by risk score
        risks.sort((a, b) => b.riskScore - a.riskScore);
        return { risks, events };
    }
    async findApiFiles() {
        const files = [];
        // Walk directories manually to avoid glob issues
        const scanDirs = ['routes', 'api', 'controllers', 'handlers', 'endpoints'];
        for (const dir of scanDirs) {
            try {
                const fullPath = path.join(this.projectRoot, dir);
                const entries = await fs.readdir(fullPath, { recursive: true });
                for (const entry of entries) {
                    const entryPath = path.join(fullPath, entry);
                    const stat = await fs.stat(entryPath);
                    if (stat.isFile() && entryPath.endsWith('.ts')) {
                        files.push(entryPath);
                    }
                }
            }
            catch {
                // Directory doesn't exist, skip
            }
        }
        return files;
    }
    async assessFileRisk(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n').length;
            // Calculate risk factors
            const errorHandling = (content.match(/catch\s*\(/g) || []).length;
            const asyncOps = (content.match(/await\s+/g) || []).length;
            const dbQueries = (content.match(/(query|execute|find|select|insert|update|delete)/gi) || []).length;
            const externalCalls = (content.match(/(fetch|axios|http|request)/gi) || []).length;
            const authChecks = (content.match(/(auth|verify|check|validate)/gi) || []).length;
            // Risk scoring (0-100)
            let riskScore = 0;
            // Large files are riskier
            if (lines > 300)
                riskScore += 15;
            else if (lines > 200)
                riskScore += 10;
            else if (lines > 100)
                riskScore += 5;
            // Many async operations without error handling
            const asyncRisk = asyncOps > 0 ? (1 - errorHandling / asyncOps) * 20 : 0;
            riskScore += asyncRisk;
            // Database operations without auth checks
            if (dbQueries > 0 && authChecks === 0)
                riskScore += 15;
            // External API calls
            riskScore += Math.min(externalCalls * 2, 15);
            // Complex control flow
            const conditionals = (content.match(/\b(if|switch|try)\b/g) || []).length;
            riskScore += Math.min(conditionals * 0.5, 10);
            // Cap at 100
            riskScore = Math.min(riskScore, 100);
            return {
                path: path.relative(this.projectRoot, filePath),
                riskScore: Math.round(riskScore),
                errorRate: Math.random() * 10, // Placeholder - would come from logs
                avgResponseTime: Math.random() * 500 + 50, // Placeholder
                failureCount: Math.floor(Math.random() * 20), // Placeholder
                lastFailure: riskScore > 50 ? new Date() : null,
            };
        }
        catch {
            return {
                path: path.relative(this.projectRoot, filePath),
                riskScore: 0,
                errorRate: 0,
                avgResponseTime: 0,
                failureCount: 0,
                lastFailure: null,
            };
        }
    }
}
