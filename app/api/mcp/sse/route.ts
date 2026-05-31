import { handleTool, toolDefinitions } from '@/lib/mcp/tools';

/**
 * MCP Server-Sent Events endpoint
 * Implements MCP protocol over SSE for AI tool integration
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send server info
      const serverInfo = {
        jsonrpc: '2.0',
        method: 'server/info',
        params: {
          name: 'flow-mcp-server',
          version: '0.1.0',
          capabilities: { tools: {} },
        },
      };
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(serverInfo)}\n\n`),
      );

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * POST handler for MCP JSON-RPC requests
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== '2.0') {
      return Response.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32600, message: 'Invalid Request' },
      });
    }

    switch (method) {
      case 'tools/list': {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: { tools: toolDefinitions },
        });
      }

      case 'tools/call': {
        const { name, arguments: args } = params || {};
        const result = await handleTool(name, args || {});

        if (result.error) {
          return Response.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: result.error }],
              isError: true,
            },
          });
        }

        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              { type: 'text', text: JSON.stringify(result.result, null, 2) },
            ],
          },
        });
      }

      case 'initialize': {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: { name: 'flow-mcp-server', version: '0.1.0' },
            capabilities: { tools: {} },
          },
        });
      }

      default:
        return Response.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message },
    });
  }
}
