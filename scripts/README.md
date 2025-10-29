# 개발 스크립트

이 디렉토리에는 Typie 모노레포 개발을 돕는 다양한 스크립트가 포함되어 있습니다.

## 스크립트 목록

### `setup.ts`

**목적**: 개발 환경 자동 설정

**사용법**:

```bash
bun run setup
# 또는
bun run scripts/setup.ts
```

**수행 작업**:

1. ✅ 필수 도구 확인 (Bun, Node.js, PostgreSQL, Redis, Meilisearch)
2. ✅ 의존성 설치 (`bun install`)
3. ✅ 환경 변수 설정 (`.env` 파일 생성)
4. ✅ 데이터베이스 마이그레이션
5. ✅ 시드 데이터 삽입 (선택 사항)
6. ✅ 서비스 연결 확인
7. ✅ 공유 패키지 빌드

**특징**:

- 인터랙티브 프롬프트로 설정 값 입력
- Docker Compose 자동 감지
- 컬러풀한 출력과 진행 상황 표시
- 오류 처리 및 도움말 제공

---

### `check-services.ts`

**목적**: 개발에 필요한 모든 서비스의 상태 확인

**사용법**:

```bash
bun run check-services
# 또는
bun run scripts/check-services.ts
```

**확인 항목**:

- PostgreSQL 연결
- Redis 연결
- Meilisearch 연결 (선택 사항)
- API 서버 상태
- Website 서버 상태

**출력 예시**:

```
서비스 상태 확인

✓ PostgreSQL: 연결 성공
✓ Redis: 연결 성공
⚠ Meilisearch: 연결 실패 (선택 사항)
ℹ API 서버: 실행 중이지 않음
ℹ Website: 실행 중이지 않음
```

---

### `dev-services.ts`

**목적**: 개발에 필요한 서비스 시작 가이드

**사용법**:

```bash
bun run dev-services
# 또는
bun run scripts/dev-services.ts
```

**제공 정보**:

- 각 서비스의 설치 상태
- 서비스 시작 명령어
- 상태 확인 방법
- Redis 자동 시작 옵션 (선택적)

**출력 예시**:

```
개발 서비스 시작 가이드

✓ PostgreSQL
  macOS: brew services start postgresql
  Linux: sudo systemctl start postgresql
  상태 확인: psql -U postgres -c "SELECT 1"

✓ Redis
  시작: redis-server
  상태 확인: redis-cli ping

⚠ Meilisearch (선택 사항)
  시작: meilisearch --master-key="masterKey"
```

---

### `quickstart.ts`

**목적**: Docker Compose와 개발 서버를 한 번에 시작

**사용법**:

```bash
bun run quickstart
# 또는
bun run scripts/quickstart.ts
```

**수행 작업**:

1. Docker Compose 확인 및 서비스 시작
2. 환경 변수 파일 존재 확인
3. 개발 서버 자동 시작 (`bun run dev`)

**특징**:

- Docker Compose가 있으면 자동으로 서비스 시작
- 이미 실행 중인 서비스는 재시작하지 않음
- Ctrl+C로 정상 종료

---

## 사용 시나리오

### 처음 설정할 때

```bash
# 1. 전체 환경 설정 (처음 한 번만)
bun run setup

# 2. 서비스 시작 (Docker Compose 사용)
docker-compose up -d

# 3. 개발 서버 시작
bun run dev
```

### 매일 개발할 때

```bash
# 빠른 시작 (서비스 + 개발 서버)
bun run quickstart

# 또는 개별적으로
docker-compose up -d # 서비스 시작
bun run dev          # 개발 서버 시작
```

### 문제가 있을 때

```bash
# 서비스 상태 확인
bun run check-services

# 서비스 시작 가이드 보기
bun run dev-services

# 전체 환경 재설정
bun run setup
```

## 환경 변수

스크립트들은 다음 환경 변수 파일을 사용합니다:

### `apps/api/.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/typie
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
# ... 기타 설정
```

### `apps/website/.env`

```env
PUBLIC_AUTH_URL=http://localhost:5173
PUBLIC_WEBSITE_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:8080
PUBLIC_ENVIRONMENT=local
```

## Docker Compose

`docker-compose.yml` 파일은 다음 서비스를 제공합니다:

- **PostgreSQL** (포트 5432)
  - 사용자: `typie`
  - 비밀번호: `typie`
  - 데이터베이스: `typie`

- **Redis** (포트 6379)
  - 기본 설정

- **Meilisearch** (포트 7700)
  - 마스터 키: `masterKey`
  - 개발 모드

## 문제 해결

### "필수 도구가 누락되었습니다"

Docker Compose를 사용하면 PostgreSQL과 Redis를 로컬에 설치하지 않아도 됩니다:

```bash
# Docker Compose 설치 (macOS)
brew install docker docker-compose

# Docker Compose로 서비스 시작
docker-compose up -d
```

### ".env 파일이 없음"

```bash
# setup 스크립트로 환경 변수 파일 생성
bun run setup
```

### "데이터베이스 연결 실패"

```bash
# Docker Compose 사용 시
docker-compose restart postgres

# 로컬 PostgreSQL 사용 시
brew services restart postgresql
```

### "Redis 연결 실패"

```bash
# Docker Compose 사용 시
docker-compose restart redis

# 로컬 Redis 사용 시
redis-server
```

## 추가 리소스

- [SETUP.md](../SETUP.md) - 상세한 설정 가이드
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 기여 가이드
- [README.md](../README.md) - 프로젝트 개요

## 피드백

스크립트에 문제가 있거나 개선 사항이 있으면 이슈를 생성해주세요.
