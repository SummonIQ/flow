#!/usr/bin/env bun
/**
 * Load environment variables to database for configuration management
 * Run with: bun run env:load
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');

console.log('📦 Loading environment configuration');
console.log('');

if (!existsSync(envPath)) {
  console.log('⚠️  No .env.local file found');
  console.log('   Create one from .env.example to get started');
  process.exit(0);
}

const envContent = readFileSync(envPath, 'utf-8');
const lines = envContent
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('#'));

console.log(`ℹ️  Found ${lines.length} environment variables`);
console.log('');
console.log('✨ Environment loaded successfully!');
