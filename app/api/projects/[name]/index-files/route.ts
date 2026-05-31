import { prisma } from '@/lib/db/prisma';
import { migrateKnowledgeProjectId } from '@/lib/knowledge/project-identity';
import { migrateKnowledgeStatuses } from '@/lib/knowledge/status';
import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_SUMMARY_MODEL_DEFAULT } from '@/lib/openai/config';
import { memoryService } from '@/lib/services/memory-service';
import { ragEmbeddingService } from '@/lib/services/rag-embedding-service';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// File extensions to index
const CODE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.rb',
  '.php',
];
const CONFIG_EXTENSIONS = [
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.env',
  '.config.ts',
  '.config.js',
];
const DOC_EXTENSIONS = ['.md', '.mdx', '.txt', '.rst'];

// Directories to skip
const SKIP_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.cache',
  'coverage',
  '__pycache__',
];

interface FileInfo {
  path: string;
  relativePath: string;
  extension: string;
  size: number;
  type: 'code' | 'config' | 'doc' | 'other';
}

interface IndexResult {
  totalFiles: number;
  codeFiles: FileInfo[];
  configFiles: FileInfo[];
  docFiles: FileInfo[];
  structure: Record<string, string[]>;
}

async function walkDirectory(
  dir: string,
  baseDir: string,
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
          const subFiles = await walkDirectory(fullPath, baseDir);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const stats = await fs.stat(fullPath);

        // Skip large files (> 500KB)
        if (stats.size > 500 * 1024) continue;

        let type: FileInfo['type'] = 'other';
        if (CODE_EXTENSIONS.some(e => entry.name.endsWith(e))) {
          type = 'code';
        } else if (CONFIG_EXTENSIONS.some(e => entry.name.endsWith(e))) {
          type = 'config';
        } else if (DOC_EXTENSIONS.some(e => entry.name.endsWith(e))) {
          type = 'doc';
        }

        files.push({
          path: fullPath,
          relativePath,
          extension: ext,
          size: stats.size,
          type,
        });
      }
    }
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error);
  }

  return files;
}

function buildStructure(files: FileInfo[]): Record<string, string[]> {
  const structure: Record<string, string[]> = {};

  for (const file of files) {
    const dir = path.dirname(file.relativePath);
    if (!structure[dir]) {
      structure[dir] = [];
    }
    structure[dir].push(path.basename(file.relativePath));
  }

  return structure;
}

// POST - Index project files and generate documentation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    const project = await prisma.project.findUnique({
      where: { name },
      select: { id: true, path: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const openai = getOpenAIClient();

    await migrateKnowledgeProjectId(project);
    await migrateKnowledgeStatuses(project.id);

    // Index all files
    console.log(`[Index] Starting file indexing for ${project.name}...`);
    const allFiles = await walkDirectory(project.path, project.path);

    const codeFiles = allFiles.filter(f => f.type === 'code');
    const configFiles = allFiles.filter(f => f.type === 'config');
    const docFiles = allFiles.filter(f => f.type === 'doc');

    const indexResult: IndexResult = {
      totalFiles: allFiles.length,
      codeFiles,
      configFiles,
      docFiles,
      structure: buildStructure(allFiles),
    };

    console.log(
      `[Index] Found ${codeFiles.length} code files, ${configFiles.length} config files, ${docFiles.length} doc files`,
    );

    // Read key files for AI analysis
    const keyFiles: { path: string; content: string }[] = [];

    // Read package.json
    try {
      const pkgPath = path.join(project.path, 'package.json');
      const content = await fs.readFile(pkgPath, 'utf-8');
      keyFiles.push({ path: 'package.json', content });
    } catch {}

    // Read README
    try {
      const readmePath = path.join(project.path, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');
      keyFiles.push({ path: 'README.md', content: content.slice(0, 3000) });
    } catch {}

    // Read applab.config.ts
    try {
      const configPath = path.join(project.path, 'applab.config.ts');
      const content = await fs.readFile(configPath, 'utf-8');
      keyFiles.push({ path: 'applab.config.ts', content });
    } catch {}

    // Read a sample of important code files (entry points, main files)
    const importantPatterns = [
      'index.ts',
      'index.tsx',
      'main.ts',
      'app.ts',
      'server.ts',
      'layout.tsx',
      'page.tsx',
    ];
    for (const file of codeFiles.slice(0, 20)) {
      if (importantPatterns.some(p => file.relativePath.endsWith(p))) {
        try {
          const content = await fs.readFile(file.path, 'utf-8');
          keyFiles.push({
            path: file.relativePath,
            content: content.slice(0, 2000),
          });
        } catch {}
      }
    }

    // Generate AI documentation
    console.log(`[Index] Generating AI documentation...`);

    const structureStr = Object.entries(indexResult.structure)
      .slice(0, 30)
      .map(
        ([dir, files]) =>
          `${dir}/: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`,
      )
      .join('\n');

    const filesContext = keyFiles
      .map(f => `--- ${f.path} ---\n${f.content}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: OPENAI_SUMMARY_MODEL_DEFAULT,
      messages: [
        {
          role: 'system',
          content: `You are a senior software architect analyzing a codebase. Generate comprehensive documentation based on the project files.

OUTPUT FORMAT (use exactly this structure):

# Project Overview
[2-3 paragraphs describing what this project is, its purpose, and main functionality]

# Architecture
[Describe the overall architecture, patterns used, and how components interact]

# Tech Stack
- **Frontend**: [list technologies]
- **Backend**: [list technologies]
- **Database**: [if applicable]
- **Infrastructure**: [if applicable]

# Directory Structure
[Explain the key directories and their purposes]

# Key Components
[List and briefly describe the main components/modules]

# API Endpoints
[If applicable, list main API routes discovered]

# Configuration
[Describe key configuration files and their purposes]

# Getting Started
[Based on package.json scripts, explain how to run the project]

# Important Notes
[Any important patterns, conventions, or gotchas discovered]

Be specific and reference actual file names and paths from the codebase.`,
        },
        {
          role: 'user',
          content: `Analyze this project and generate documentation:

PROJECT: ${project.name}

DIRECTORY STRUCTURE:
${structureStr}

KEY FILES:
${filesContext}

CODE FILES (${codeFiles.length} total):
${codeFiles
  .slice(0, 50)
  .map(f => f.relativePath)
  .join('\n')}

CONFIG FILES:
${configFiles.map(f => f.relativePath).join('\n')}`,
        },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    });

    const documentation = response.choices[0]?.message?.content || '';

    // Create memories from the analysis
    console.log(`[Index] Creating memories from analysis...`);

    // Extract and store key insights as memories
    const memories: Promise<any>[] = [];

    // Memory for project structure
    memories.push(
      memoryService.create({
        projectId: project.id,
        title: 'Project Structure Overview',
        content: `Project has ${codeFiles.length} code files, ${configFiles.length} config files, and ${docFiles.length} documentation files.\n\nKey directories: ${Object.keys(indexResult.structure).slice(0, 10).join(', ')}`,
        category: 'CODEBASE',
        source: 'file-indexing',
        importance: 7,
        tags: ['structure', 'overview', 'auto-generated'],
      }),
    );

    // Memory for tech stack (parse from package.json)
    const pkgFile = keyFiles.find(f => f.path === 'package.json');
    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        const deps = Object.keys(pkg.dependencies || {}).slice(0, 15);
        const devDeps = Object.keys(pkg.devDependencies || {}).slice(0, 10);

        memories.push(
          memoryService.create({
            projectId: project.id,
            title: 'Dependencies Overview',
            content: `Main dependencies: ${deps.join(', ')}\n\nDev dependencies: ${devDeps.join(', ')}`,
            category: 'DEPENDENCIES',
            source: 'package.json',
            importance: 6,
            tags: ['dependencies', 'tech-stack', 'auto-generated'],
          }),
        );
      } catch {}
    }

    // Memory for configuration files
    if (configFiles.length > 0) {
      memories.push(
        memoryService.create({
          projectId: project.id,
          title: 'Configuration Files',
          content: `Project configuration files:\n${configFiles.map(f => `- ${f.relativePath}`).join('\n')}`,
          category: 'CONFIGURATION',
          source: 'file-indexing',
          importance: 5,
          tags: ['config', 'files', 'auto-generated'],
        }),
      );
    }

    await Promise.all(memories);

    // Save documentation to knowledge base
    const existingDoc = await prisma.knowledgeDocument.findFirst({
      where: {
        projectId: project.id,
        title: 'AI-Generated Project Documentation',
      },
    });

    if (existingDoc) {
      await prisma.knowledgeDocument.update({
        where: { id: existingDoc.id },
        data: {
          content: documentation,
          updatedAt: new Date(),
        },
      });

      await ragEmbeddingService.onUpdated('KnowledgeDocument', existingDoc.id, [
        'content',
      ]);
    } else {
      const doc = await prisma.knowledgeDocument.create({
        data: {
          projectId: project.id,
          title: 'AI-Generated Project Documentation',
          content: documentation,
          type: 'article',
          category: 'Overview',
          tags: ['auto-generated', 'ai', 'documentation'],
          status: 'published',
        },
      });

      await ragEmbeddingService.onCreated('KnowledgeDocument', doc.id);
    }

    console.log(`[Index] Documentation generated and saved`);

    return NextResponse.json({
      success: true,
      index: {
        totalFiles: indexResult.totalFiles,
        codeFiles: codeFiles.length,
        configFiles: configFiles.length,
        docFiles: docFiles.length,
      },
      documentation: documentation.slice(0, 500) + '...',
      memoriesCreated: memories.length,
    });
  } catch (error) {
    console.error('[Index] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to index project',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// GET - Get index status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    const project = await prisma.project.findUnique({
      where: { name },
      select: { id: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await migrateKnowledgeProjectId(project);
    await migrateKnowledgeStatuses(project.id);

    // Check if we have generated documentation
    const doc = await prisma.knowledgeDocument.findFirst({
      where: {
        projectId: project.id,
        title: 'AI-Generated Project Documentation',
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const memoriesCount = await prisma.projectMemory.count({
      where: { projectId: project.id },
    });

    return NextResponse.json({
      hasDocumentation: !!doc,
      lastIndexed: doc?.updatedAt || null,
      memoriesCount,
    });
  } catch (error) {
    console.error('[Index] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get index status' },
      { status: 500 },
    );
  }
}
