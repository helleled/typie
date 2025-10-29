#!/usr/bin/env bun

/**
 * Service Health Check Script
 *
 * This script checks the health of all required services for the Typie monorepo.
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// ANSI colors
const colors = {
  reset: '\u001B[0m',
  green: '\u001B[32m',
  red: '\u001B[31m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  cyan: '\u001B[36m',
  bright: '\u001B[1m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

const projectRoot = path.join(import.meta.dir, '..');

async function checkServices() {
  log.title('서비스 상태 확인');

  let allHealthy = true;

  // PostgreSQL 체크
  try {
    const apiEnvPath = path.join(projectRoot, 'apps/api/.env');
    if (existsSync(apiEnvPath)) {
      const envContent = readFileSync(apiEnvPath, 'utf8');
      const databaseUrlMatch = envContent.match(/DATABASE_URL=(.+)/);

      if (databaseUrlMatch) {
        const databaseUrl = databaseUrlMatch[1].trim();
        const urlObj = new URL(databaseUrl);
        const testCommand = `PGPASSWORD="${urlObj.password}" psql -h ${urlObj.hostname} -p ${urlObj.port || 5432} -U ${urlObj.username} -d ${urlObj.pathname.slice(1)} -c "SELECT 1" > /dev/null 2>&1`;

        execSync(testCommand, { stdio: 'pipe' });
        log.success('PostgreSQL: 연결 성공');
      } else {
        log.warn('PostgreSQL: DATABASE_URL을 찾을 수 없음');
        allHealthy = false;
      }
    } else {
      log.warn('PostgreSQL: .env 파일이 없음');
      allHealthy = false;
    }
  } catch {
    log.error('PostgreSQL: 연결 실패');
    log.info('  시작: brew services start postgresql (macOS) 또는 sudo systemctl start postgresql (Linux)');
    allHealthy = false;
  }

  // Redis 체크
  try {
    execSync('redis-cli ping', { stdio: 'pipe' });
    log.success('Redis: 연결 성공');
  } catch {
    log.error('Redis: 연결 실패');
    log.info('  시작: redis-server');
    allHealthy = false;
  }

  // Meilisearch 체크
  try {
    const apiEnvPath = path.join(projectRoot, 'apps/api/.env');
    if (existsSync(apiEnvPath)) {
      const envContent = readFileSync(apiEnvPath, 'utf8');
      const meilisearchUrlMatch = envContent.match(/MEILISEARCH_URL=(.+)/);

      if (meilisearchUrlMatch) {
        const meilisearchUrl = meilisearchUrlMatch[1].trim();
        const response = await fetch(`${meilisearchUrl}/health`);

        if (response.ok) {
          log.success('Meilisearch: 연결 성공');
        } else {
          throw new Error('Health check failed');
        }
      }
    }
  } catch {
    log.warn('Meilisearch: 연결 실패 (선택 사항)');
    log.info('  시작: meilisearch --master-key="masterKey"');
  }

  // API 서버 체크
  try {
    const response = await fetch('http://localhost:8080/health');
    if (response.ok) {
      log.success('API 서버: 실행 중');
    } else {
      throw new Error('Health check failed');
    }
  } catch {
    log.info('API 서버: 실행 중이지 않음');
    log.info('  시작: cd apps/api && bun run dev');
  }

  // Website 체크
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      log.success('Website: 실행 중');
    } else {
      throw new Error('Health check failed');
    }
  } catch {
    log.info('Website: 실행 중이지 않음');
    log.info('  시작: cd apps/website && bun run dev');
  }

  console.log();
  if (allHealthy) {
    log.success('모든 필수 서비스가 정상입니다!');
  } else {
    log.error('일부 서비스에 문제가 있습니다.');
    process.exit(1);
  }
}

await checkServices();
