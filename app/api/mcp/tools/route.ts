import { handleTool, toolDefinitions } from '@/lib/mcp/tools';
import { NextResponse } from 'next/server';

/**
 * GET /api/mcp/tools - List available MCP tools
 */
export async function GET() {
  return NextResponse.json({
    tools: toolDefinitions,
    serverInfo: {
      name: 'flow-mcp-server',
      version: '0.1.0',
      description: 'Flow agency management MCP server',
    },
  });
}

/**
 * POST /api/mcp/tools - Execute an MCP tool
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, arguments: args } = body;

    if (!name) {
      return NextResponse.json({ error: 'Missing tool name' }, { status: 400 });
    }

    const result = await handleTool(name, args || {});

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ result: result.result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
