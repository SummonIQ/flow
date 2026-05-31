/**
 * Environment Variable Analyzer
 * Scans codebase to detect which environment variables are actually being used
 */

import fs from 'fs/promises';
import path from 'path';

interface EnvUsage {
  variable: string;
  files: string[];
  count: number;
}

export class EnvAnalyzer {
  /**
   * Scan a directory for environment variable usage
   */
  static async scanDirectory(
    directory: string,
    options: {
      extensions?: string[];
      exclude?: string[];
    } = {}
  ): Promise<Map<string, EnvUsage>> {
    const {
      extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
      exclude = ['node_modules', 'dist', 'build', '.next', '.turbo'],
    } = options;

    const usage = new Map<string, EnvUsage>();
    await this.scanDirectoryRecursive(directory, directory, usage, extensions, exclude);
    return usage;
  }

  private static async scanDirectoryRecursive(
    baseDir: string,
    currentDir: string,
    usage: Map<string, EnvUsage>,
    extensions: string[],
    exclude: string[]
  ) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        // Skip excluded directories
        if (exclude.some(ex => relativePath.includes(ex))) {
          continue;
        }

        if (entry.isDirectory()) {
          await this.scanDirectoryRecursive(baseDir, fullPath, usage, extensions, exclude);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            await this.scanFile(fullPath, relativePath, usage);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn(`[EnvAnalyzer] Could not read directory: ${currentDir}`);
    }
  }

  private static async scanFile(
    filePath: string,
    relativePath: string,
    usage: Map<string, EnvUsage>
  ) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Patterns to match environment variable usage
      const patterns = [
        // process.env.VARIABLE_NAME
        /process\.env\.([A-Z_][A-Z0-9_]*)/g,
        // import.meta.env.VITE_VARIABLE_NAME
        /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
        // Bun.env.VARIABLE_NAME
        /Bun\.env\.([A-Z_][A-Z0-9_]*)/g,
        // Deno.env.get("VARIABLE_NAME")
        /Deno\.env\.get\(["']([A-Z_][A-Z0-9_]*)["']\)/g,
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const varName = match[1];
          
          if (!usage.has(varName)) {
            usage.set(varName, {
              variable: varName,
              files: [],
              count: 0,
            });
          }

          const envUsage = usage.get(varName)!;
          if (!envUsage.files.includes(relativePath)) {
            envUsage.files.push(relativePath);
          }
          envUsage.count++;
        }
      }
    } catch (error) {
      // Skip files we can't read
    }
  }

  /**
   * Analyze .env file and mark unused variables
   */
  static async analyzeEnvFile(
    envPath: string,
    projectPath: string
  ): Promise<{
    used: string[];
    unused: string[];
    commented: string[];
  }> {
    // Scan the project for usage
    const usage = await this.scanDirectory(projectPath);
    const usedVars = new Set(usage.keys());

    // Read the .env file
    const envContent = await fs.readFile(envPath, 'utf-8');
    const lines = envContent.split('\n');

    const used: string[] = [];
    const unused: string[] = [];
    const commented: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        if (trimmed.startsWith('#') && trimmed.includes('=')) {
          // Already commented variable
          const match = trimmed.match(/^#\s*([A-Z_][A-Z0-9_]*)=/);
          if (match) {
            commented.push(match[1]);
          }
        }
        continue;
      }

      // Extract variable name
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
      if (match) {
        const varName = match[1];
        if (usedVars.has(varName)) {
          used.push(varName);
        } else {
          unused.push(varName);
        }
      }
    }

    return { used, unused, commented };
  }

  /**
   * Update .env file to comment out unused variables
   */
  static async updateEnvFile(
    envPath: string,
    projectPath: string,
    options: {
      dryRun?: boolean;
      keepComments?: boolean;
    } = {}
  ): Promise<{
    commented: string[];
    uncommented: string[];
    unchanged: number;
  }> {
    const { dryRun = false, keepComments = true } = options;

    // Analyze usage
    const usage = await this.scanDirectory(projectPath);
    const usedVars = new Set(usage.keys());

    // Read the .env file
    const envContent = await fs.readFile(envPath, 'utf-8');
    const lines = envContent.split('\n');
    const newLines: string[] = [];
    const commented: string[] = [];
    const uncommented: string[] = [];
    let unchanged = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Handle empty lines and section comments
      if (!trimmed || (trimmed.startsWith('#') && !trimmed.includes('='))) {
        newLines.push(line);
        continue;
      }

      // Handle commented variables
      if (trimmed.startsWith('#') && trimmed.includes('=')) {
        const match = trimmed.match(/^#\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (match) {
          const varName = match[1];
          if (usedVars.has(varName)) {
            // Uncomment it - it's being used now
            newLines.push(`${varName}=${match[2]}`);
            uncommented.push(varName);
          } else {
            // Keep it commented
            newLines.push(line);
            unchanged++;
          }
        } else {
          newLines.push(line);
        }
        continue;
      }

      // Handle active variables
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const varName = match[1];
        const value = match[2];
        
        if (usedVars.has(varName)) {
          // Keep it active
          newLines.push(line);
          unchanged++;
        } else {
          // Comment it out with a note
          const usageInfo = usage.get(varName);
          const commentNote = keepComments 
            ? `# [Unused] ${varName}=${value}`
            : `# ${varName}=${value}`;
          newLines.push(commentNote);
          commented.push(varName);
        }
      } else {
        newLines.push(line);
      }
    }

    // Write back to file
    if (!dryRun) {
      await fs.writeFile(envPath, newLines.join('\n'), 'utf-8');
    }

    return {
      commented,
      uncommented,
      unchanged,
    };
  }

  /**
   * Generate usage report
   */
  static async generateReport(
    envPath: string,
    projectPath: string
  ): Promise<string> {
    const analysis = await this.analyzeEnvFile(envPath, projectPath);
    const usage = await this.scanDirectory(projectPath);

    let report = '# Environment Variable Usage Report\n\n';
    
    report += `## Summary\n`;
    report += `- **Used**: ${analysis.used.length} variables\n`;
    report += `- **Unused**: ${analysis.unused.length} variables\n`;
    report += `- **Commented**: ${analysis.commented.length} variables\n\n`;

    if (analysis.used.length > 0) {
      report += `## Used Variables (${analysis.used.length})\n\n`;
      for (const varName of analysis.used.sort()) {
        const info = usage.get(varName);
        if (info) {
          report += `### ${varName}\n`;
          report += `- Used ${info.count} time(s)\n`;
          report += `- Files:\n`;
          for (const file of info.files.slice(0, 5)) {
            report += `  - ${file}\n`;
          }
          if (info.files.length > 5) {
            report += `  - ... and ${info.files.length - 5} more\n`;
          }
          report += '\n';
        }
      }
    }

    if (analysis.unused.length > 0) {
      report += `## Unused Variables (${analysis.unused.length})\n\n`;
      report += 'These variables are defined but not referenced in the codebase:\n\n';
      for (const varName of analysis.unused.sort()) {
        report += `- ${varName}\n`;
      }
      report += '\n';
    }

    return report;
  }
}
