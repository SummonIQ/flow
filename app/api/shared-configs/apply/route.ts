import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * POST /api/shared-configs/apply - Apply a shared configuration to a project or app
 * Body: {
 *   configId: string,
 *   projectPath: string,
 *   configType: 'windsurf-rules' | 'agents-md' | 'claude-md' | 'cursor-rules'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { configId, projectPath, content, configType } = await request.json();

    if (!configId || !projectPath || !content || !configType) {
      return NextResponse.json(
        { error: 'Missing required fields: configId, projectPath, content, and configType' },
        { status: 400 }
      );
    }

    // Determine the target filename based on config type
    const fileMap: Record<string, string> = {
      'windsurf-rules': '.windsurfrules',
      'cursor-rules': '.cursorrules',
      'agents-md': 'AGENTS.md',
      'claude-md': 'CLAUDE.md',
    };

    const filename = fileMap[configType];
    if (!filename) {
      return NextResponse.json(
        { error: 'Invalid configuration type' },
        { status: 400 }
      );
    }

    const targetPath = path.join(projectPath, filename);

    // Write the configuration file
    await fs.writeFile(targetPath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Configuration applied to ${targetPath}`,
      targetPath,
    });
  } catch (error) {
    console.error('Error applying shared config:', error);
    return NextResponse.json(
      { 
        error: 'Failed to apply configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shared-configs/apply?projectPath=xxx&configType=yyy - Check if config exists in project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('projectPath');
    const configType = searchParams.get('configType');

    if (!projectPath || !configType) {
      return NextResponse.json(
        { error: 'Missing required parameters: projectPath and configType' },
        { status: 400 }
      );
    }

    const fileMap: Record<string, string> = {
      'windsurf-rules': '.windsurfrules',
      'cursor-rules': '.cursorrules',
      'agents-md': 'AGENTS.md',
      'claude-md': 'CLAUDE.md',
    };

    const filename = fileMap[configType];
    if (!filename) {
      return NextResponse.json(
        { error: 'Invalid configuration type' },
        { status: 400 }
      );
    }

    const targetPath = path.join(projectPath, filename);

    try {
      const content = await fs.readFile(targetPath, 'utf-8');
      return NextResponse.json({
        exists: true,
        content,
        targetPath,
      });
    } catch (error) {
      // File doesn't exist
      return NextResponse.json({
        exists: false,
        targetPath,
      });
    }
  } catch (error) {
    console.error('Error checking config:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
