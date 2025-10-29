#!/usr/bin/env bun

/**
 * Typie Monorepo Setup Script
 *
 * This script automates the initial development environment setup for the Typie monorepo.
 * It checks for required tools, installs dependencies, configures environments, sets up the database,
 * and builds shared packages.
 *
 * cspell:words psql AQAB
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';

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

// readline 인터페이스 생성
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 사용자 입력 받기
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}?${colors.reset} ${question}: `, (answer) => {
      resolve(answer.trim());
    });
  });
};

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

  // Docker Compose 체크 (선택 사항이지만 권장)
  const hasDockerCompose =
    commandExists('docker-compose') ||
    (commandExists('docker') &&
      (() => {
        try {
          execSync('docker compose version', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      })());

  if (hasDockerCompose) {
    log.success('Docker Compose 사용 가능');
    log.info('  Docker Compose를 사용하면 서비스를 쉽게 시작할 수 있습니다: docker-compose up -d');
  }

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
    {
      name: 'PostgreSQL',
      command: 'psql',
      versionCommand: 'psql --version',
      requiredVersion: '12.0.0',
      installUrl: 'https://www.postgresql.org/download/',
      optional: hasDockerCompose,
    },
    {
      name: 'Redis',
      command: 'redis-cli',
      versionCommand: 'redis-cli --version',
      requiredVersion: '6.0.0',
      installUrl: 'https://redis.io/download',
      optional: hasDockerCompose,
    },
  ];

  const missingTools: string[] = [];

  for (const check of checks) {
    if (!commandExists(check.command)) {
      if (check.optional) {
        log.warn(`${check.name}이(가) 설치되어 있지 않습니다 (선택 사항)`);
        log.info(`  설치: ${check.installUrl}`);
      } else {
        log.error(`${check.name}이(가) 설치되어 있지 않습니다.`);
        log.info(`  설치: ${check.installUrl}`);
        missingTools.push(check.name);
      }
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

  // Meilisearch는 선택 사항으로 체크
  if (commandExists('meilisearch')) {
    log.success('Meilisearch 설치됨');
  } else {
    log.warn('Meilisearch가 설치되어 있지 않습니다 (선택 사항)');
    log.info('  설치: https://www.meilisearch.com/docs/learn/getting_started/installation');
  }

  // Doppler는 선택 사항
  if (commandExists('doppler')) {
    log.success('Doppler CLI 설치됨');
  } else {
    log.warn('Doppler CLI가 설치되어 있지 않습니다 (선택 사항)');
    log.info('  설치: https://docs.doppler.com/docs/install-cli');
  }

  if (missingTools.length > 0) {
    log.error(`\n필수 도구가 누락되었습니다: ${missingTools.join(', ')}`);
    log.info('누락된 도구를 설치한 후 다시 실행해주세요.\n');
    process.exit(1);
  }
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

// 3. 환경 변수 설정
async function setupEnvironment() {
  log.step('환경 변수 설정 중...');

  // API 환경 변수 설정
  const apiEnvPath = path.join(projectRoot, 'apps/api/.env');

  if (existsSync(apiEnvPath)) {
    log.info('API .env 파일이 이미 존재합니다. 건너뜁니다.');
  } else {
    log.info('API 환경 변수를 설정합니다...');

    const databaseUrl = await prompt('PostgreSQL 연결 URL (예: postgresql://user:password@localhost:5432/typie)');
    const redisUrl = (await prompt('Redis 연결 URL (기본값: redis://localhost:6379)')) || 'redis://localhost:6379';
    const meilisearchUrl = (await prompt('Meilisearch URL (기본값: http://localhost:7700)')) || 'http://localhost:7700';
    const meilisearchApiKey = (await prompt('Meilisearch API Key (기본값: masterKey)')) || 'masterKey';

    const apiEnv = `# 데이터베이스
DATABASE_URL=${databaseUrl}

# Redis
REDIS_URL=${redisUrl}

# Meilisearch
MEILISEARCH_URL=${meilisearchUrl}
MEILISEARCH_API_KEY=${meilisearchApiKey}

# 서버 설정
LISTEN_PORT=8080
AUTH_URL=http://localhost:5173
WEBSITE_URL=http://localhost:5173
USERSITE_URL=http://localhost:5173

# OAuth (개발용 더미 값 - 실제 사용시 실제 값으로 교체)
OIDC_CLIENT_ID=dev-client-id
OIDC_CLIENT_SECRET=dev-client-secret
OIDC_JWK={"kty":"RSA","n":"dummy","e":"AQAB","d":"dummy","p":"dummy","q":"dummy","dp":"dummy","dq":"dummy","qi":"dummy"}

GOOGLE_OAUTH_CLIENT_ID=dummy
GOOGLE_OAUTH_CLIENT_SECRET=dummy
KAKAO_CLIENT_ID=dummy
KAKAO_CLIENT_SECRET=dummy
NAVER_CLIENT_ID=dummy
NAVER_CLIENT_SECRET=dummy

# Apple (개발용 더미 값)
APPLE_TEAM_ID=dummy
APPLE_SIGN_IN_KEY_ID=dummy
APPLE_SIGN_IN_PRIVATE_KEY=dummy
APPLE_APP_APPLE_ID=0
APPLE_APP_BUNDLE_ID=dummy
APPLE_IAP_ISSUER_ID=dummy
APPLE_IAP_KEY_ID=dummy
APPLE_IAP_PRIVATE_KEY=dummy

# 결제 (개발용 더미 값)
PORTONE_API_SECRET=dummy
PORTONE_CHANNEL_KEY=dummy

# Google Play (개발용 더미 값)
GOOGLE_PLAY_PACKAGE_NAME=dummy
GOOGLE_SERVICE_ACCOUNT={}

# 기타 서비스 (개발용 더미 값)
ANTHROPIC_API_KEY=dummy
GITHUB_TOKEN=dummy
IFRAMELY_API_KEY=dummy
SLACK_BOT_TOKEN=dummy
SLACK_SIGNING_SECRET=dummy
SLACK_WEBHOOK_URL=dummy
SPELLCHECK_API_KEY=dummy
SPELLCHECK_URL=http://localhost:8081
`;

    writeFileSync(apiEnvPath, apiEnv);
    log.success('API .env 파일 생성 완료');
  }

  // Website 환경 변수 설정
  const websiteEnvPath = path.join(projectRoot, 'apps/website/.env');

  if (existsSync(websiteEnvPath)) {
    log.info('Website .env 파일이 이미 존재합니다. 건너뜁니다.');
  } else {
    log.info('Website 환경 변수를 설정합니다...');

    const websiteEnv = `# Public 환경 변수
PUBLIC_AUTH_URL=http://localhost:5173
PUBLIC_WEBSITE_URL=http://localhost:5173
PUBLIC_USERSITE_HOST=localhost:5173
PUBLIC_API_URL=http://localhost:8080
PUBLIC_ENVIRONMENT=local

# Sentry (선택 사항)
# SENTRY_DSN=
`;

    writeFileSync(websiteEnvPath, websiteEnv);
    log.success('Website .env 파일 생성 완료');
  }
}

// 4. 데이터베이스 설정
async function setupDatabase() {
  log.step('데이터베이스 설정 중...');

  // 데이터베이스 연결 테스트
  try {
    const apiEnvPath = path.join(projectRoot, 'apps/api/.env');
    if (!existsSync(apiEnvPath)) {
      log.warn('API .env 파일이 없습니다. 데이터베이스 설정을 건너뜁니다.');
      return;
    }

    const envContent = readFileSync(apiEnvPath, 'utf8');
    const databaseUrlMatch = envContent.match(/DATABASE_URL=(.+)/);

    if (!databaseUrlMatch) {
      log.warn('DATABASE_URL을 찾을 수 없습니다.');
      return;
    }

    const databaseUrl = databaseUrlMatch[1].trim();

    // PostgreSQL 연결 테스트
    log.info('PostgreSQL 연결 테스트 중...');
    try {
      // URL에서 연결 정보 추출
      const urlObj = new URL(databaseUrl);
      const testCommand = `PGPASSWORD="${urlObj.password}" psql -h ${urlObj.hostname} -p ${urlObj.port || 5432} -U ${urlObj.username} -d ${urlObj.pathname.slice(1)} -c "SELECT 1" > /dev/null 2>&1`;

      execSync(testCommand, { stdio: 'pipe' });
      log.success('PostgreSQL 연결 성공');
    } catch {
      log.error('PostgreSQL 연결 실패');
      log.warn('데이터베이스가 실행 중인지 확인하고, 데이터베이스가 생성되어 있는지 확인하세요.');
      const continueSetup = await prompt('계속하시겠습니까? (y/N)');
      if (continueSetup.toLowerCase() !== 'y') {
        process.exit(1);
      }
      return;
    }

    // 마이그레이션 실행
    log.info('데이터베이스 마이그레이션 실행 중...');
    try {
      exec('bun drizzle-kit migrate', { cwd: path.join(projectRoot, 'apps/api') });
      log.success('마이그레이션 완료');
    } catch (err) {
      log.error('마이그레이션 실패');
      throw err;
    }

    // 시드 데이터 삽입 여부 확인
    const shouldSeed = await prompt('시드 데이터를 삽입하시겠습니까? (Y/n)');
    if (shouldSeed.toLowerCase() !== 'n') {
      log.info('시드 데이터 삽입 중...');
      try {
        exec('bun run scripts/seed.ts', { cwd: path.join(projectRoot, 'apps/api') });
        log.success('시드 데이터 삽입 완료');
      } catch {
        log.warn('시드 데이터 삽입 실패 (이미 존재할 수 있습니다)');
      }
    }
  } catch {
    log.error('데이터베이스 설정 중 오류 발생');
    log.warn('나중에 수동으로 마이그레이션을 실행하세요: cd apps/api && bun drizzle-kit migrate');
  }
}

// 5. 서비스 검증
async function verifyServices() {
  log.step('서비스 연결 확인 중...');

  // Redis 연결 테스트
  try {
    exec('redis-cli ping', { silent: true });
    log.success('Redis 연결 성공');
  } catch {
    log.warn('Redis에 연결할 수 없습니다. Redis가 실행 중인지 확인하세요.');
    log.info('  시작: redis-server');
  }

  // Meilisearch 연결 테스트
  if (commandExists('meilisearch')) {
    try {
      const apiEnvPath = path.join(projectRoot, 'apps/api/.env');
      if (existsSync(apiEnvPath)) {
        const envContent = readFileSync(apiEnvPath, 'utf8');
        const meilisearchUrlMatch = envContent.match(/MEILISEARCH_URL=(.+)/);

        if (meilisearchUrlMatch) {
          const meilisearchUrl = meilisearchUrlMatch[1].trim();
          const response = await fetch(`${meilisearchUrl}/health`);

          if (response.ok) {
            log.success('Meilisearch 연결 성공');
          } else {
            throw new Error('Health check failed');
          }
        }
      }
    } catch {
      log.warn('Meilisearch에 연결할 수 없습니다. Meilisearch가 실행 중인지 확인하세요.');
      log.info('  시작: meilisearch --master-key="masterKey"');
    }
  }
}

// 6. 빌드 단계
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

// 7. 성공 요약
function printSummary() {
  log.title('설치 완료!');

  console.log(`${colors.green}${colors.bright}🎉 Typie 개발 환경이 성공적으로 설정되었습니다!${colors.reset}\n`);

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

  console.log(`${colors.bright}다음 단계:${colors.reset}`);

  if (hasDockerCompose) {
    console.log(`  1. ${colors.cyan}Docker Compose로 서비스 시작 (권장):${colors.reset}`);
    console.log(`     ${colors.dim}docker-compose up -d${colors.reset}`);
    console.log(`     ${colors.dim}# PostgreSQL, Redis, Meilisearch가 자동으로 시작됩니다${colors.reset}\n`);
  } else {
    console.log(`  1. ${colors.cyan}PostgreSQL을 시작하세요:${colors.reset}`);
    console.log(`     ${colors.dim}brew services start postgresql (macOS)${colors.reset}`);
    console.log(`     ${colors.dim}sudo systemctl start postgresql (Linux)${colors.reset}\n`);

    console.log(`  2. ${colors.cyan}Redis를 시작하세요:${colors.reset}`);
    console.log(`     ${colors.dim}redis-server${colors.reset}\n`);

    console.log(`  3. ${colors.cyan}Meilisearch를 시작하세요 (선택 사항):${colors.reset}`);
    console.log(`     ${colors.dim}meilisearch --master-key="masterKey"${colors.reset}\n`);
  }

  const nextStep = hasDockerCompose ? '2' : '4';
  console.log(`  ${nextStep}. ${colors.cyan}개발 서버를 시작하세요:${colors.reset}`);
  console.log(`     ${colors.dim}bun run dev${colors.reset}     # 모든 앱 시작`);
  console.log(`     ${colors.dim}또는${colors.reset}`);
  console.log(`     ${colors.dim}cd apps/api && bun run dev${colors.reset}      # API 서버만`);
  console.log(`     ${colors.dim}cd apps/website && bun run dev${colors.reset}  # 웹사이트만\n`);

  console.log(`${colors.bright}유용한 명령어:${colors.reset}`);
  if (hasDockerCompose) {
    console.log(`  ${colors.cyan}docker-compose ps${colors.reset}         - 서비스 상태 확인`);
    console.log(`  ${colors.cyan}docker-compose logs -f${colors.reset}    - 서비스 로그 확인`);
    console.log(`  ${colors.cyan}docker-compose down${colors.reset}       - 서비스 중지\n`);
  }
  console.log(`  ${colors.cyan}bun run check-services${colors.reset}   - 서비스 연결 확인`);
  console.log(`  ${colors.cyan}bun run dev${colors.reset}              - 모든 앱의 개발 서버 시작`);
  console.log(`  ${colors.cyan}bun run build${colors.reset}            - 모든 패키지 빌드`);
  console.log(`  ${colors.cyan}bun run lint:typecheck${colors.reset}   - 타입 체크`);
  console.log(`  ${colors.cyan}bun run test${colors.reset}             - 테스트 실행\n`);

  console.log(`${colors.bright}엔드포인트:${colors.reset}`);
  console.log(`  - API GraphQL: ${colors.dim}http://localhost:8080/graphql${colors.reset}`);
  console.log(`  - 웹사이트: ${colors.dim}http://localhost:5173${colors.reset}\n`);

  console.log(`${colors.dim}자세한 내용은 SETUP.md를 참조하세요.${colors.reset}\n`);
}

// 스크립트 실행
console.clear();

log.title('Typie 개발 환경 설정');
console.log(`${colors.dim}Typie 모노레포의 개발 환경을 설정합니다...${colors.reset}\n`);

try {
  await checkEnvironment();
  await installDependencies();
  await setupEnvironment();
  await setupDatabase();
  await verifyServices();
  await buildPackages();

  printSummary();
} catch (err) {
  log.error('\n설치 중 오류가 발생했습니다.');
  if (err instanceof Error) {
    console.error(err.message);
  }
  process.exit(1);
} finally {
  rl.close();
}
