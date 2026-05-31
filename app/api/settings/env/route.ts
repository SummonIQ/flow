import { NextRequest, NextResponse } from 'next/server';
import {
  createEnvVariable,
  deleteEnvVariable,
  getEnvVariables,
  updateEnvVariable,
} from '@/lib/settings-store';

export async function GET() {
  try {
    const envVariables = getEnvVariables();
    return NextResponse.json(envVariables);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch environment variables' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description, isSecret } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const newVar = createEnvVariable({
      key,
      value,
      description,
      isSecret: isSecret || false,
    });

    return NextResponse.json(newVar, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create environment variable' },
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

    const updatedVar = updateEnvVariable(id, updates);
    return NextResponse.json(updatedVar);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update environment variable' },
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

    deleteEnvVariable(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete environment variable' },
      { status: 500 }
    );
  }
}
