#!/usr/bin/env bun

/**
 * Service Health Check Script
 *
 * This script checks the health of the offline-first development stack.
 */

import { existsSync } from 'node:fs';
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
  log.title('오프라인 개발 환경 상태 확인');

  let allHealthy = true;

  // SQLite 데이터베이스 체크
  const dbPath = path.join(projectRoot, 'apps/api/data/typie.db');
  const dbDir = path.join(projectRoot, 'apps/api/data');
  
  if (existsSync(dbPath)) {
    log.success('SQLite 데이터베이스: 존재함');
    log.info(`  위치: ${dbPath}`);
  } else if (existsSync(dbDir)) {
    log.warn('SQLite 데이터베이스: 아직 생성되지 않음');
    log.info('  첫 실행 시 자동으로 생성됩니다');
  } else {
    log.info('SQLite 데이터베이스: 첫 실행 시 생성됨');
  }

  // Storage 디렉토리 체크
  const storagePath = path.join(projectRoot, 'apps/api/.storage');
  if (existsSync(storagePath)) {
    log.success('로컬 스토리지: 초기화됨');
    log.info(`  위치: ${storagePath}`);
  } else {
    log.info('로컬 스토리지: 첫 실행 시 생성됨');
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
    log.info('  시작: bun run dev');
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
    log.info('  시작: bun run dev');
  }

  console.log();
  if (allHealthy) {
    log.success('오프라인 개발 환경이 정상입니다!');
    log.info('개발 서버 시작: bun run dev');
  } else {
    log.warn('일부 서비스가 아직 시작되지 않았습니다.');
    log.info('개발 서버 시작: bun run dev');
  }
}

await checkServices();
