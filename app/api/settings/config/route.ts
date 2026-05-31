import { NextRequest, NextResponse } from 'next/server';
import {
  createProjectConfig,
  deleteProjectConfig,
  getProjectConfigs,
  updateProjectConfig,
} from '@/lib/settings-store';

export async function GET() {
  try {
    const configs = getProjectConfigs();
    return NextResponse.json(configs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch project configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, settings } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newConfig = createProjectConfig({
      name,
      description,
      settings: settings || {},
    });

    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updatedConfig = updateProjectConfig(id, updates);
    return NextResponse.json(updatedConfig);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update project configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    deleteProjectConfig(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete project configuration' },
      { status: 500 }
    );
  }
}
