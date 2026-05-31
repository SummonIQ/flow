import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RouteContext {
  params: Promise<{ name: string; id: string }>;
}

export async function DELETE(
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

    // Stop and remove Docker container
    if (database.containerName) {
      try {
        await execAsync(`docker stop ${database.containerName}`);
        await execAsync(`docker rm ${database.containerName}`);
      } catch (dockerError) {
        console.error('Docker cleanup error:', dockerError);
      }
    }

    await prisma.database.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting database:', error);
    return NextResponse.json(
      { error: 'Failed to delete database' },
      { status: 500 }
    );
  }
}
