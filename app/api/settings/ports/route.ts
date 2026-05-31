import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

// Port range definitions
const PORT_RANGES = {
  WEB_APP: { start: 10000, end: 19999, label: 'Web Apps', increment: 10 },
  DESKTOP_APP: {
    start: 20000,
    end: 29999,
    label: 'Desktop Apps',
    increment: 10,
  },
  MOBILE_APP: { start: 30000, end: 39999, label: 'Mobile Apps', increment: 10 },
} as const;

const PROJECT_PORT_BLOCK_SIZE = 10;

function pickPortRangeForValue(port: number) {
  for (const range of Object.values(PORT_RANGES)) {
    if (port >= range.start && port <= range.end) return range;
  }
  return null;
}

function toBlockBase(
  port: number,
  range: { start: number; increment: number },
) {
  const offset = port - range.start;
  const blocks = Math.floor(offset / range.increment);
  return range.start + blocks * range.increment;
}

// Port configurations - source of truth for port assignments
const PORT_CONFIGS = [
  { name: 'AgencyBase', devPort: 10000, dbPort: 10005, studioPort: 10006 },
  { name: 'AgentSuite', devPort: 10010, dbPort: 10015, studioPort: 10016 },
  { name: 'SummonIQ', devPort: 10020, dbPort: 10025, studioPort: 10026 },
  {
    name: 'Bright and Early',
    devPort: 10030,
    dbPort: 10035,
    studioPort: 10036,
  },
  { name: 'BudgetBloom', devPort: 10040, dbPort: 10045, studioPort: 10046 },
  { name: 'Chatterworks', devPort: 10050, dbPort: null, studioPort: null },
  { name: 'Gimme Job', devPort: 10060, dbPort: 10065, studioPort: 10066 },
  { name: 'GrabbaTime', devPort: 10070, dbPort: 10075, studioPort: 10076 },
  { name: 'Plavement', devPort: 10080, dbPort: 10085, studioPort: 10086 },
  { name: 'SignalSplash', devPort: 10090, dbPort: 10095, studioPort: 10096 },
  { name: 'Summonate', devPort: 10100, dbPort: 10105, studioPort: 10106 },
  {
    name: 'Tech Lead Toolkit',
    devPort: 10110,
    dbPort: 10115,
    studioPort: 10116,
  },
];

const INTERNAL_APPS = [
  {
    projectName: 'SummonIQ (Internal)',
    apps: [
      { name: 'orchestrator', devPort: 30140, type: 'DESKTOP_APP' as const },
      { name: 'analytics', devPort: 20000, type: 'WEB_APP' as const },
    ],
  },
];

// GET - Retrieve all port allocations across all projects
export async function GET() {
  try {
    // Get all projects with their apps
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        port: true,
        apps: {
          select: {
            id: true,
            name: true,
            type: true,
            devPort: true,
          },
          orderBy: {
            devPort: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate port usage summary by type
    const allApps = projects.flatMap(p => p.apps);

    const portSummary = {
      WEB_APP: {
        ...PORT_RANGES.WEB_APP,
        used: allApps.filter(a => a.type === 'WEB_APP' && a.devPort).length,
        ports: allApps
          .filter(a => a.type === 'WEB_APP' && a.devPort)
          .map(a => a.devPort as number)
          .sort((a, b) => a - b),
      },
      DESKTOP_APP: {
        ...PORT_RANGES.DESKTOP_APP,
        used: allApps.filter(a => a.type === 'DESKTOP_APP' && a.devPort).length,
        ports: allApps
          .filter(a => a.type === 'DESKTOP_APP' && a.devPort)
          .map(a => a.devPort as number)
          .sort((a, b) => a - b),
      },
      MOBILE_APP: {
        ...PORT_RANGES.MOBILE_APP,
        used: allApps.filter(a => a.type === 'MOBILE_APP' && a.devPort).length,
        ports: allApps
          .filter(a => a.type === 'MOBILE_APP' && a.devPort)
          .map(a => a.devPort as number)
          .sort((a, b) => a - b),
      },
    };

    // Format projects with their port info
    const takenPortBlocks = new Map<
      number,
      { projectName: string; minPort: number; maxPort: number }
    >();

    const projectsWithPorts = projects.map(project => {
      const appsWithPorts = project.apps.filter(app => app.devPort !== null);
      const ports = appsWithPorts.map(a => a.devPort as number);

      let minPort: number | null = null;
      let maxPort: number | null = null;

      if (typeof project.port === 'number') {
        minPort = project.port;
        maxPort = project.port + (PROJECT_PORT_BLOCK_SIZE - 1);
      } else if (ports.length > 0) {
        const firstPort = ports[0];
        const range = pickPortRangeForValue(firstPort);
        if (range) {
          const base = toBlockBase(firstPort, range);
          minPort = base;
          maxPort = base + (PROJECT_PORT_BLOCK_SIZE - 1);
        }
      }

      if (minPort !== null && maxPort !== null) {
        takenPortBlocks.set(minPort, {
          projectName: project.name,
          minPort,
          maxPort,
        });
      }

      return {
        id: project.id,
        name: project.name,
        apps: project.apps.map(app => ({
          id: app.id,
          name: app.name,
          type: app.type,
          devPort: app.devPort,
        })),
        minPort,
        maxPort,
        portRange:
          minPort === null || maxPort === null
            ? 'No ports assigned'
            : minPort === maxPort
              ? `${minPort}`
              : `${minPort} - ${maxPort}`,
        portCount: appsWithPorts.length,
      };
    });

    return NextResponse.json({
      projects: projectsWithPorts,
      takenPortBlocks: Array.from(takenPortBlocks.values()).sort(
        (a, b) => a.minPort - b.minPort,
      ),
      summary: portSummary,
      totalApps: allApps.length,
      totalWithPorts: allApps.filter(a => a.devPort).length,
    });
  } catch (error) {
    console.error('[API] Error getting port allocations:', error);
    return NextResponse.json(
      {
        error: 'Failed to get port allocations',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// POST - Sync port configurations to database
export async function POST() {
  try {
    let created = 0;
    let updated = 0;

    // Sync each project from port configs
    for (const config of PORT_CONFIGS) {
      const projectKey = config.name.toLowerCase().replace(/\s+/g, '-');
      const projectPath = `/Users/steven/Projects/${projectKey}`;

      // First check if project exists by name (exact match)
      let project = await prisma.project.findUnique({
        where: { name: config.name },
      });

      if (project) {
        // Update existing project's port
        project = await prisma.project.update({
          where: { id: project.id },
          data: { port: config.devPort },
        });
      } else {
        // Check if a project exists at this path
        const existingByPath = await prisma.project.findUnique({
          where: { path: projectPath },
        });

        if (existingByPath) {
          // Update existing project's port only (don't change name)
          project = await prisma.project.update({
            where: { id: existingByPath.id },
            data: { port: config.devPort },
          });
        } else {
          // Create new project
          project = await prisma.project.create({
            data: {
              name: config.name,
              key: projectKey,
              description: `${config.name} project`,
              path: projectPath,
              port: config.devPort,
            },
          });
        }
      }

      // Create/update the main web app
      const existingApp = await prisma.app.findFirst({
        where: {
          projectId: project.id,
          name: 'web',
        },
      });

      if (existingApp) {
        await prisma.app.update({
          where: { id: existingApp.id },
          data: { devPort: config.devPort },
        });
        updated++;
      } else {
        await prisma.app.create({
          data: {
            projectId: project.id,
            name: 'web',
            description: `${config.name} web application`,
            type: 'WEB_APP',
            path: 'apps/web',
            devPort: config.devPort,
          },
        });
        created++;
      }

      // If there's a database port, create a database record
      if (config.dbPort) {
        const existingDb = await prisma.database.findFirst({
          where: {
            projectId: project.id,
            name: 'main',
          },
        });

        if (!existingDb) {
          await prisma.database.create({
            data: {
              projectId: project.id,
              name: 'main',
              type: 'postgresql',
              host: 'localhost',
              port: config.dbPort,
              username: 'postgres',
              password: 'password',
              database: projectKey.replace(/-/g, '_'),
              connectionString: `postgresql://postgres:password@localhost:${config.dbPort}/${projectKey.replace(/-/g, '_')}?schema=public`,
            },
          });
        }
      }
    }

    // Sync internal apps (orchestrator, analytics)
    for (const internal of INTERNAL_APPS) {
      // First check if project exists by name (exact match)
      let project = await prisma.project.findUnique({
        where: { name: internal.projectName },
      });

      if (!project) {
        // Check if a project exists at this path
        const existingByPath = await prisma.project.findUnique({
          where: { path: '/Users/steven/Projects/applab' },
        });

        if (existingByPath) {
          project = existingByPath;
        } else {
          // Create new project
          project = await prisma.project.create({
            data: {
              name: internal.projectName,
              key: 'applab-internal',
              description: 'SummonIQ internal applications',
              path: '/Users/steven/Projects/applab',
            },
          });
        }
      }

      for (const app of internal.apps) {
        const existingApp = await prisma.app.findFirst({
          where: {
            projectId: project.id,
            name: app.name,
          },
        });

        if (existingApp) {
          await prisma.app.update({
            where: { id: existingApp.id },
            data: { devPort: app.devPort },
          });
          updated++;
        } else {
          await prisma.app.create({
            data: {
              projectId: project.id,
              name: app.name,
              description: `${app.name} application`,
              type: app.type,
              path: `apps/${app.name}`,
              devPort: app.devPort,
            },
          });
          created++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Port configurations synced successfully',
      created,
      updated,
    });
  } catch (error) {
    console.error('[API] Error syncing port allocations:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync port allocations',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
