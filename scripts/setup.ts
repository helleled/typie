#!/usr/bin/env bun

/**
 * Typie Development Environment Setup Script
 * 
 * This script automates the initial setup process for the Typie monorepo.
 * Run with: bun run scripts/setup.ts
 */

import { $ } from 'bun';
import { existsSync, mkdirSync } from 'node:fs';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

// Color utilities for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color?: keyof typeof colors) {
  const colorCode = color ? colors[color] : '';
  console.log(`${colorCode}${message}${colors.reset}`);
}

function logStep(step: string) {
  log(`\n${colors.bright}▶ ${step}${colors.reset}`, 'cyan');
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`  ${message}`, 'blue');
}

// Check if a command exists
async function commandExists(command: string): Promise<boolean> {
  try {
    await $`which ${command}`.quiet();
    return true;
  } catch {
    return false;
  }
}

// Get version of a command
async function getVersion(command: string, args: string[] = ['--version']): Promise<string | null> {
  try {
    const result = await $`${command} ${args}`.text();
    return result.trim();
  } catch {
    return null;
  }
}

// Check Node.js version
async function checkNodeVersion(): Promise<boolean> {
  const version = await getVersion('node', ['--version']);
  if (!version) return false;
  
  const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
  return majorVersion >= 22;
}

// Environment Check
async function checkEnvironment(): Promise<boolean> {
  logStep('Checking development environment');
  
  let allChecksPassed = true;
  
  // Check Bun
  if (await commandExists('bun')) {
    const version = await getVersion('bun', ['--version']);
    logSuccess(`Bun is installed (${version})`);
  } else {
    logError('Bun is not installed');
    logInfo('Install from: https://bun.sh');
    allChecksPassed = false;
  }
  
  // Check Node.js
  if (await commandExists('node')) {
    const version = await getVersion('node', ['--version']);
    const isCompatible = await checkNodeVersion();
    if (isCompatible) {
      logSuccess(`Node.js is installed (${version})`);
    } else {
      logWarning(`Node.js ${version} is installed, but version 22+ is recommended`);
    }
  } else {
    logWarning('Node.js is not installed (recommended for some tools)');
    logInfo('Install from: https://nodejs.org');
  }
  
  // Check PostgreSQL
  if (await commandExists('psql')) {
    const version = await getVersion('psql', ['--version']);
    logSuccess(`PostgreSQL is installed (${version})`);
  } else {
    logWarning('PostgreSQL client (psql) is not installed');
    logInfo('macOS: brew install postgresql@17');
    logInfo('Ubuntu: sudo apt install postgresql-client');
  }
  
  // Check Redis
  if (await commandExists('redis-cli')) {
    const version = await getVersion('redis-cli', ['--version']);
    logSuccess(`Redis CLI is installed (${version})`);
  } else {
    logWarning('Redis CLI is not installed');
    logInfo('macOS: brew install redis');
    logInfo('Ubuntu: sudo apt install redis-tools');
  }
  
  // Check Meilisearch (optional)
  if (await commandExists('meilisearch')) {
    const version = await getVersion('meilisearch', ['--version']);
    logSuccess(`Meilisearch is installed (${version})`);
  } else {
    logWarning('Meilisearch is not installed (optional for search features)');
    logInfo('Install from: https://www.meilisearch.com/docs/learn/getting_started/installation');
  }
  
  return allChecksPassed;
}

// Install dependencies
async function installDependencies(): Promise<void> {
  logStep('Installing dependencies');
  
  try {
    await $`bun install`;
    logSuccess('Dependencies installed successfully');
  } catch (error) {
    logError('Failed to install dependencies');
    throw error;
  }
}

// Setup environment files
async function setupEnvironmentFiles(): Promise<void> {
  logStep('Setting up environment files');
  
  const projectRoot = process.cwd();
  
  // API environment
  const apiEnvPath = join(projectRoot, 'apps/api/.env');
  if (!existsSync(apiEnvPath)) {
    logInfo('Creating apps/api/.env file...');
    
    const defaultApiEnv = `# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/typie

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Meilisearch Configuration
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey

# Auth & URLs
AUTH_URL=http://localhost:3000/auth
WEBSITE_URL=http://localhost:3000
USERSITE_URL=http://localhost:3000

# OIDC Configuration
OIDC_CLIENT_ID=typie-web
OIDC_CLIENT_SECRET=dev-secret-change-in-production
OIDC_JWK={"kty":"RSA","n":"placeholder","e":"AQAB","d":"placeholder"}

# OAuth Providers (Leave empty for development)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Apple Configuration (Leave empty for development)
APPLE_TEAM_ID=
APPLE_SIGN_IN_KEY_ID=
APPLE_SIGN_IN_PRIVATE_KEY=
APPLE_APP_APPLE_ID=0
APPLE_APP_BUNDLE_ID=
APPLE_IAP_ISSUER_ID=
APPLE_IAP_KEY_ID=
APPLE_IAP_PRIVATE_KEY=

# Google Play Configuration (Leave empty for development)
GOOGLE_PLAY_PACKAGE_NAME=
GOOGLE_SERVICE_ACCOUNT=

# Payment Configuration (Leave empty for development)
PORTONE_API_SECRET=
PORTONE_CHANNEL_KEY=

# External Services (Leave empty for development)
ANTHROPIC_API_KEY=
GITHUB_TOKEN=
IFRAMELY_API_KEY=
SPELLCHECK_URL=
SPELLCHECK_API_KEY=

# Slack Integration (Leave empty for development)
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_WEBHOOK_URL=

# Monitoring (Optional)
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=

# Server Configuration
LISTEN_PORT=4000
`;
    
    await writeFile(apiEnvPath, defaultApiEnv);
    logSuccess('Created apps/api/.env with default values');
    logWarning('Please update the configuration values as needed');
  } else {
    logInfo('apps/api/.env already exists, skipping');
  }
  
  // Website environment
  const websiteEnvPath = join(projectRoot, 'apps/website/.env');
  if (existsSync(websiteEnvPath)) {
    logInfo('apps/website/.env already exists');
    
    try {
      const content = await readFile(websiteEnvPath, 'utf-8');
      const lines = content.split('\n');
      let updated = false;
      
      const updatedLines = lines.map(line => {
        if (line.startsWith('PUBLIC_API_URL=') && !line.includes('http')) {
          updated = true;
          return 'PUBLIC_API_URL=http://localhost:4000';
        }
        if (line.startsWith('PUBLIC_AUTH_URL=') && !line.includes('http')) {
          updated = true;
          return 'PUBLIC_AUTH_URL=http://localhost:3000/auth';
        }
        if (line.startsWith('PUBLIC_WEBSITE_URL=') && !line.includes('http')) {
          updated = true;
          return 'PUBLIC_WEBSITE_URL=http://localhost:3000';
        }
        if (line.startsWith('PUBLIC_WS_URL=') && !line.includes('ws')) {
          updated = true;
          return 'PUBLIC_WS_URL=ws://localhost:4000';
        }
        if (line.startsWith('PRIVATE_API_URL=') && !line.includes('http')) {
          updated = true;
          return 'PRIVATE_API_URL=http://localhost:4000';
        }
        return line;
      });
      
      if (updated) {
        await writeFile(websiteEnvPath, updatedLines.join('\n'));
        logSuccess('Updated apps/website/.env with default development URLs');
      }
    } catch (error) {
      logWarning('Could not update apps/website/.env automatically');
    }
  }
}

// Check and setup database
async function setupDatabase(): Promise<void> {
  logStep('Setting up database');
  
  const apiEnvPath = join(process.cwd(), 'apps/api/.env');
  if (!existsSync(apiEnvPath)) {
    logWarning('Skipping database setup - apps/api/.env not found');
    return;
  }
  
  // Load DATABASE_URL from .env
  const envContent = await readFile(apiEnvPath, 'utf-8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
  
  if (!dbUrlMatch) {
    logWarning('DATABASE_URL not found in apps/api/.env');
    return;
  }
  
  const databaseUrl = dbUrlMatch[1].trim();
  logInfo(`Database URL: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`);
  
  // Check PostgreSQL connection
  try {
    const url = new URL(databaseUrl);
    const password = url.password ? `PGPASSWORD=${url.password}` : '';
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.slice(1).split('?')[0];
    const user = url.username;
    
    logInfo('Checking PostgreSQL connection...');
    
    // Try to connect
    try {
      await $`${password} psql -h ${host} -p ${port} -U ${user} -d postgres -c "SELECT 1" > /dev/null 2>&1`.quiet();
      logSuccess('PostgreSQL connection successful');
    } catch {
      logWarning('Could not connect to PostgreSQL');
      logInfo('Please ensure PostgreSQL is running and credentials are correct');
      logInfo(`  Connection: ${host}:${port} as ${user}`);
      return;
    }
    
    // Check if database exists
    try {
      await $`${password} psql -h ${host} -p ${port} -U ${user} -lqt | cut -d \\| -f 1 | grep -qw ${database}`.quiet();
      logSuccess(`Database '${database}' exists`);
    } catch {
      logInfo(`Creating database '${database}'...`);
      try {
        await $`${password} psql -h ${host} -p ${port} -U ${user} -d postgres -c "CREATE DATABASE ${database}"`;
        logSuccess(`Database '${database}' created`);
      } catch (error) {
        logError(`Failed to create database '${database}'`);
        throw error;
      }
    }
    
    // Run migrations
    logInfo('Running database migrations...');
    try {
      await $`cd apps/api && bun run drizzle-kit migrate`;
      logSuccess('Database migrations completed');
    } catch (error) {
      logError('Failed to run migrations');
      throw error;
    }
    
    // Optionally run seed
    const seedPath = join(process.cwd(), 'apps/api/scripts/seed.ts');
    if (existsSync(seedPath)) {
      logInfo('Running database seed...');
      try {
        await $`cd apps/api && bun run scripts/seed.ts`;
        logSuccess('Database seeded successfully');
      } catch (error) {
        logWarning('Seed script failed (this may be expected if data already exists)');
      }
    }
  } catch (error) {
    logWarning('Database setup failed - you may need to set this up manually');
    logInfo('To run migrations manually: cd apps/api && bun run drizzle-kit migrate');
  }
}

// Check services
async function checkServices(): Promise<void> {
  logStep('Checking service connections');
  
  // Check Redis
  try {
    await $`redis-cli ping`.quiet();
    logSuccess('Redis is running and accessible');
  } catch {
    logWarning('Redis is not running or not accessible');
    logInfo('Start Redis: redis-server');
    logInfo('Or with brew: brew services start redis');
  }
  
  // Check Meilisearch
  try {
    const response = await fetch('http://localhost:7700/health');
    if (response.ok) {
      logSuccess('Meilisearch is running and accessible');
    } else {
      throw new Error('Not healthy');
    }
  } catch {
    logWarning('Meilisearch is not running or not accessible');
    logInfo('Start Meilisearch: meilisearch --master-key=masterKey');
  }
}

// Build shared packages
async function buildSharedPackages(): Promise<void> {
  logStep('Building shared packages');
  
  // Build packages that other packages depend on
  const packagesToBuild = [
    '@typie/styled-system',
    '@typie/sark',
    '@typie/ui',
  ];
  
  for (const pkg of packagesToBuild) {
    try {
      logInfo(`Running codegen for ${pkg}...`);
      await $`bun run turbo run codegen --filter=${pkg}`;
    } catch (error) {
      logWarning(`Codegen for ${pkg} failed (may not be critical)`);
    }
    
    try {
      logInfo(`Building ${pkg}...`);
      await $`bun run turbo run build --filter=${pkg}`;
    } catch (error) {
      logWarning(`Build for ${pkg} failed (may not be critical)`);
    }
  }
  
  logSuccess('Shared packages built');
}

// Generate OIDC JWK for development
async function generateOIDCJwk(): Promise<void> {
  const apiEnvPath = join(process.cwd(), 'apps/api/.env');
  if (!existsSync(apiEnvPath)) {
    return;
  }
  
  const envContent = await readFile(apiEnvPath, 'utf-8');
  
  // Check if JWK is still placeholder
  if (envContent.includes('OIDC_JWK={"kty":"RSA","n":"placeholder"')) {
    logInfo('Generating OIDC JWK for development...');
    
    const generateJwkPath = join(process.cwd(), 'apps/api/scripts/generate-jwk.ts');
    if (existsSync(generateJwkPath)) {
      try {
        const result = await $`cd apps/api && bun run scripts/generate-jwk.ts`.text();
        const jwk = result.trim();
        
        const updatedEnv = envContent.replace(
          /OIDC_JWK=.*/,
          `OIDC_JWK=${jwk}`
        );
        
        await writeFile(apiEnvPath, updatedEnv);
        logSuccess('Generated and saved OIDC JWK');
      } catch (error) {
        logWarning('Failed to generate OIDC JWK - you may need to do this manually');
      }
    }
  }
}

// Print success summary
function printSummary(): void {
  logStep('Setup Complete! 🎉');
  
  log('\n' + colors.bright + 'Next Steps:' + colors.reset, 'green');
  log('');
  log('1. Review and update environment variables:', 'cyan');
  logInfo('   - apps/api/.env');
  logInfo('   - apps/website/.env');
  log('');
  log('2. Ensure services are running:', 'cyan');
  logInfo('   - PostgreSQL (port 5432)');
  logInfo('   - Redis (port 6379)');
  logInfo('   - Meilisearch (port 7700, optional)');
  log('');
  log('3. Start development servers:', 'cyan');
  logInfo('   bun run dev              # Start all apps');
  logInfo('   bun run dev --filter=api     # Start API only');
  logInfo('   bun run dev --filter=website # Start website only');
  log('');
  log('4. Available commands:', 'cyan');
  logInfo('   bun run build            # Build all packages');
  logInfo('   bun run lint:typecheck   # Type check');
  logInfo('   bun run lint:eslint      # Lint code');
  logInfo('   bun run test             # Run tests');
  log('');
  log('📚 For more information, check the documentation', 'blue');
  log('');
}

// Main setup function
async function main() {
  log(colors.bright + '\n╔════════════════════════════════════════════╗' + colors.reset);
  log(colors.bright + '║   Typie Development Environment Setup     ║' + colors.reset);
  log(colors.bright + '╚════════════════════════════════════════════╝\n' + colors.reset);
  
  try {
    // Step 1: Check environment
    const envCheckPassed = await checkEnvironment();
    if (!envCheckPassed) {
      logError('\nEnvironment check failed. Please install missing dependencies.');
      process.exit(1);
    }
    
    // Step 2: Install dependencies
    await installDependencies();
    
    // Step 3: Setup environment files
    await setupEnvironmentFiles();
    
    // Step 4: Generate OIDC JWK if needed
    await generateOIDCJwk();
    
    // Step 5: Build shared packages
    await buildSharedPackages();
    
    // Step 6: Setup database
    await setupDatabase();
    
    // Step 7: Check services
    await checkServices();
    
    // Step 8: Print summary
    printSummary();
    
  } catch (error) {
    logError('\nSetup failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
main();
