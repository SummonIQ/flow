import { NextRequest, NextResponse } from 'next/server';
import { EnvAnalyzer } from '@/lib/env/analyzer';
import path from 'path';

/**
 * GET /api/configs/env/analyze?projectPath=xxx - Analyze env variable usage
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectPath = searchParams.get('projectPath');

    if (!projectPath) {
      return NextResponse.json(
        { error: 'projectPath is required' },
        { status: 400 }
      );
    }

    const envPath = path.join(projectPath, '.env');
    const analysis = await EnvAnalyzer.analyzeEnvFile(envPath, projectPath);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing env file:', error);
    return NextResponse.json(
      { error: 'Failed to analyze environment variables' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/configs/env/analyze - Update .env file to comment out unused variables
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { projectPath, dryRun = false } = data;

    if (!projectPath) {
      return NextResponse.json(
        { error: 'projectPath is required' },
        { status: 400 }
      );
    }

    const envPath = path.join(projectPath, '.env');
    const result = await EnvAnalyzer.updateEnvFile(envPath, projectPath, {
      dryRun,
      keepComments: true,
    });

    return NextResponse.json({
      success: true,
      ...result,
      message: dryRun
        ? 'Dry run completed - no changes made'
        : `Commented out ${result.commented.length} unused variables`,
    });
  } catch (error) {
    console.error('Error updating env file:', error);
    return NextResponse.json(
      { error: 'Failed to update environment file' },
      { status: 500 }
    );
  }
}
