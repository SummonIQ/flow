/**
 * Codebase RAG Indexing API Endpoint
 *
 * POST /api/projects/[name]/index-codebase - Index codebase files into RAG embeddings
 * GET /api/projects/[name]/index-codebase - Get codebase indexing status
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { createEmbeddingVector } from '@/lib/openai/embeddings';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import ignore from 'ignore';
import { isRagEnabled } from '@/lib/services/rag-embedding-service';

// File extensions to index
const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.rb', '.php',
  '.c', '.cpp', '.h', '.hpp', '.cs', '.swift', '.kt', '.scala', '.vue', '.svelte',
]);
const CONFIG_EXTENSIONS = new Set([
  '.json', '.yaml', '.yml', '.toml', '.xml', '.ini', '.cfg',
]);
const DOC_EXTENSIONS = new Set(['.md', '.mdx', '.txt', '.rst']);

// Files to always skip
const SKIP_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
  '.DS_Store', 'Thumbs.db', '.gitkeep',
]);

// Directories to always skip (in addition to .gitignore)
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', '.cache', 'coverage',
  '__pycache__', '.venv', 'venv', '.idea', '.vscode', 'target',
  '.turbo', '.vercel', '.netlify', '.output',
]);

// Size limits
const MAX_FILE_SIZE = 100 * 1024; // 100KB per file
const MAX_TOTAL_FILES = 500; // Max files to index at once

interface FileToIndex {
  path: string;
  relativePath: string;
  size: number;
  hash: string;
  category: 'code' | 'config' | 'doc';
}

interface IndexingResult {
  indexed: number;
  skipped: number;
  unchanged: number;
  errors: string[];
}

/**
 * Parse .gitignore file and return an ignore instance
 */
async function loadGitignore(projectPath: string): Promise<ReturnType<typeof ignore>> {
  const ig = ignore();

  try {
    const gitignorePath = path.join(projectPath, '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf-8');
    ig.add(content);
  } catch {
    // No .gitignore file, that's fine
  }

  return ig;
}

/**
 * Hash file content for change detection
 */
function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Get file category based on extension
 */
function getFileCategory(filename: string): 'code' | 'config' | 'doc' | null {
  const ext = path.extname(filename).toLowerCase();
  if (CODE_EXTENSIONS.has(ext)) return 'code';
  if (CONFIG_EXTENSIONS.has(ext)) return 'config';
  if (DOC_EXTENSIONS.has(ext)) return 'doc';
  if (filename.endsWith('.config.ts') || filename.endsWith('.config.js')) return 'config';
  return null;
}

/**
 * Walk directory and collect files to index
 */
async function collectFiles(
  dir: string,
  baseDir: string,
  gitignore: ReturnType<typeof ignore>,
): Promise<FileToIndex[]> {
  const files: FileToIndex[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      // Check gitignore
      if (gitignore.ignores(relativePath)) continue;

      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        const subFiles = await collectFiles(fullPath, baseDir, gitignore);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Skip known files
        if (SKIP_FILES.has(entry.name)) continue;

        // Get category
        const category = getFileCategory(entry.name);
        if (!category) continue;

        // Check file size
        const stats = await fs.stat(fullPath);
        if (stats.size > MAX_FILE_SIZE) continue;
        if (stats.size === 0) continue;

        // Read and hash content
        const content = await fs.readFile(fullPath, 'utf-8');
        const hash = hashContent(content);

        files.push({
          path: fullPath,
          relativePath,
          size: stats.size,
          hash,
          category,
        });
      }
    }
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error);
  }

  return files;
}

// POST - Index codebase files into RAG
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const body = await request.json().catch(() => ({}));
    const { dryRun = false, forceReindex = false } = body;

    // Check if RAG is enabled
    if (!isRagEnabled()) {
      return NextResponse.json(
        { error: 'RAG is not enabled. Set RAG_ENABLED=true in environment.' },
        { status: 400 },
      );
    }

    // Check OpenAI API key
    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { name },
      select: { id: true, path: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log(`[Codebase Index] Starting for ${project.name}...`);

    // Load gitignore
    const gitignore = await loadGitignore(project.path);

    // Collect files to index
    const files = await collectFiles(project.path, project.path, gitignore);

    // Limit number of files
    const filesToProcess = files.slice(0, MAX_TOTAL_FILES);

    console.log(`[Codebase Index] Found ${files.length} files, processing ${filesToProcess.length}`);

    if (dryRun) {
      // Return preview of what would be indexed
      const byCategory = {
        code: filesToProcess.filter(f => f.category === 'code').length,
        config: filesToProcess.filter(f => f.category === 'config').length,
        doc: filesToProcess.filter(f => f.category === 'doc').length,
      };

      return NextResponse.json({
        dryRun: true,
        totalFiles: files.length,
        filesToProcess: filesToProcess.length,
        byCategory,
        truncated: files.length > MAX_TOTAL_FILES,
        sampleFiles: filesToProcess.slice(0, 20).map(f => ({
          path: f.relativePath,
          category: f.category,
          size: f.size,
        })),
      });
    }

    // Get existing embeddings to check for unchanged files
    const existingEmbeddings = await prisma.$queryRaw<{ sourceId: string; contentHash: string }[]>`
      SELECT DISTINCT "sourceId", "contentHash"
      FROM embeddings
      WHERE "sourceType" = 'CODEBASE_FILE'::"EmbeddingSourceType"
      AND "projectId" = ${project.id}
    `;

    const existingHashes = new Map<string, string>();
    for (const emb of existingEmbeddings) {
      existingHashes.set(emb.sourceId, emb.contentHash);
    }

    const result: IndexingResult = {
      indexed: 0,
      skipped: 0,
      unchanged: 0,
      errors: [],
    };

    // Process files
    for (const file of filesToProcess) {
      try {
        const sourceId = `${project.id}:${file.relativePath}`;

        // Check if file is unchanged
        const existingHash = existingHashes.get(sourceId);
        if (!forceReindex && existingHash === file.hash) {
          result.unchanged++;
          continue;
        }

        // Read file content
        const content = await fs.readFile(file.path, 'utf-8');

        // Generate embedding
        let embedding: number[];
        try {
          embedding = await createEmbeddingVector(
            `# File: ${file.relativePath}\n\n\`\`\`${path.extname(file.relativePath).slice(1)}\n${content}\n\`\`\``,
          );
        } catch (error) {
          result.errors.push(
            `Failed to embed ${file.relativePath}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          continue;
        }
        const embeddingId = `emb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Delete existing embeddings for this file
        await prisma.$executeRaw`
          DELETE FROM embeddings
          WHERE "sourceType" = 'CODEBASE_FILE'::"EmbeddingSourceType"
          AND "sourceId" = ${sourceId}
        `;

        // Insert new embedding
        await prisma.$executeRaw`
          INSERT INTO embeddings (
            id, "sourceType", "sourceId", "chunkIndex",
            "contentText", "contentHash", embedding,
            "projectId", category, importance, metadata,
            "createdAt", "updatedAt"
          ) VALUES (
            ${embeddingId},
            'CODEBASE_FILE'::"EmbeddingSourceType",
            ${sourceId},
            0,
            ${content.slice(0, 2000)},
            ${file.hash},
            ${JSON.stringify(embedding)}::vector,
            ${project.id},
            ${file.category},
            ${file.category === 'config' ? 6 : 5},
            ${JSON.stringify({
              filePath: file.relativePath,
              filename: path.basename(file.relativePath),
              extension: path.extname(file.relativePath),
              size: file.size,
            })}::jsonb,
            NOW(),
            NOW()
          )
        `;

        result.indexed++;
      } catch (error) {
        result.errors.push(`Error indexing ${file.relativePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`[Codebase Index] Complete: ${result.indexed} indexed, ${result.unchanged} unchanged, ${result.skipped} skipped`);

    return NextResponse.json({
      success: true,
      result,
      totalFilesFound: files.length,
      truncated: files.length > MAX_TOTAL_FILES,
    });
  } catch (error) {
    console.error('[Codebase Index] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to index codebase',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// GET - Get codebase indexing status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    const project = await prisma.project.findUnique({
      where: { name },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get embedding stats for this project's codebase files
    const stats = await prisma.$queryRaw<{ count: string; category: string }[]>`
      SELECT COUNT(*) as count, category
      FROM embeddings
      WHERE "sourceType" = 'CODEBASE_FILE'::"EmbeddingSourceType"
      AND "projectId" = ${project.id}
      GROUP BY category
    `;

    const totalEmbeddings = await prisma.$queryRaw<{ count: string }[]>`
      SELECT COUNT(*) as count
      FROM embeddings
      WHERE "sourceType" = 'CODEBASE_FILE'::"EmbeddingSourceType"
      AND "projectId" = ${project.id}
    `;

    const lastUpdated = await prisma.$queryRaw<{ max: Date | null }[]>`
      SELECT MAX("updatedAt") as max
      FROM embeddings
      WHERE "sourceType" = 'CODEBASE_FILE'::"EmbeddingSourceType"
      AND "projectId" = ${project.id}
    `;

    return NextResponse.json({
      indexed: true,
      totalEmbeddings: parseInt(totalEmbeddings[0]?.count || '0', 10),
      byCategory: Object.fromEntries(
        stats.map(s => [s.category, parseInt(s.count, 10)]),
      ),
      lastUpdated: lastUpdated[0]?.max || null,
      ragEnabled: isRagEnabled(),
    });
  } catch (error) {
    console.error('[Codebase Index] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get indexing status' },
      { status: 500 },
    );
  }
}
