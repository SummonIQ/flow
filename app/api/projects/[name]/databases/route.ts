import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const createDatabaseSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['postgresql', 'mysql', 'sqlite']),
  host: z.string().default('localhost'),
  port: z.number().int().positive(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
});

interface RouteContext {
  params: Promise<{ name: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { name: projectName } = await context.params;

    const project = await prisma.project.findUnique({
      where: { name: projectName },
      include: {
        databases: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project.databases);
  } catch (error) {
    console.error('Error fetching databases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch databases' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { name: projectName } = await context.params;
    const body = await request.json();
    const validated = createDatabaseSchema.parse(body);

    const project = await prisma.project.findUnique({
      where: { name: projectName },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create Docker container for PostgreSQL
    const containerName = `${projectName}-${validated.name}`;
    const dockerCommand = `docker run -d \
      --name ${containerName} \
      -e POSTGRES_USER=${validated.username} \
      -e POSTGRES_PASSWORD=${validated.password} \
      -e POSTGRES_DB=${validated.database} \
      -p ${validated.port}:5432 \
      postgres:16-alpine`;

    try {
      await execAsync(dockerCommand);
    } catch (dockerError) {
      console.error('Docker error:', dockerError);
      return NextResponse.json(
        { error: 'Failed to create database container' },
        { status: 500 }
      );
    }

    // Save database config to DB
    const database = await prisma.database.create({
      data: {
        name: validated.name,
        type: validated.type,
        host: validated.host,
        port: validated.port,
        username: validated.username,
        password: validated.password,
        database: validated.database,
        status: 'running',
        projectId: project.id,
        connectionString: `postgresql://${validated.username}:${validated.password}@${validated.host}:${validated.port}/${validated.database}`,
        containerName,
      },
    });

    return NextResponse.json(database, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating database:', error);
    return NextResponse.json(
      { error: 'Failed to create database' },
      { status: 500 }
    );
  }
}
