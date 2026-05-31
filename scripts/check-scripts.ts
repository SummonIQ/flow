#!/usr/bin/env bun
/**
 * Sanity check to verify all script targets exist
 * Run with: bun run scripts/check-scripts.ts
 */

import { existsSync } from 'fs';
import { join } from 'path';

const SCRIPT_TARGETS = [
  'scripts/init-templates.ts',
  'scripts/reset-templates.ts',
  'scripts/load-env-to-db.ts',
  'scripts/sync-ports.ts',
  'scripts/sync-env.ts',
  'scripts/generate-icons.sh',
  'lib/sync/watcher.ts',
  'prisma/seed.ts',
];

console.log('🔍 Checking script targets...\n');

let hasErrors = false;

for (const script of SCRIPT_TARGETS) {
  const fullPath = join(process.cwd(), script);
  if (existsSync(fullPath)) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ❌ ${script} — MISSING`);
    hasErrors = true;
  }
}

console.log('');

if (hasErrors) {
  console.log('⚠️  Some script targets are missing!');
  process.exit(1);
} else {
  console.log('✨ All script targets exist!');
}
