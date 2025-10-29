#!/usr/bin/env bun

/**
 * Quick Start Script
 *
 * This script provides a quick way to start all development services and the dev server.
 */

import { execSync,spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

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
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  log.title('Typie 빠른 시작');

  // Check if Docker Compose is available
  const hasDockerCompose =
    commandExists('docker-compose') ||
    (() => {
      try {
        execSync('docker compose version', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    })();

  if (hasDockerCompose) {
    log.info('Docker Compose를 사용하여 서비스를 시작합니다...');

    try {
      // Check if services are already running
      const servicesRunning = (() => {
        try {
          const result = execSync('docker-compose ps -q', { encoding: 'utf8' });
          return result.trim().length > 0;
        } catch {
          return false;
        }
      })();

      if (servicesRunning) {
        log.success('서비스가 이미 실행 중입니다');
      } else {
        execSync('docker-compose up -d', { stdio: 'inherit' });
        log.success('서비스가 시작되었습니다');

        // Wait a bit for services to be ready
        log.info('서비스가 준비될 때까지 대기 중...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch {
      log.error('Docker Compose 서비스 시작 실패');
      log.info('수동으로 서비스를 시작하세요: bun run dev-services');
    }
  } else {
    log.warn('Docker Compose를 사용할 수 없습니다');
    log.info('서비스 시작 가이드를 확인하세요: bun run dev-services');
  }

  // Check if .env files exist
  const apiEnvExists = existsSync('apps/api/.env');
  const websiteEnvExists = existsSync('apps/website/.env');

  if (!apiEnvExists || !websiteEnvExists) {
    log.warn('환경 변수 파일이 없습니다');
    log.info('설치 스크립트를 실행하세요: bun run setup');
    process.exit(1);
  }

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
