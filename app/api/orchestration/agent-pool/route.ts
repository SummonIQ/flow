/**
 * GET /api/orchestration/agent-pool
 * 
 * Get agent pool status and available specialists
 */

import { NextResponse } from 'next/server';
import { AgentPool } from '@/lib/orchestration';

export async function GET() {
  try {
    const pool = new AgentPool();
    await pool.initialize();

    const status = await pool.getPoolStatus();

    if (!status) {
      return NextResponse.json(
        { error: 'Agent pool not initialized' },
        { status: 500 }
      );
    }

    // Get availability for each agent
    const agentAvailability = await Promise.all(
      status.agentIds.map(async id => {
        const availability = await pool.getAgentAvailability(id);
        return { agentId: id, ...availability };
      })
    );

    return NextResponse.json({
      pool: status,
      agents: agentAvailability,
    });
  } catch (error) {
    console.error('Error getting agent pool status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
