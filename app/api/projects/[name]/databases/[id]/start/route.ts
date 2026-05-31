import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RouteContext {
  params: Promise<{ name: string; id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const database = await prisma.database.findUnique({
      where: { id },
    });

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    if (database.status === 'running') {
      return NextResponse.json(
        { error: 'Database is already running' },
        { status: 400 }
      );
    }

    // Start Docker container
    if (database.containerName) {
      try {
        await execAsync(`docker start ${database.containerName}`);
      } catch (dockerError) {
        console.error('Docker start error:', dockerError);
        return NextResponse.json(
          { error: 'Failed to start database container' },
          { status: 500 }
        );
      }
    }

    const updated = await prisma.database.update({
      where: { id },
      data: { status: 'running' },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error starting database:', error);
    return NextResponse.json(
      { error: 'Failed to start database' },
      { status: 500 }
    );
  }
}
