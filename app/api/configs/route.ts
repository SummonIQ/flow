import { NextRequest, NextResponse } from 'next/server';
import { ConfigService } from '@/lib/config/service';

/**
 * GET /api/configs - List all configs
 * GET /api/configs?projectId=xxx - Get project configs
 * GET /api/configs?appId=xxx - Get app configs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const appId = searchParams.get('appId');
    const configType = searchParams.get('type');

    if (appId) {
      const configs = await ConfigService.getAppConfigs(
        appId,
        configType as any
      );
      return NextResponse.json(configs);
    } else if (projectId) {
      const configs = await ConfigService.getProjectConfigs(
        projectId,
        configType as any
      );
      return NextResponse.json(configs);
    } else {
      // Return empty array if no filter specified
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/configs - Upsert a project or app config
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.appId) {
      const config = await ConfigService.upsertAppConfig({
        appId: data.appId,
        projectId: data.projectId,
        appType: data.appType,
        configType: data.configType,
        templateId: data.templateId,
        content: data.content,
      });
      return NextResponse.json(config, { status: 201 });
    } else if (data.projectId) {
      const config = await ConfigService.upsertProjectConfig({
        projectId: data.projectId,
        configType: data.configType,
        templateId: data.templateId,
        content: data.content,
      });
      return NextResponse.json(config, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Either projectId or appId is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating config:', error);
    return NextResponse.json(
      { error: 'Failed to create config' },
      { status: 500 }
    );
  }
}
