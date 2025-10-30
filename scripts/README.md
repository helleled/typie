# 개발 스크립트

이 디렉토리에는 Typie 모노레포의 오프라인 우선 개발 환경을 돕는 스크립트가 포함되어 있습니다.

## 스크립트 목록

### `setup.ts`

**목적**: 오프라인 개발 환경 자동 설정

**사용법**:

```bash
bun run setup
# 또는
bun run scripts/setup.ts
```

**수행 작업**:

1. ✅ 필수 도구 확인 (Bun, Node.js)
2. ✅ 의존성 설치 (`bun install`)
3. ✅ 공유 패키지 빌드 (Sark, styled-system 등)
4. ✅ 오프라인 개발 정보 출력

**특징**:

- PostgreSQL/Redis 설치 불필요
- 인터랙티브 프롬프트 없음
- 빠르고 간단한 설정
- 컬러풀한 출력과 진행 상황 표시

**참고**: 데이터베이스 마이그레이션과 시딩은 `bun run dev` 실행 시 자동으로 수행됩니다.

---

### `check-services.ts`

**목적**: 오프라인 개발 환경 상태 확인

**사용법**:

```bash
bun run check-services
# 또는
bun run scripts/check-services.ts
```

**확인 항목**:

- SQLite 데이터베이스 파일 존재 여부
- 로컬 스토리지 디렉토리 존재 여부
- API 서버 상태
- Website 서버 상태

**출력 예시**:

```
오프라인 개발 환경 상태 확인

✓ SQLite 데이터베이스: 존재함
  위치: apps/api/data/typie.db
✓ 로컬 스토리지: 초기화됨
  위치: apps/api/.storage
ℹ API 서버: 실행 중이지 않음
  시작: bun run dev
ℹ Website: 실행 중이지 않음
  시작: bun run dev
```

---

### `dev-services.ts`

**목적**: 오프라인 개발 환경 정보 제공

**사용법**:

```bash
bun run dev-services
# 또는
bun run scripts/dev-services.ts
```

**제공 정보**:

- 오프라인 아키텍처 설명
- SQLite 데이터베이스 정보
- 로컬 스토리지 정보
- 인메모리 캐시 정보
- 빠른 시작 가이드
- 데이터베이스 관리 명령어

**출력 예시**:

```
Typie 오프라인 개발 환경

Typie는 오프라인 우선 아키텍처를 사용합니다.

✓ 로컬 SQLite 데이터베이스
  • 별도의 데이터베이스 서버 불필요
  • 위치: apps/api/data/typie.db
  • 첫 실행 시 자동으로 생성 및 마이그레이션됨

✓ 로컬 파일 스토리지
  • 별도의 S3 서버 불필요
  • 위치: apps/api/.storage
  • 첫 실행 시 자동으로 생성됨

빠른 시작:
  1. 의존성 설치: bun install
  2. 개발 서버 시작: bun run dev
```

---

### `quickstart.ts`

**목적**: 개발 서버를 빠르게 시작

**사용법**:

```bash
bun run quickstart
# 또는
bun run scripts/quickstart.ts
```

**수행 작업**:

1. 오프라인 개발 정보 출력
2. 개발 서버 자동 시작 (`bun run dev`)

**특징**:

- Docker Compose 불필요
- 외부 서비스 체크 없음
- Ctrl+C로 정상 종료

---

## 사용 시나리오

### 처음 설정할 때

```bash
# 1. 저장소 클론
git clone <repo-url>
cd typie

# 2. 의존성 설치 및 빌드
bun run setup

# 3. 개발 서버 시작
bun run dev
```

또는 더 간단하게:

```bash
# 한 번에!
bun install && bun run dev
```

### 매일 개발할 때

```bash
# 개발 서버 시작
bun run dev

# 또는 빠른 시작
bun run quickstart
```

### 문제가 있을 때

```bash
# 환경 상태 확인
bun run check-services

# 환경 정보 보기
bun run dev-services

# 데이터베이스 초기화
rm -rf apps/api/data
bun run dev  # 자동 재생성
```

## 환경 변수

오프라인 개발에는 환경 변수가 **필요하지 않습니다**.

### 기본 설정 (환경 변수 없음)

모든 것이 자동으로 설정됩니다:
- SQLite: `apps/api/data/typie.db`
- 로컬 스토리지: `apps/api/.storage`
- 인메모리 캐시: Redis 없이 동작

### 선택 사항: 프로덕션 환경 시뮬레이션

PostgreSQL/Redis를 사용하려는 경우:

#### `.env.local` (루트 디렉토리)

```env
# PostgreSQL (선택 사항)
DATABASE_URL=postgresql://typie:typie@localhost:5432/typie

# Redis (선택 사항)
REDIS_URL=redis://localhost:6379

# Meilisearch (선택 사항)
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

## Docker Compose (선택 사항)

프로덕션과 유사한 환경이 필요한 경우에만:

```bash
# 외부 서비스 시작
docker-compose up -d postgres redis meilisearch

# 환경 변수 설정
cat > .env.local << EOF
DATABASE_URL=postgresql://typie:typie@localhost:5432/typie
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
EOF

# 개발 시작
bun run dev
```

**참고**: 대부분의 경우 Docker 없이 바로 개발할 수 있습니다.

## 문제 해결

### 빌드 오류

```bash
# node_modules 재설치
rm -rf node_modules
bun install

# 빌드 캐시 삭제
rm -rf .turbo
turbo run build --force
```

### 데이터베이스 오류

```bash
# SQLite 데이터베이스 초기화
rm -rf apps/api/data
bun run dev  # 자동 재생성
```

### 포트 충돌

```bash
# 포트 사용 프로세스 찾기
lsof -i :8080  # API 서버
lsof -i :5173  # 웹사이트

# 프로세스 종료
kill -9 <PID>
```

### "styled-system not found"

```bash
# styled-system 생성
cd packages/styled-system
bun run codegen
```

## 데이터베이스 관리

### 초기화 (모든 데이터 삭제)

```bash
rm -rf apps/api/data
bun run dev  # 자동으로 재생성 및 시딩
```

### Drizzle Studio로 확인

```bash
cd apps/api
bun x drizzle-kit studio
# 브라우저에서 https://local.drizzle.studio 열기
```

### 수동 시딩

```bash
cd apps/api
bun run scripts/seed.ts
```

## 오프라인 vs 프로덕션 환경

### 오프라인 개발 (기본)
- ✅ SQLite 데이터베이스
- ✅ 로컬 파일 스토리지
- ✅ 인메모리 캐시
- ✅ 별도 서비스 불필요
- ✅ 빠른 시작

### 프로덕션 시뮬레이션 (선택)
- PostgreSQL 데이터베이스
- Redis 캐시
- Meilisearch 검색
- Docker Compose 필요
- 환경 변수 설정 필요

## 추가 리소스

- [SETUP.md](../SETUP.md) - 상세한 설정 가이드
- [ENVIRONMENT.md](../ENVIRONMENT.md) - 환경 변수 가이드
- [LOCALHOST_VERIFICATION_REPORT.md](../LOCALHOST_VERIFICATION_REPORT.md) - 오프라인 설정 보고서
- [README.md](../README.md) - 프로젝트 개요

## 핵심 철학

**"bun install && bun run dev만으로 충분합니다"**

별도의 데이터베이스, Redis, Docker 설정 없이 바로 개발을 시작할 수 있는 것이 Typie 오프라인 개발 환경의 핵심 철학입니다.
