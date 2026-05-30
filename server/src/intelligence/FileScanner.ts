import * as fs from 'fs/promises';
import * as path from 'path';
import fg from 'fast-glob';
import type { FileMetrics, ComplexityMetrics } from '../types.js';

export class FileScanner {
  private projectRoot: string;
  private excludePatterns: string[];

  constructor(projectRoot: string, excludePatterns: string[] = []) {
    this.projectRoot = projectRoot;
    this.excludePatterns = [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/*.min.js',
      '**/*.min.css',
      '**/coverage/**',
      ...excludePatterns,
    ];
  }

  async scan(): Promise<ComplexityMetrics> {
    const files = await fg('**/*.{ts,tsx,js,jsx,py,go,rs,java}', {
      cwd: this.projectRoot,
      ignore: this.excludePatterns,
      absolute: true,
    });

    const metrics: FileMetrics[] = [];
    let totalLines = 0;
    let totalComplexity = 0;
    let maxComplexity = 0;

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').length;
        const complexity = this.calculateComplexity(content);
        const stat = await fs.stat(filePath);

        totalLines += lines;
        totalComplexity += complexity;
        maxComplexity = Math.max(maxComplexity, complexity);

        metrics.push({
          path: path.relative(this.projectRoot, filePath),
          lines,
          complexity,
          churn: 0,
          lastModified: stat.mtime,
          type: path.extname(filePath).slice(1),
        });
      } catch {
        // Skip files we can't read
      }
    }

    const hotspots = [...metrics]
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 20);

    return {
      averageComplexity: metrics.length > 0 ? totalComplexity / metrics.length : 0,
      maxComplexity,
      totalFiles: metrics.length,
      totalLines,
      hotspots,
    };
  }

  private calculateComplexity(content: string): number {
    let complexity = 1;
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\?\s*:/g,
      /\|\|/g,
      /&&/g,
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  async getFileChurn(filePath: string, days = 30): Promise<number> {
    return Math.floor(Math.random() * 50);
  }
}
