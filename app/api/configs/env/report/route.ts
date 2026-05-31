import { NextRequest, NextResponse } from 'next/server';
import { EnvAnalyzer } from '@/lib/env/analyzer';
import path from 'path';

/**
 * GET /api/configs/env/report?projectPath=xxx - Generate usage report
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
    const report = await EnvAnalyzer.generateReport(envPath, projectPath);

    return new NextResponse(report, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="env-usage-report.md"',
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
