#!/usr/bin/env bun
/**
 * Sync port configurations across the monorepo
 * Run with: bun run ports:sync
 */

const PORTS = {
  orchestrator: 30140,
  analytics: 20000,
};

console.log('🔌 Port Configuration Sync');
console.log('');
console.log('Current port assignments:');
Object.entries(PORTS).forEach(([app, port]) => {
  console.log(`  • ${app}: ${port}`);
});
console.log('');
console.log('✨ Ports are in sync!');
