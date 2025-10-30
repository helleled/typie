# Typie 개발 환경 설정 가이드

이 가이드는 Typie 모노레포의 개발 환경을 설정하는 방법을 설명합니다.

## 빠른 시작

자동 설정 스크립트를 사용하여 개발 환경을 빠르게 설정할 수 있습니다:

```bash
bun run setup
```

이 스크립트는 다음을 자동으로 수행합니다:

- ✅ 필수 도구 확인 (Bun, Node.js, PostgreSQL, Redis 등)
- ✅ 의존성 설치
- ✅ 환경 변수 설정
- ✅ 데이터베이스 마이그레이션
- ✅ 서비스 연결 확인
- ✅ 공유 패키지 빌드

## Docker Compose를 사용한 빠른 시작 (권장)

Docker와 Docker Compose가 설치되어 있다면, 필요한 서비스를 빠르게 시작할 수 있습니다:

```bash
# 모든 서비스 시작 (PostgreSQL, Redis, Meilisearch)
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 서비스 중지
docker-compose down

# 데이터와 함께 서비스 제거
docker-compose down -v
```

Docker Compose를 사용하면 다음 서비스가 자동으로 실행됩니다:

- **PostgreSQL** (포트 5432) - 데이터베이스
- **Redis** (포트 6379) - 캐시 및 PubSub
- **Meilisearch** (포트 7700) - 검색 엔진

### 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성하거나 제공된 예제 파일을 복사합니다:

```bash
cp .env.local.example .env.local
```

기본 설정은 Docker Compose의 서비스 URL과 연동되도록 이미 설정되어 있습니다:

```env
DATABASE_URL=postgresql://typie:typie@localhost:5432/typie
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

환경 변수에 대한 자세한 설명은 [ENVIRONMENT.md](./ENVIRONMENT.md)를 참조하세요.

## 수동 설정

Docker Compose를 사용하지 않고 수동으로 설정하려면 다음 단계를 따르세요.

### 1. 필수 도구 설치

#### Bun (1.3.0+)

```bash
curl -fsSL https://bun.sh/install | bash
```

#### Node.js (22+)

```bash
# nvm 사용
nvm install 22
nvm use 22

# 또는 공식 웹사이트에서 다운로드
# https://nodejs.org
```

#### PostgreSQL (12+)

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# 데이터베이스 생성
createdb typie
```

#### Redis (6+)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

#### Meilisearch (선택 사항)

```bash
# macOS
brew install meilisearch

# 또는 직접 다운로드
# https://www.meilisearch.com/docs/learn/getting_started/installation
```

#### Doppler CLI (선택 사항)

```bash
# macOS
brew install dopplerhq/cli/doppler

# 기타 플랫폼
# https://docs.doppler.com/docs/install-cli
```

### 2. 의존성 설치

```bash
bun install
```

### 3. 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성하거나, 각 앱의 `.env.example` 파일을 복사하여 사용합니다:

```bash
# 방법 1: 루트 디렉토리에서 (권장)
cp .env.local.example .env.local

# 방법 2: 각 앱별로 설정
cd apps/api && cp .env.example .env
cd ../website && cp .env.example .env
cd ../desktop && cp .env.example .env
cd ../mobile && cp .env.example .env
```

기본 설정에는 로컬 개발에 필요한 모든 설정이 포함되어 있습니다:

- PostgreSQL: `postgresql://typie:typie@localhost:5432/typie`
- Redis: `redis://localhost:6379`
- Meilisearch: `http://localhost:7700` (API 키: `masterKey`)
- 서비스 URL: `http://localhost:5173` (웹사이트), `http://localhost:8080` (API)
- OAuth: 개발용 더미 값 (실제 로그인 없이 테스트 가능)

**상세한 환경 변수 설명은 [ENVIRONMENT.md](./ENVIRONMENT.md)를 참조하세요.**

### 4. 데이터베이스 마이그레이션

```bash
cd apps/api
bun drizzle-kit migrate
```

### 5. 시드 데이터 삽입 (선택 사항)

```bash
cd apps/api
bun run scripts/seed.ts
```

### 6. 공유 패키지 빌드

```bash
# Sark 패키지 빌드
cd packages/sark
bun run build

# Turbo codegen 실행 (styled-system, ui 등)
cd ../..
turbo run codegen
```

## 개발 서버 실행

### 모든 앱 실행

```bash
bun run dev
```

### 개별 앱 실행

```bash
# API 서버
cd apps/api
bun run dev

# API 서버 (Doppler 사용)
cd apps/api
bun run dev:doppler

# 웹사이트
cd apps/website
bun run dev

# 모바일 (Flutter)
cd apps/mobile
flutter run
```

**참고:** API 서버는 기본적으로 `.env` 파일에서 환경 변수를 로드합니다. Doppler를 사용하려면 `dev:doppler` 스크립트를 사용하세요.

## 서비스 시작

개발 시 필요한 서비스들을 시작하세요:

```bash
# Redis
redis-server

# Meilisearch
meilisearch --master-key="masterKey"

# PostgreSQL (보통 백그라운드에서 실행 중)
# macOS
brew services start postgresql@16
# Linux
sudo systemctl start postgresql
```

## 사용 가능한 명령어

```bash
# 개발 환경
bun run setup          # 개발 환경 자동 설정
bun run dev-services   # 필요한 서비스 시작 가이드
bun run check-services # 서비스 상태 확인

# 개발
bun run dev   # 모든 앱의 개발 서버 시작
bun run build # 모든 패키지 빌드

# 린트 및 타입 체크
bun run lint:typecheck # 타입 체크
bun run lint:eslint    # ESLint 실행
bun run lint:prettier  # Prettier 체크
bun run lint:svelte    # Svelte 컴포넌트 체크
bun run lint:syncpack  # 패키지 버전 동기화 체크

# 테스트
bun run test # 테스트 실행

# Git 훅
bun run bootstrap # Lefthook 설치
```

## 프로젝트 구조

```
typie/
├── apps/
│   ├── api/              # Hono + GraphQL Yoga API
│   ├── website/          # SvelteKit 웹 애플리케이션
│   ├── mobile/           # Flutter 모바일 앱
│   ├── desktop/          # Tauri 데스크톱 앱
│   └── ...
├── packages/
│   ├── ui/               # 공유 Svelte UI 컴포넌트
│   ├── styled-system/    # PandaCSS 디자인 토큰
│   ├── lib/              # 공유 유틸리티
│   ├── sark/             # GraphQL/툴링 유틸리티
│   └── ...
├── crates/               # Rust 크레이트
└── scripts/
    └── setup.ts          # 자동 설정 스크립트
```

## 엔드포인트

- **API GraphQL Playground**: http://localhost:8080/graphql
- **웹사이트**: http://localhost:5173
- **API 상태**: http://localhost:8080/health

## 문제 해결

### PostgreSQL 연결 실패

```bash
# PostgreSQL이 실행 중인지 확인
psql -U postgres -c "SELECT 1"

# 데이터베이스가 존재하는지 확인
psql -U postgres -l | grep typie

# 데이터베이스 생성
createdb typie
```

### Redis 연결 실패

```bash
# Redis가 실행 중인지 확인
redis-cli ping
# 응답: PONG

# Redis 시작
redis-server
```

### 빌드 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
bun install

# 빌드 캐시 삭제
rm -rf .turbo
turbo run build --force
```

### 마이그레이션 오류

```bash
# 마이그레이션 상태 확인
cd apps/api
bun drizzle-kit studio

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
psql -U postgres -c "DROP DATABASE typie; CREATE DATABASE typie;"
bun drizzle-kit migrate
```

## 추가 리소스

- [Bun 문서](https://bun.sh/docs)
- [Hono 문서](https://hono.dev)
- [SvelteKit 문서](https://kit.svelte.dev)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [PandaCSS 문서](https://panda-css.com)

## 문의

문제가 발생하거나 질문이 있으면 팀에 문의하세요.
