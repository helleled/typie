# 환경 변수 설정 가이드

이 문서는 Typie 프로젝트의 오프라인 우선 개발 환경에서 환경 변수 설정 방법을 설명합니다.

## 빠른 시작

### 기본 설정 (환경 변수 불필요)

오프라인 개발의 경우 **별도의 환경 변수 설정이 필요 없습니다**:

```bash
bun install
bun run dev
```

모든 것이 자동으로 설정됩니다:
- SQLite 데이터베이스: `apps/api/data/typie.db`
- 로컬 스토리지: `apps/api/.storage`
- 인메모리 캐시: Redis 없이 동작

### 선택 사항: 환경 변수 파일 생성

특정 설정을 변경하려는 경우에만:

```bash
cp .env.local.example .env.local
# 필요한 값만 수정
```

## 환경 변수 카테고리

### 자동 설정 (변경 불필요)

이 변수들은 기본값으로 오프라인 개발에 적합합니다:

#### DATABASE_URL
- **기본값**: `./data/typie.db` (SQLite)
- **설명**: 로컬 SQLite 데이터베이스 경로
- **변경 시기**: PostgreSQL 사용 시에만
- **예시**: `postgresql://typie:typie@localhost:5432/typie`

#### REDIS_URL
- **기본값**: 없음 (인메모리 캐시 사용)
- **설명**: Redis 연결 URL
- **변경 시기**: Redis 사용 시에만
- **예시**: `redis://localhost:6379`

#### LISTEN_PORT
- **기본값**: `8080`
- **설명**: API 서버 포트
- **변경 시기**: 포트 충돌 시

#### AUTH_URL, WEBSITE_URL, USERSITE_URL
- **기본값**: `http://localhost:5173`
- **설명**: 서비스 URL 설정
- **변경 시기**: 포트 변경 시

### 선택 사항 (필요시만 설정)

#### 검색 엔진

##### MEILISEARCH_URL
- **기본값**: 없음
- **설명**: Meilisearch 검색 엔진 URL
- **필요 시점**: 전체 텍스트 검색 기능 사용 시
- **설정 예시**:
  ```bash
  docker-compose up -d meilisearch
  MEILISEARCH_URL=http://localhost:7700
  MEILISEARCH_API_KEY=masterKey
  ```

#### OAuth 인증

로컬 개발 시 OAuth 없이 개발할 수 있습니다.

##### OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_JWK
- **기본값**: 개발용 더미 값
- **필요 시점**: 실제 OAuth 로그인 테스트 시

##### GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
- **필요 시점**: Google 로그인 기능 테스트 시

##### KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET
- **필요 시점**: Kakao 로그인 기능 테스트 시

##### NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
- **필요 시점**: Naver 로그인 기능 테스트 시

#### Apple 서비스

##### APPLE_TEAM_ID
- **필요 시점**: Apple 로그인 또는 IAP 테스트 시

##### APPLE_SIGN_IN_KEY_ID, APPLE_SIGN_IN_PRIVATE_KEY
- **필요 시점**: Apple 로그인 테스트 시

##### APPLE_IAP_ISSUER_ID, APPLE_IAP_KEY_ID, APPLE_IAP_PRIVATE_KEY
- **필요 시점**: Apple IAP 테스트 시

#### 결제 서비스

##### PORTONE_API_SECRET, PORTONE_CHANNEL_KEY
- **필요 시점**: 결제 기능 테스트 시

##### GOOGLE_PLAY_PACKAGE_NAME, GOOGLE_SERVICE_ACCOUNT
- **필요 시점**: Google Play IAP 테스트 시

#### 외부 API 서비스

##### ANTHROPIC_API_KEY
- **필요 시점**: AI 기능 테스트 시

##### GITHUB_TOKEN
- **필요 시점**: GitHub 연동 기능 테스트 시

##### IFRAMELY_API_KEY
- **필요 시점**: URL 미리보기 기능 테스트 시

##### SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_WEBHOOK_URL
- **필요 시점**: Slack 알림 기능 테스트 시

##### SPELLCHECK_API_KEY, SPELLCHECK_URL
- **필요 시점**: 맞춤법 검사 기능 테스트 시

#### 모니터링 및 로깅

##### SENTRY_DSN
- **필요 시점**: Sentry 오류 추적 사용 시

##### OTEL_EXPORTER_OTLP_ENDPOINT
- **필요 시점**: OpenTelemetry 모니터링 사용 시

## 환경별 설정

### 오프라인 개발 (기본)

```bash
# 환경 변수 설정 불필요!
bun install
bun run dev
```

**자동 설정**:
- SQLite 데이터베이스 자동 생성
- 로컬 파일 스토리지 자동 생성
- 인메모리 캐시 사용
- 모든 더미 값 기본 제공

### 프로덕션 환경 시뮬레이션

PostgreSQL과 Redis를 사용하려는 경우:

```bash
# 1. Docker 서비스 시작
docker-compose up -d postgres redis meilisearch

# 2. .env.local 파일 생성
cat > .env.local << EOF
DATABASE_URL=postgresql://typie:typie@localhost:5432/typie
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
EOF

# 3. 개발 서버 시작
bun run dev
```

### 실제 OAuth 테스트

실제 OAuth 제공자를 테스트하려는 경우:

```bash
# .env.local에 실제 값 추가
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

## 환경 변수 로딩 순서

1. **기본값**: `apps/api/src/env.ts`의 기본값
2. **시스템 환경 변수**: 운영체제에서 설정된 환경 변수
3. **`.env.local`**: 루트 디렉토리의 로컬 환경 변수 (Git 무시)
4. **`.env`**: 각 앱의 환경 변수 파일 (Git 무시)

## 데이터베이스 전환

### SQLite → PostgreSQL

```bash
# 1. PostgreSQL 시작
docker-compose up -d postgres

# 2. 환경 변수 설정
echo "DATABASE_URL=postgresql://typie:typie@localhost:5432/typie" >> .env.local

# 3. 서버 재시작 (자동 마이그레이션)
bun run dev
```

### PostgreSQL → SQLite

```bash
# 1. 환경 변수 제거
# .env.local에서 DATABASE_URL 줄 삭제

# 2. 서버 재시작 (자동으로 SQLite 사용)
bun run dev
```

## 문제 해결

### 환경 변수가 인식되지 않을 때

```bash
# 1. .env.local 파일 위치 확인
ls -la .env.local

# 2. 파일 내용 확인
cat .env.local

# 3. 서버 재시작
bun run dev
```

### 데이터베이스 연결 오류

```bash
# SQLite 모드로 전환
rm .env.local
bun run dev
```

### 캐시 문제

```bash
# 인메모리 캐시 사용 (Redis 제거)
# .env.local에서 REDIS_URL 줄 삭제
bun run dev
```

## 보안 주의사항

1. **절대 시크릿을 Git에 커밋하지 마세요**
   - `.env`, `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
   - 예제 파일(`.env.local.example`)만 커밋하세요

2. **프로덕션 환경에서는 실제 값 사용**
   - 더미 값을 프로덕션에서 절대 사용하지 마세요
   - 환경 변수 관리 도구 사용 권장 (Doppler, AWS Secrets Manager 등)

3. **정기적으로 시크릿 교체**
   - API 키와 시크릿은 정기적으로 교체하세요

## 개발 모드 vs 프로덕션

### 개발 모드 (기본)
- SQLite 데이터베이스
- 인메모리 캐시
- 로컬 파일 스토리지
- 더미 OAuth 값
- 환경 변수 최소화

### 프로덕션 모드
- PostgreSQL 데이터베이스
- Redis 캐시
- S3 스토리지
- 실제 OAuth 인증
- 모든 환경 변수 필수

## 추가 리소스

- [Bun 환경 변수](https://bun.sh/docs/runtime/env)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [Docker Compose 문서](https://docs.docker.com/compose/)

## 요약

**오프라인 개발**: 환경 변수 설정 불필요  
**프로덕션 시뮬레이션**: Docker + 선택적 환경 변수  
**실제 서비스 테스트**: 필요한 API 키만 추가  

대부분의 경우 기본 설정으로 충분하며, 특정 기능을 테스트할 때만 해당 환경 변수를 추가하면 됩니다.
