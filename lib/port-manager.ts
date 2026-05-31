import { prisma } from '@/lib/db/prisma';
import type { AppType } from '@prisma/client';

/**
 * Port allocation strategy:
 * - Web apps: 10000-19999 (increments of 10)
 * - Desktop apps: 20000-29999 (increments of 10)
 * - Mobile apps: 30000-39999 (increments of 10)
 * - Other types: No automatic port assignment
 */

const PORT_RANGES = {
  WEB_APP: { start: 10000, end: 19999, increment: 10 },
  DESKTOP_APP: { start: 20000, end: 29999, increment: 10 },
  MOBILE_APP: { start: 30000, end: 39999, increment: 10 },
} as const;

const PROJECT_PORT_BLOCK_SIZE = 10;

type PortableAppType = keyof typeof PORT_RANGES;

function isPortAssignableAppType(appType: AppType): boolean {
  return (
    appType === 'WEB_APP' ||
    appType === 'DESKTOP_APP' ||
    appType === 'MOBILE_APP' ||
    appType === 'API' ||
    appType === 'MARKETING_SITE'
  );
}

function pickReservationRange(
  appType: AppType,
): (typeof PORT_RANGES)[PortableAppType] {
  if (isPortableAppType(appType)) {
    return PORT_RANGES[appType];
  }

  return PORT_RANGES.WEB_APP;
}

function getRangeForAlignedBase(
  portBase: number,
): (typeof PORT_RANGES)[PortableAppType] | null {
  for (const range of Object.values(PORT_RANGES)) {
    if (portBase < range.start || portBase > range.end) continue;
    if ((portBase - range.start) % range.increment !== 0) continue;
    return range;
  }

  return null;
}

function toBlockBase(
  port: number,
  range: (typeof PORT_RANGES)[PortableAppType],
): number {
  const offset = port - range.start;
  const blocks = Math.floor(offset / range.increment);
  return range.start + blocks * range.increment;
}

async function getTakenProjectPortBases(
  range: (typeof PORT_RANGES)[PortableAppType],
): Promise<Set<number>> {
  const [reservedProjects, reservedApps] = await Promise.all([
    prisma.project.findMany({
      where: {
        port: {
          not: null,
          gte: range.start,
          lte: range.end,
        },
      },
      select: { port: true },
    }),
    prisma.app.findMany({
      where: {
        devPort: {
          not: null,
          gte: range.start,
          lte: range.end,
        },
      },
      select: { devPort: true },
    }),
  ]);

  const taken = new Set<number>();

  for (const project of reservedProjects) {
    const port = project.port;
    if (typeof port !== 'number') continue;
    if ((port - range.start) % range.increment !== 0) continue;
    taken.add(port);
  }

  for (const app of reservedApps) {
    const port = app.devPort;
    if (typeof port !== 'number') continue;
    const base = toBlockBase(port, range);
    if (base + (PROJECT_PORT_BLOCK_SIZE - 1) > range.end) continue;
    taken.add(base);
  }

  return taken;
}

/**
 * Get the next available port for a given app type
 */
export async function getNextAvailablePort(
  appType: AppType,
): Promise<number | null> {
  // Only assign ports for web, desktop, and mobile apps
  if (!isPortableAppType(appType)) {
    return null;
  }

  const range = PORT_RANGES[appType];

  // Get all apps of this type with assigned ports
  const existingApps = await prisma.app.findMany({
    where: {
      type: appType,
      devPort: {
        not: null,
      },
    },
    select: {
      devPort: true,
    },
    orderBy: {
      devPort: 'desc',
    },
  });

  // If no apps exist, return the starting port
  if (existingApps.length === 0) {
    return range.start;
  }

  // Get the highest port number
  const highestPort = existingApps[0].devPort as number;

  // Calculate next port
  const nextPort = highestPort + range.increment;

  // Check if we're within the valid range
  if (nextPort > range.end) {
    throw new Error(
      `Port range exhausted for ${appType}. Maximum port ${range.end} exceeded.`,
    );
  }

  return nextPort;
}

async function getOrReserveProjectPortBase(
  projectId: string,
  appType: AppType,
): Promise<number> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { port: true },
  });

  const existingPort = project?.port ?? null;
  if (typeof existingPort === 'number') {
    const alignedRange = getRangeForAlignedBase(existingPort);
    if (alignedRange) {
      return existingPort;
    }
  }

  const range = pickReservationRange(appType);
  const takenBases = await getTakenProjectPortBases(range);

  let nextBase: number | null = null;
  for (let base = range.start; base <= range.end; base += range.increment) {
    if (base + (PROJECT_PORT_BLOCK_SIZE - 1) > range.end) break;
    if (takenBases.has(base)) continue;
    nextBase = base;
    break;
  }

  if (nextBase === null) {
    throw new Error(
      `Port range exhausted. Maximum port ${range.end} exceeded.`,
    );
  }

  if (nextBase + (PROJECT_PORT_BLOCK_SIZE - 1) > range.end) {
    throw new Error(
      `Port range exhausted for ${appType}. Maximum port ${range.end} exceeded.`,
    );
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { port: nextBase },
  });

  return nextBase;
}

export async function getNextAvailablePortForProject(
  projectId: string,
  appType: AppType,
): Promise<number | null> {
  if (!isPortAssignableAppType(appType)) {
    return null;
  }

  const basePort = await getOrReserveProjectPortBase(projectId, appType);
  const maxPort = basePort + (PROJECT_PORT_BLOCK_SIZE - 1);

  const existingApps = await prisma.app.findMany({
    where: {
      projectId,
      devPort: {
        not: null,
        gte: basePort,
        lte: maxPort,
      },
    },
    select: { devPort: true },
  });

  const usedPorts = new Set(
    existingApps
      .map(app => app.devPort)
      .filter((port): port is number => typeof port === 'number'),
  );

  for (let port = basePort; port <= maxPort; port++) {
    if (!usedPorts.has(port)) {
      return port;
    }
  }

  throw new Error(
    `Project port block exhausted for ${appType} at ${basePort}-${maxPort}.`,
  );
}

/**
 * Get port range information for a project
 */
export async function getProjectPortRange(projectId: string): Promise<{
  minPort: number | null;
  maxPort: number | null;
  portRange: string;
  appCount: number;
}> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { port: true },
  });

  if (typeof project?.port === 'number') {
    const minPort = project.port;
    const maxPort = project.port + (PROJECT_PORT_BLOCK_SIZE - 1);
    const appCount = await prisma.app.count({
      where: {
        projectId,
        devPort: {
          not: null,
          gte: minPort,
          lte: maxPort,
        },
      },
    });

    return {
      minPort,
      maxPort,
      portRange: `${minPort} - ${maxPort}`,
      appCount,
    };
  }

  const apps = await prisma.app.findMany({
    where: {
      projectId,
      devPort: {
        not: null,
      },
    },
    select: {
      devPort: true,
    },
  });

  if (apps.length === 0) {
    return {
      minPort: null,
      maxPort: null,
      portRange: 'No ports assigned',
      appCount: 0,
    };
  }

  const ports = apps.map(app => app.devPort as number);
  const minPort = Math.min(...ports);
  const maxPort = Math.max(...ports);

  const portRange =
    minPort === maxPort ? `${minPort}` : `${minPort} - ${maxPort}`;

  return {
    minPort,
    maxPort,
    portRange,
    appCount: apps.length,
  };
}

/**
 * Get port range by app type for display purposes
 */
export function getPortRangeForType(appType: AppType): string {
  if (!isPortableAppType(appType)) {
    return 'N/A';
  }

  const range = PORT_RANGES[appType];
  return `${range.start} - ${range.end}`;
}

/**
 * Type guard to check if an app type supports automatic port assignment
 */
function isPortableAppType(appType: AppType): appType is PortableAppType {
  return appType in PORT_RANGES;
}

/**
 * Validate if a port is within the correct range for an app type
 */
export function isValidPortForType(port: number, appType: AppType): boolean {
  if (!isPortableAppType(appType)) {
    return true; // No restrictions for non-portable types
  }

  const range = PORT_RANGES[appType];
  return port >= range.start && port <= range.end;
}
