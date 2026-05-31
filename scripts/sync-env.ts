#!/usr/bin/env bun
/**
 * Sync environment files across the monorepo
 * Run with: bun run env:sync
 */

import { existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), '../..');
const ENV_TEMPLATE = join(ROOT, 'packages/config/templates/.env.template');

console.log('🔄 Environment Sync');
console.log('');

if (existsSync(ENV_TEMPLATE)) {
  console.log('✅ Found .env.template at packages/config/templates/');
} else {
  console.log('⚠️  No .env.template found');
}

console.log('');
console.log('ℹ️  To sync environment:');
console.log(
  '   1. Copy packages/config/templates/.env.template to apps/orchestrator/.env.local',
);
console.log('   2. Fill in the required values');
console.log('');
console.log('✨ Done!');
