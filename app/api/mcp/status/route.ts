import { getMCPClient, getRunningMCPClient } from '@/lib/mcp-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const start = request.nextUrl.searchParams.get('start') === '1';

    if (!start) {
      const runningClient = getRunningMCPClient();
      if (!runningClient) {
        return NextResponse.json({ running: false });
      }

      try {
        await runningClient.listTools();
        return NextResponse.json({ running: true });
      } catch (error) {
        return NextResponse.json({
          running: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const client = await getMCPClient();
    await client.listTools();

    return NextResponse.json({ running: true });
  } catch (error) {
    return NextResponse.json(
      {
        running: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 },
    );
  }
}
