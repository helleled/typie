#!/usr/bin/env bun

/**
 * Typie Monorepo Setup Script
 *
 * This script automates the initial development environment setup for the Typie monorepo
 * with an offline-first architecture using SQLite and local storage.
 *
 * cspell:words psql AQAB
 */

import { execSync } from 'node:child_process';
import path from 'node:path';

// ANSI 색상 코드
const colors = {
  reset: '\u001B[0m',
  bright: '\u001B[1m',
  dim: '\u001B[2m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m',
  white: '\u001B[37m',
};

// 로깅 헬퍼
const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}${colors.bright}▶ ${msg}${colors.reset}`),
  title: (msg: string) => console.log(`\n${colors.magenta}${colors.bright}━━━ ${msg} ━━━${colors.reset}\n`),
};

// 프로젝트 루트 경로
const projectRoot = path.join(import.meta.dir, '..');

// 명령어 실행 헬퍼
const exec = (command: string, options?: { cwd?: string; silent?: boolean }): string => {
  const result = execSync(command, {
    cwd: options?.cwd || projectRoot,
    encoding: 'utf8',
    stdio: options?.silent ? 'pipe' : 'inherit',
  });
  return result;
};

// 명령어 존재 여부 확인
const commandExists = (command: string): boolean => {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

// 버전 비교 헬퍼
const compareVersions = (version: string, required: string): boolean => {
  const v1 = version.split('.').map((n) => Number.parseInt(n, 10));
  const v2 = required.split('.').map((n) => Number.parseInt(n, 10));

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }
  return true;
};

// 1. 환경 체크
async function checkEnvironment() {
  log.step('환경 체크 중...');

  const checks = [
    {
      name: 'Bun',
      command: 'bun',
      versionCommand: 'bun --version',
      requiredVersion: '1.0.0',
      installUrl: 'https://bun.sh',
    },
    {
      name: 'Node.js',
      command: 'node',
      versionCommand: 'node --version',
      requiredVersion: '22.0.0',
      installUrl: 'https://nodejs.org',
    },
  ];

  const missingTools: string[] = [];

  for (const check of checks) {
    if (!commandExists(check.command)) {
      log.error(`${check.name}이(가) 설치되어 있지 않습니다.`);
      log.info(`  설치: ${check.installUrl}`);
      missingTools.push(check.name);
      continue;
    }

    try {
      const versionOutput = exec(check.versionCommand, { silent: true });
      const versionMatch = versionOutput.match(/(\d+\.\d+\.\d+)/);

      if (versionMatch) {
        const version = versionMatch[1];
        if (compareVersions(version, check.requiredVersion)) {
          log.success(`${check.name} ${version} 설치됨`);
        } else {
          log.warn(`${check.name} ${version} (최소 ${check.requiredVersion} 권장)`);
        }
      } else {
        log.success(`${check.name} 설치됨`);
      }
    } catch {
      log.warn(`${check.name} 버전 확인 실패`);
    }
  }

  if (missingTools.length > 0) {
    log.error(`\n필수 도구가 누락되었습니다: ${missingTools.join(', ')}`);
    log.info('누락된 도구를 설치한 후 다시 실행해주세요.\n');
    process.exit(1);
  }

  log.info('오프라인 개발 모드를 사용합니다');
  log.info('  • SQLite 데이터베이스 (별도 설치 불필요)');
  log.info('  • 로컬 파일 스토리지 (별도 설치 불필요)');
  log.info('  • 인메모리 캐시 (별도 설치 불필요)');
}

// 2. 의존성 설치
async function installDependencies() {
  log.step('의존성 설치 중...');

  try {
    exec('bun install');
    log.success('의존성 설치 완료');
  } catch (err) {
    log.error('의존성 설치 실패');
    throw err;
  }
}

// 3. 빌드 단계
async function buildPackages() {
  log.step('공유 패키지 빌드 중...');

  try {
    // Sark 패키지 빌드 (다른 패키지가 의존)
    log.info('Sark 패키지 빌드 중...');
    exec('bun run build', { cwd: path.join(projectRoot, 'packages/sark') });
    log.success('Sark 빌드 완료');

    // Turbo codegen 실행 (styled-system, ui 등의 코드 생성)
    log.info('Turbo codegen 실행 중...');
    exec('turbo run codegen');
    log.success('Codegen 완료');
  } catch (err) {
    log.error('빌드 중 오류 발생');
    throw err;
  }
}

// 4. 성공 요약
function printSummary() {
  log.title('설치 완료!');

  console.log(`${colors.green}${colors.bright}🎉 Typie 오프라인 개발 환경이 성공적으로 설정되었습니다!${colors.reset}\n`);

  console.log(`${colors.bright}다음 단계:${colors.reset}`);
  console.log(`  1. ${colors.cyan}개발 서버를 시작하세요:${colors.reset}`);
  console.log(`     ${colors.dim}bun run dev${colors.reset}\n`);

  console.log(`${colors.bright}자동으로 수행되는 작업:${colors.reset}`);
  console.log(`  ✓ SQLite 데이터베이스 생성 (apps/api/data/typie.db)`);
  console.log(`  ✓ 데이터베이스 마이그레이션 실행`);
  console.log(`  ✓ 초기 데이터 시딩 (플랜 정보 등)`);
  console.log(`  ✓ 로컬 스토리지 디렉토리 생성 (apps/api/.storage)\n`);

  console.log(`${colors.bright}유용한 명령어:${colors.reset}`);
  console.log(`  ${colors.cyan}bun run dev${colors.reset}              - 모든 앱의 개발 서버 시작`);
  console.log(`  ${colors.cyan}bun run check-services${colors.reset}   - 개발 환경 상태 확인`);
  console.log(`  ${colors.cyan}bun run build${colors.reset}            - 모든 패키지 빌드`);
  console.log(`  ${colors.cyan}bun run lint:typecheck${colors.reset}   - 타입 체크`);
  console.log(`  ${colors.cyan}bun run test${colors.reset}             - 테스트 실행\n`);

  console.log(`${colors.bright}데이터베이스 관리:${colors.reset}`);
  console.log(`  ${colors.cyan}rm -rf apps/api/data${colors.reset}                    - 데이터베이스 초기화`);
  console.log(`  ${colors.cyan}cd apps/api && bun x drizzle-kit studio${colors.reset} - Drizzle Studio 실행\n`);

  console.log(`${colors.bright}엔드포인트:${colors.reset}`);
  console.log(`  - API GraphQL: ${colors.dim}http://localhost:8080/graphql${colors.reset}`);
  console.log(`  - 웹사이트: ${colors.dim}http://localhost:5173${colors.reset}\n`);

  console.log(`${colors.bright}선택 사항:${colors.reset}`);
  console.log(`  - Meilisearch 검색 엔진: ${colors.dim}docker-compose up -d meilisearch${colors.reset}`);
  console.log(`  - PostgreSQL/Redis: ${colors.dim}docker-compose up -d postgres redis${colors.reset}\n`);

  console.log(`${colors.dim}자세한 내용은 SETUP.md를 참조하세요.${colors.reset}\n`);
}

// 스크립트 실행
console.clear();

log.title('Typie 오프라인 개발 환경 설정');
console.log(`${colors.dim}Typie 모노레포의 오프라인 우선 개발 환경을 설정합니다...${colors.reset}\n`);

try {
  await checkEnvironment();
  await installDependencies();
  await buildPackages();

  printSummary();
} catch (err) {
  log.error('\n설치 중 오류가 발생했습니다.');
  if (err instanceof Error) {
    console.error(err.message);
  }
  process.exit(1);
}
