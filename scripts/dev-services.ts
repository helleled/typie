#!/usr/bin/env bun

/**
 * Development Services Starter
 *
 * This script helps start all required services for development.
 * It provides instructions and optionally starts services in the background.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline';

const colors = {
  reset: '\u001B[0m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  cyan: '\u001B[36m',
  bright: '\u001B[1m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

function commandExists(command: string): boolean {
  try {
    const result = Bun.spawnSync(['which', command]);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

log.title('개발 서비스 시작 가이드');

console.log('다음 서비스들이 실행되어야 합니다:\n');

// PostgreSQL
if (commandExists('psql')) {
  log.success('PostgreSQL');
  console.log('  macOS: brew services start postgresql');
  console.log('  Linux: sudo systemctl start postgresql');
  console.log('  상태 확인: psql -U postgres -c "SELECT 1"\n');
} else {
  log.warn('PostgreSQL이 설치되어 있지 않습니다');
  console.log('  설치: https://www.postgresql.org/download/\n');
}

// Redis
if (commandExists('redis-server')) {
  log.success('Redis');
  console.log('  시작: redis-server');
  console.log('  상태 확인: redis-cli ping\n');

  // Redis 자동 시작 시도
  if (existsSync('/tmp/redis.pid')) {
    continueWithMeilisearch();
  } else {
    console.log('  Redis를 백그라운드에서 시작하시겠습니까? (권장)');
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('  (Y/n): ', (answer: string) => {
      if (answer.toLowerCase() !== 'n') {
        const redis = spawn('redis-server', [], {
          detached: true,
          stdio: 'ignore',
        });
        redis.unref();
        log.success('Redis가 백그라운드에서 시작되었습니다');
      }
      readline.close();
      continueWithMeilisearch();
    });
  }
} else {
  log.warn('Redis가 설치되어 있지 않습니다');
  console.log('  설치: https://redis.io/download\n');
  continueWithMeilisearch();
}

function continueWithMeilisearch() {
  // Meilisearch
  if (commandExists('meilisearch')) {
    log.success('Meilisearch (선택 사항)');
    console.log('  시작: meilisearch --master-key="masterKey"');
    console.log('  상태 확인: curl http://localhost:7700/health\n');
  } else {
    log.warn('Meilisearch가 설치되어 있지 않습니다 (선택 사항)');
    console.log('  설치: https://www.meilisearch.com/docs/learn/getting_started/installation\n');
  }

  console.log('\n' + colors.bright + '다음 단계:' + colors.reset);
  console.log('  1. 위의 서비스들을 시작하세요');
  console.log('  2. 서비스 상태 확인: ' + colors.cyan + 'bun run check-services' + colors.reset);
  console.log('  3. 개발 서버 시작: ' + colors.cyan + 'bun run dev' + colors.reset + '\n');
}
