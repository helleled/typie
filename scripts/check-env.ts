#!/usr/bin/env bun

/**
 * Environment Check Script
 * 
 * Quickly verify that your development environment is properly configured.
 * Run with: bun run scripts/check-env.ts
 */

import { $ } from 'bun';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const results: CheckResult[] = [];

async function check(
  name: string,
  testFn: () => Promise<boolean>,
  passMessage: string,
  failMessage: string,
  severity: 'error' | 'warning' = 'error'
): Promise<void> {
  try {
    const passed = await testFn();
    results.push({
      name,
      passed,
      message: passed ? passMessage : failMessage,
      severity: passed ? 'info' : severity,
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      message: failMessage,
      severity,
    });
  }
}

// Color utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

console.log('\n🔍 Checking Typie development environment...\n');

// Check Bun
await check(
  'Bun',
  async () => {
    try {
      await $`bun --version`.quiet();
      return true;
    } catch {
      return false;
    }
  },
  'Bun is installed',
  'Bun is not installed. Install from: https://bun.sh'
);

// Check Node.js (optional)
await check(
  'Node.js',
  async () => {
    try {
      const version = await $`node --version`.text();
      const major = parseInt(version.replace('v', '').split('.')[0]);
      return major >= 22;
    } catch {
      return false;
    }
  },
  'Node.js 22+ is installed',
  'Node.js 22+ is recommended',
  'warning'
);

// Check PostgreSQL
await check(
  'PostgreSQL',
  async () => {
    try {
      await $`psql --version`.quiet();
      return true;
    } catch {
      return false;
    }
  },
  'PostgreSQL client is installed',
  'PostgreSQL client is not installed',
  'error'
);

// Check Redis
await check(
  'Redis',
  async () => {
    try {
      await $`redis-cli --version`.quiet();
      return true;
    } catch {
      return false;
    }
  },
  'Redis CLI is installed',
  'Redis CLI is not installed',
  'error'
);

// Check if node_modules exists
await check(
  'Dependencies',
  async () => existsSync('node_modules'),
  'Dependencies are installed',
  'Dependencies not installed. Run: bun install'
);

// Check API .env file
await check(
  'API .env',
  async () => existsSync('apps/api/.env'),
  'API .env file exists',
  'API .env file missing. Run: bun run setup'
);

// Check Website .env file
await check(
  'Website .env',
  async () => existsSync('apps/website/.env'),
  'Website .env file exists',
  'Website .env file is missing (may be optional)'
);

// Check PostgreSQL connection
await check(
  'PostgreSQL Connection',
  async () => {
    try {
      const envPath = 'apps/api/.env';
      if (!existsSync(envPath)) return false;
      
      const envContent = await readFile(envPath, 'utf-8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
      if (!dbUrlMatch) return false;
      
      const url = new URL(dbUrlMatch[1].trim());
      const password = url.password ? `PGPASSWORD=${url.password}` : '';
      const host = url.hostname;
      const port = url.port || '5432';
      const user = url.username;
      
      await $`${password} psql -h ${host} -p ${port} -U ${user} -d postgres -c "SELECT 1" > /dev/null 2>&1`.quiet();
      return true;
    } catch {
      return false;
    }
  },
  'PostgreSQL is running and accessible',
  'Cannot connect to PostgreSQL',
  'error'
);

// Check Redis connection
await check(
  'Redis Connection',
  async () => {
    try {
      const result = await $`redis-cli ping`.text();
      return result.trim() === 'PONG';
    } catch {
      return false;
    }
  },
  'Redis is running and accessible',
  'Redis is not running',
  'error'
);

// Check if database exists
await check(
  'Database Exists',
  async () => {
    try {
      const envPath = 'apps/api/.env';
      if (!existsSync(envPath)) return false;
      
      const envContent = await readFile(envPath, 'utf-8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
      if (!dbUrlMatch) return false;
      
      const url = new URL(dbUrlMatch[1].trim());
      const password = url.password ? `PGPASSWORD=${url.password}` : '';
      const host = url.hostname;
      const port = url.port || '5432';
      const database = url.pathname.slice(1).split('?')[0];
      const user = url.username;
      
      await $`${password} psql -h ${host} -p ${port} -U ${user} -lqt | cut -d \\| -f 1 | grep -qw ${database}`.quiet();
      return true;
    } catch {
      return false;
    }
  },
  'Database exists',
  'Database does not exist',
  'error'
);

// Check shared packages are built
await check(
  'Styled System Built',
  async () => existsSync('packages/styled-system/styled-system'),
  'Styled system is built',
  'Styled system needs codegen. Run: bun run turbo run codegen',
  'warning'
);

await check(
  'Sark Built',
  async () => existsSync('packages/sark/dist'),
  'Sark is built',
  'Sark needs to be built. Run: bun run turbo run build --filter=@typie/sark',
  'warning'
);

// Print results
console.log('Results:\n');

let hasErrors = false;
let hasWarnings = false;

for (const result of results) {
  let icon = '✓';
  let color = colors.green;
  
  if (!result.passed) {
    if (result.severity === 'error') {
      icon = '✗';
      color = colors.red;
      hasErrors = true;
    } else if (result.severity === 'warning') {
      icon = '⚠';
      color = colors.yellow;
      hasWarnings = true;
    }
  }
  
  console.log(`${color}${icon} ${result.name}: ${result.message}${colors.reset}`);
}

// Print summary
console.log('');
if (!hasErrors && !hasWarnings) {
  console.log(`${colors.green}✓ All checks passed! Your environment is ready.${colors.reset}`);
  console.log(`\nStart development with: ${colors.blue}bun run dev${colors.reset}\n`);
  process.exit(0);
} else if (hasErrors) {
  console.log(`${colors.red}✗ Some critical checks failed. Please fix the errors above.${colors.reset}`);
  console.log(`\nRun the setup script: ${colors.blue}bun run setup${colors.reset}\n`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${colors.yellow}⚠ Environment is mostly ready, but some optional checks failed.${colors.reset}`);
  console.log(`\nYou can proceed with: ${colors.blue}bun run dev${colors.reset}\n`);
  process.exit(0);
}
