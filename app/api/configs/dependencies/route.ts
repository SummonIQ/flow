import { NextRequest, NextResponse } from 'next/server';
import { ConfigService } from '@/lib/config/service';

/**
 * GET /api/configs/dependencies - List all dependencies
 * GET /api/configs/dependencies?scope=xxx&appType=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const appType = searchParams.get('appType');
    const scope = searchParams.get('scope') || 'global';

    const dependencies = await ConfigService.getDependencies({
      scope: scope as any,
      appType: appType as any,
      projectId: projectId || undefined,
    });

    return NextResponse.json(dependencies);
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dependencies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/configs/dependencies - Create or update a dependency
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const dependency = await ConfigService.upsertDependency({
      packageName: data.packageName,
      version: data.version,
      scope: data.scope,
      type: data.type,
      appType: data.appType,
      projectId: data.projectId,
      appId: data.appId,
      description: data.description,
      isRequired: data.isRequired ?? true,
    });

    return NextResponse.json(dependency, { status: 201 });
  } catch (error) {
    console.error('Error creating dependency:', error);
    return NextResponse.json(
      { error: 'Failed to create dependency' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/configs/dependencies?id=xxx - Delete a dependency
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Dependency ID is required' },
        { status: 400 }
      );
    }

    await ConfigService.deleteDependency(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dependency:', error);
    return NextResponse.json(
      { error: 'Failed to delete dependency' },
      { status: 500 }
    );
  }
}
