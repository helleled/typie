#!/usr/bin/env bun

/**
 * Development Services Information
 *
 * This script provides information about the offline-first development setup.
 */

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
  title: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`),
};

log.title('Typie 오프라인 개발 환경');

console.log('Typie는 오프라인 우선 아키텍처를 사용합니다.\n');

log.success('로컬 SQLite 데이터베이스');
console.log('  • 별도의 데이터베이스 서버 불필요');
console.log('  • 위치: apps/api/data/typie.db');
console.log('  • 첫 실행 시 자동으로 생성 및 마이그레이션됨\n');

log.success('로컬 파일 스토리지');
console.log('  • 별도의 S3 서버 불필요');
console.log('  • 위치: apps/api/.storage');
console.log('  • 첫 실행 시 자동으로 생성됨\n');

log.success('인메모리 캐싱');
console.log('  • 별도의 Redis 서버 불필요');
console.log('  • 개발 모드에서는 메모리 기반 캐시 사용\n');

console.log(colors.bright + '빠른 시작:' + colors.reset);
console.log('  1. 의존성 설치: ' + colors.cyan + 'bun install' + colors.reset);
console.log('  2. 개발 서버 시작: ' + colors.cyan + 'bun run dev' + colors.reset);
console.log('  3. 브라우저에서 열기: ' + colors.cyan + 'http://localhost:5173' + colors.reset + '\n');

console.log(colors.bright + '선택 사항:' + colors.reset);
console.log('  • 검색 기능을 위한 Meilisearch (docker-compose up -d meilisearch)');
console.log('  • 프로덕션과 유사한 환경을 위한 PostgreSQL/Redis\n');

console.log(colors.bright + '데이터베이스 관리:' + colors.reset);
console.log('  • 데이터베이스 초기화: ' + colors.cyan + 'rm -rf apps/api/data' + colors.reset);
console.log('  • Drizzle Studio 실행: ' + colors.cyan + 'cd apps/api && bun x drizzle-kit studio' + colors.reset + '\n');
