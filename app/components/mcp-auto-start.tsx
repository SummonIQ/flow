'use client';

import { useEffect, useRef } from 'react';

export function McpAutoStart() {
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function autoStartMcp() {
      try {
        // Check if MCP is configured but not running
        const response = await fetch('/api/mcp/status');
        if (response.ok) {
          const data = await response.json();
          // Only auto-start if configured (no MCP_SERVER_PATH error) but not running
          if (!data.running && !data.error?.includes('MCP_SERVER_PATH')) {
            // Start the MCP server
            await fetch('/api/mcp/status?start=1');
          }
        }
      } catch {
        // Silently fail - MCP auto-start is not critical
      }
    }

    autoStartMcp();
  }, []);

  return null;
}
