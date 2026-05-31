import { prisma } from '@/lib/db/prisma';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';

const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (!inDouble && !inTemplate && ch === "'") {
      inSingle = !inSingle;
      continue;
    }

    if (!inSingle && !inTemplate && ch === '"') {
      inDouble = !inDouble;
      continue;
    }

    if (!inSingle && !inDouble && ch === '`') {
      inTemplate = !inTemplate;
      continue;
    }

    if (inSingle || inDouble || inTemplate) {
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findConfigObjectRange(
  content: string,
): { open: number; close: number } | null {
  const exportIndex = content.indexOf('export default');
  if (exportIndex !== -1) {
    const open = content.indexOf('{', exportIndex);
    if (open !== -1) {
      const close = findMatchingBrace(content, open);
      if (close !== -1) return { open, close };
    }
  }

  const constMatch = content.match(/const\s+\w+\s*(?::[^=]+)?=\s*\{/);
  if (constMatch?.index != null) {
    const open = constMatch.index + constMatch[0].lastIndexOf('{');
    const close = findMatchingBrace(content, open);
    if (close !== -1) return { open, close };
  }

  return null;
}

function upsertMcpServersBlock(params: {
  configObjectSource: string;
  serverId: string;
  enabled: boolean;
}): string {
  const { configObjectSource, serverId, enabled } = params;

  const propMatch = configObjectSource.match(/\n(\s*)mcpServers\s*:/);
  const propIndent =
    propMatch?.[1] ?? configObjectSource.match(/\n(\s*)name\s*:/)?.[1] ?? '  ';
  const entryIndent = propIndent + '  ';

  const propIndex = configObjectSource.search(/\bmcpServers\s*:/);

  if (propIndex === -1) {
    const insertion =
      `\n${propIndent}mcpServers: {` +
      `\n${entryIndent}${serverId}: { enabled: ${enabled} },` +
      `\n${propIndent}},`;

    // Insert before final closing brace
    const closeBraceIndex = configObjectSource.lastIndexOf('}');
    if (closeBraceIndex === -1) return configObjectSource;

    return (
      configObjectSource.slice(0, closeBraceIndex) +
      insertion +
      '\n' +
      configObjectSource.slice(closeBraceIndex)
    );
  }

  const objectOpen = configObjectSource.indexOf('{', propIndex);
  if (objectOpen === -1) return configObjectSource;

  const objectClose = findMatchingBrace(configObjectSource, objectOpen);
  if (objectClose === -1) return configObjectSource;

  const inner = configObjectSource.slice(objectOpen + 1, objectClose);

  // Remove existing entry for serverId (if present) using a simple scan
  const keyIndex = inner.search(new RegExp(`\\n\\s*${serverId}\\s*:`));
  let cleanedInner = inner;
  if (keyIndex !== -1) {
    // keyIndex is relative; find absolute index in configObjectSource
    const absoluteKeyIndex = objectOpen + 1 + keyIndex;
    const entryOpen = configObjectSource.indexOf('{', absoluteKeyIndex);
    if (entryOpen !== -1 && entryOpen < objectClose) {
      const entryClose = findMatchingBrace(configObjectSource, entryOpen);
      if (entryClose !== -1 && entryClose < objectClose) {
        // Expand to include trailing comma/newline
        let end = entryClose + 1;
        while (end < objectClose && /[\s,]/.test(configObjectSource[end])) {
          if (configObjectSource[end] === '\n') {
            end++;
            break;
          }
          end++;
        }

        const before = configObjectSource.slice(
          objectOpen + 1,
          absoluteKeyIndex,
        );
        const after = configObjectSource.slice(end, objectClose);
        cleanedInner = before + after;
      }
    }
  }

  const trimmed = cleanedInner.trimEnd();
  const needsLeadingNewline = trimmed.length > 0 && !trimmed.endsWith('\n');
  const updatedInner =
    trimmed +
    (needsLeadingNewline ? '\n' : '') +
    `${entryIndent}${serverId}: { enabled: ${enabled} },\n`;

  return (
    configObjectSource.slice(0, objectOpen + 1) +
    '\n' +
    updatedInner +
    `${propIndent}` +
    configObjectSource.slice(objectClose)
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name: projectName } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      serverId?: string;
      enabled?: boolean;
      states?: Record<string, boolean>;
    };

    const isBulk =
      body.states != null &&
      typeof body.states === 'object' &&
      !Array.isArray(body.states);

    const isSingle =
      typeof body.serverId === 'string' && typeof body.enabled === 'boolean';

    if (!isBulk && !isSingle) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { name: projectName },
      select: { path: true },
    });

    const projectPath = project?.path || path.join(PROJECTS_BASE, projectName);
    const configPath = path.join(projectPath, 'applab.config.ts');

    let configContent: string;
    try {
      configContent = await fs.readFile(configPath, 'utf-8');
    } catch {
      return NextResponse.json(
        { success: false, error: 'Project config not found' },
        { status: 404 },
      );
    }

    const range = findConfigObjectRange(configContent);
    if (!range) {
      return NextResponse.json(
        { success: false, error: 'Could not locate config object' },
        { status: 400 },
      );
    }

    const configObjSource = configContent.slice(range.open, range.close + 1);

    let updatedConfigObjSource = configObjSource;
    if (isBulk) {
      for (const [id, nextEnabled] of Object.entries(body.states!)) {
        updatedConfigObjSource = upsertMcpServersBlock({
          configObjectSource: updatedConfigObjSource,
          serverId: id,
          enabled: !!nextEnabled,
        });
      }
    } else {
      updatedConfigObjSource = upsertMcpServersBlock({
        configObjectSource: updatedConfigObjSource,
        serverId: body.serverId!,
        enabled: body.enabled!,
      });
    }

    const updatedFile =
      configContent.slice(0, range.open) +
      updatedConfigObjSource +
      configContent.slice(range.close + 1);

    await fs.writeFile(configPath, updatedFile, 'utf-8');

    return NextResponse.json(
      isBulk
        ? { success: true, states: body.states }
        : { success: true, serverId: body.serverId, enabled: body.enabled },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
