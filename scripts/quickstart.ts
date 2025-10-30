#!/usr/bin/env bun

/**
 * Quick Start Script
 *
 * This script provides a quick way to start the offline-first development server.
 */

import { spawn } from 'node:child_process';

const colors = {
  reset: '\u001B[0m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  cyan: '\u001B[36m',
  bright: '\u001B[1m',
  red: '\u001B[31m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

async function main() {
  log.title('Typie 빠른 시작');

  log.info('오프라인 개발 환경을 시작합니다...');
  log.success('별도의 데이터베이스나 Redis 서버가 필요하지 않습니다');
  log.success('모든 데이터는 로컬 SQLite 파일에 저장됩니다\n');

  // Start dev servers
  log.info('개발 서버를 시작합니다...');
  log.info('중지하려면 Ctrl+C를 누르세요\n');

  const devProcess = spawn('bun', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  devProcess.on('exit', (code) => {
    log.info(`\n개발 서버가 종료되었습니다 (코드: ${code})`);
    process.exit(code || 0);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    log.info('\n개발 서버를 중지합니다...');
    devProcess.kill('SIGINT');
  });
}

await main();
