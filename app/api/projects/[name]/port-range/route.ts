import { prisma } from '@/lib/db/prisma';
import {
  getNextAvailablePortForProject,
  getProjectPortRange,
} from '@/lib/port-manager';
import { AppType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

type PortableAppType = 'WEB_APP' | 'DESKTOP_APP' | 'MOBILE_APP';

function isPortableAppType(type: AppType): type is PortableAppType {
  return type === 'WEB_APP' || type === 'DESKTOP_APP' || type === 'MOBILE_APP';
}

function pickPortableType(apps: Array<{ type: AppType }>): PortableAppType {
  const hasWeb = apps.some(a => a.type === 'WEB_APP');
  if (hasWeb) return 'WEB_APP';
  const hasDesktop = apps.some(a => a.type === 'DESKTOP_APP');
  if (hasDesktop) return 'DESKTOP_APP';
  const hasMobile = apps.some(a => a.type === 'MOBILE_APP');
  if (hasMobile) return 'MOBILE_APP';
  return 'WEB_APP';
}

function toAppType(value: unknown): AppType | null {
  if (typeof value !== 'string') return null;

  const typeMap: Record<string, AppType> = {
    'web-app': 'WEB_APP',
    'desktop-app': 'DESKTOP_APP',
    'mobile-app': 'MOBILE_APP',
    api: 'API',
    'marketing-site': 'MARKETING_SITE',
    library: 'LIBRARY',
    monorepo: 'MONOREPO',
    cli: 'CLI',
    extension: 'EXTENSION',
    docs: 'CUSTOM',
    custom: 'CUSTOM',
  };

  const normalized = value.trim();
  return typeMap[normalized] ?? typeMap[normalized.toLowerCase()] ?? null;
}

async function ensureProjectPortRange(projectId: string) {
  const apps = await prisma.app.findMany({
    where: { projectId },
    select: { id: true, type: true, devPort: true, createdAt: true },
  });

  const portableApps = apps.filter(a => isPortableAppType(a.type));
  const targetType: PortableAppType =
    portableApps.length > 0 ? pickPortableType(portableApps) : 'WEB_APP';

  // This reserves the 10-port block on the project (if needed)
  await getNextAvailablePortForProject(projectId, targetType);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { port: true },
  });

  const basePort = typeof project?.port === 'number' ? project.port : null;
  if (basePort === null) {
    return {
      updatedApps: 0,
      targetType,
      minPort: null as number | null,
      maxPort: null as number | null,
    };
  }

  const minPort = basePort;
  const maxPort = basePort + 9;

  const runnableTypes = new Set<AppType>([
    'WEB_APP',
    'DESKTOP_APP',
    'MOBILE_APP',
    'API',
    'MARKETING_SITE',
  ]);

  const runnableApps = apps.filter(a => runnableTypes.has(a.type));

  const usedPorts = new Set(
    runnableApps
      .filter(
        a =>
          typeof a.devPort === 'number' &&
          a.devPort >= minPort &&
          a.devPort <= maxPort,
      )
      .map(a => a.devPort as number),
  );

  const appsToFix = runnableApps
    .filter(
      a =>
        typeof a.devPort !== 'number' ||
        a.devPort < minPort ||
        a.devPort > maxPort,
    )
    .sort((a, b) => {
      const aTime = a.createdAt.getTime();
      const bTime = b.createdAt.getTime();
      return aTime !== bTime ? aTime - bTime : a.id.localeCompare(b.id);
    });

  let updatedApps = 0;
  for (const app of appsToFix) {
    let nextPort: number | null = null;
    for (let port = minPort; port <= maxPort; port++) {
      if (!usedPorts.has(port)) {
        nextPort = port;
        break;
      }
    }

    if (nextPort === null) break;

    await prisma.app.update({
      where: { id: app.id },
      data: { devPort: nextPort },
    });

    usedPorts.add(nextPort);
    updatedApps += 1;
  }

  return { updatedApps, targetType, minPort, maxPort };
}

// GET - Retrieve port range information for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;

    console.log('[API] Getting port range for project:', projectName);

    // Upsert project - create if doesn't exist
    const project = await prisma.project.upsert({
      where: { name: projectName },
      update: {},
      create: {
        name: projectName,
        path: `/Users/steven/Projects/${projectName}`,
        description: '',
        packageManager: 'bun',
      },
      select: { id: true, port: true },
    });

    // If project has no port assigned, assign one
    if (project.port === null) {
      await getNextAvailablePortForProject(project.id, 'WEB_APP');
    }

    // Get port range information
    const portInfo = await getProjectPortRange(project.id);

    return NextResponse.json(portInfo);
  } catch (error) {
    console.error('[API] Error getting port range:', error);
    return NextResponse.json(
      {
        error: 'Failed to get port range',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// POST - Reserve a 10-port block and backfill app devPorts into the reserved range
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;

    const body = (await request.json().catch(() => null)) as {
      path?: string;
      description?: string;
      apps?: Array<{
        name: string;
        type?: string;
        path?: string;
        description?: string;
        devPort?: number;
      }>;
    } | null;

    const projectPath = typeof body?.path === 'string' ? body.path : null;
    const projectDescription =
      typeof body?.description === 'string' ? body.description : null;

    const project = await prisma.project.upsert({
      where: { name: projectName },
      update: {
        ...(projectPath ? { path: projectPath } : null),
        ...(projectDescription !== null
          ? { description: projectDescription }
          : null),
      },
      create: {
        name: projectName,
        path: projectPath ?? `/Users/steven/Projects/${projectName}`,
        description: projectDescription ?? '',
        packageManager: 'bun',
      },
      select: { id: true },
    });

    if (Array.isArray(body?.apps) && body.apps.length > 0) {
      const upserts = body.apps
        .filter(a => typeof a?.name === 'string' && a.name.trim().length > 0)
        .map(app => {
          const typeEnum = toAppType(app.type) ?? 'WEB_APP';

          return prisma.app.upsert({
            where: {
              projectId_name: {
                projectId: project.id,
                name: app.name,
              },
            },
            update: {
              description: app.description ?? '',
              type: typeEnum,
              path: app.path ?? `apps/${app.name}`,
              devPort: typeof app.devPort === 'number' ? app.devPort : null,
            },
            create: {
              projectId: project.id,
              name: app.name,
              description: app.description ?? '',
              type: typeEnum,
              path: app.path ?? `apps/${app.name}`,
              devPort: typeof app.devPort === 'number' ? app.devPort : null,
              autoOpen: false,
            },
            select: { id: true },
          });
        });

      await Promise.all(upserts);
    }

    const ensured = await ensureProjectPortRange(project.id);
    const portInfo = await getProjectPortRange(project.id);

    const updatedApps = await prisma.app.findMany({
      where: { projectId: project.id },
      select: { name: true, devPort: true, type: true, path: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      ...portInfo,
      ensured,
      apps: updatedApps,
    });
  } catch (error) {
    console.error('[API] Error ensuring port range:', error);
    return NextResponse.json(
      {
        error: 'Failed to ensure port range',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
