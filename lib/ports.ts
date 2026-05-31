export function normalizePort(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function getAppDevPort(
  app:
    | {
        dev?: { port?: unknown };
        devPort?: unknown;
      }
    | null
    | undefined,
): number | null {
  return normalizePort(app?.dev?.port ?? app?.devPort ?? null);
}
