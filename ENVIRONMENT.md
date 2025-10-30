# 환경 변수 설정 가이드

이 문서는 Typie 프로젝트의 환경 변수 설정 방법을 설명합니다.

## 빠른 시작

### 1. 환경 변수 파일 생성

루트 디렉토리에 `.env.local` 파일을 생성하거나 제공된 예제 파일을 복사합니다:

```bash
# 루트 디렉토리에서
cp .env.local.example .env.local
```

또는 각 앱별로 개별적으로 설정:

```bash
# API 서버
cd apps/api
cp .env.example .env

# 웹사이트
cd apps/website
cp .env.example .env

# 데스크톱
cd apps/desktop
cp .env.example .env

# 모바일
cd apps/mobile
cp .env.example .env
```

### 2. 필수 서비스 시작

Docker Compose를 사용하여 필수 서비스를 시작합니다:

```bash
docker-compose up -d
```

이 명령으로 다음 서비스가 시작됩니다:
- **PostgreSQL** (포트 5432)
- **Redis** (포트 6379)
- **Meilisearch** (포트 7700)

### 3. 데이터베이스 마이그레이션

```bash
cd apps/api
bun drizzle-kit migrate
```

### 4. 개발 서버 실행

```bash
bun run dev
```

## 환경 변수 상세 설명

### 필수 환경 변수 (REQUIRED)

이 변수들은 **반드시** 설정해야 애플리케이션이 정상 작동합니다.

#### DATABASE_URL
- **설명**: PostgreSQL 데이터베이스 연결 URL
- **기본값**: `postgresql://typie:typie@localhost:5432/typie`
- **형식**: `postgresql://[사용자]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]`
- **Docker Compose 사용 시**: 기본값 그대로 사용

#### REDIS_URL
- **설명**: Redis 연결 URL (캐시, PubSub, 큐 처리)
- **기본값**: `redis://localhost:6379`
- **형식**: `redis://[호스트]:[포트]`
- **Docker Compose 사용 시**: 기본값 그대로 사용

### 선택 환경 변수 (OPTIONAL)

이 변수들은 기본값이 있거나 특정 기능을 사용할 때만 필요합니다.

#### 서버 설정

##### LISTEN_PORT
- **설명**: API 서버가 실행될 포트
- **기본값**: `8080`
- **사용처**: API 서버

##### AUTH_URL
- **설명**: 인증 서비스 URL
- **기본값**: `http://localhost:5173`
- **사용처**: API 서버, 클라이언트 앱

##### WEBSITE_URL
- **설명**: 웹사이트 URL
- **기본값**: `http://localhost:5173`
- **사용처**: API 서버, 클라이언트 앱

##### USERSITE_URL
- **설명**: 사용자 사이트 URL
- **기본값**: `http://localhost:5173`
- **사용처**: API 서버, 클라이언트 앱

#### 검색 엔진

##### MEILISEARCH_URL
- **설명**: Meilisearch 검색 엔진 URL
- **기본값**: `http://localhost:7700`
- **사용처**: API 서버
- **Docker Compose 사용 시**: 기본값 그대로 사용

##### MEILISEARCH_API_KEY
- **설명**: Meilisearch API 키
- **기본값**: `masterKey` (개발용)
- **사용처**: API 서버
- **Docker Compose 사용 시**: `masterKey` 사용

#### OAuth 인증

로컬 개발 시에는 더미 값으로 설정되어 있어 OAuth 로그인 없이 테스트할 수 있습니다.
실제 OAuth 연동이 필요한 경우에만 실제 값을 설정하세요.

##### OIDC_CLIENT_ID
- **설명**: OIDC 클라이언트 ID
- **기본값**: `dev-client-id` (개발용)
- **사용처**: 모든 클라이언트 앱

##### OIDC_CLIENT_SECRET
- **설명**: OIDC 클라이언트 시크릿
- **기본값**: `dev-client-secret` (개발용)
- **사용처**: API 서버, 클라이언트 앱

##### OIDC_JWK
- **설명**: OIDC JSON Web Key
- **기본값**: `{"kty":"RSA","n":"dummy","e":"AQAB"}` (개발용)
- **사용처**: API 서버

##### GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
- **설명**: Google OAuth 클라이언트 인증 정보
- **기본값**: 빈 문자열
- **사용처**: API 서버
- **필요 시점**: Google 로그인 기능을 사용할 때

##### KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET
- **설명**: Kakao OAuth 클라이언트 인증 정보
- **기본값**: 빈 문자열
- **사용처**: API 서버
- **필요 시점**: Kakao 로그인 기능을 사용할 때

##### NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
- **설명**: Naver OAuth 클라이언트 인증 정보
- **기본값**: 빈 문자열
- **사용처**: API 서버
- **필요 시점**: Naver 로그인 기능을 사용할 때

#### Apple 서비스

Apple 서비스 연동이 필요한 경우에만 설정합니다.

##### APPLE_TEAM_ID
- **설명**: Apple Developer Team ID
- **기본값**: 빈 문자열
- **필요 시점**: Apple 로그인 또는 IAP를 사용할 때

##### APPLE_SIGN_IN_KEY_ID, APPLE_SIGN_IN_PRIVATE_KEY
- **설명**: Apple Sign In 키 정보
- **기본값**: 빈 문자열
- **필요 시점**: Apple 로그인을 사용할 때

##### APPLE_APP_APPLE_ID, APPLE_APP_BUNDLE_ID
- **설명**: Apple 앱 정보
- **기본값**: `0` (Apple ID), 빈 문자열 (Bundle ID)
- **필요 시점**: Apple IAP를 사용할 때

##### APPLE_IAP_ISSUER_ID, APPLE_IAP_KEY_ID, APPLE_IAP_PRIVATE_KEY
- **설명**: Apple In-App Purchase API 키 정보
- **기본값**: 빈 문자열
- **필요 시점**: Apple IAP를 사용할 때

#### 결제 서비스

##### PORTONE_API_SECRET, PORTONE_CHANNEL_KEY
- **설명**: PortOne 결제 서비스 인증 정보
- **기본값**: 빈 문자열
- **필요 시점**: 결제 기능을 사용할 때

##### GOOGLE_PLAY_PACKAGE_NAME, GOOGLE_SERVICE_ACCOUNT
- **설명**: Google Play IAP 정보
- **기본값**: 빈 문자열, `{}`
- **필요 시점**: Google Play IAP를 사용할 때

#### 외부 API 서비스

##### ANTHROPIC_API_KEY
- **설명**: Anthropic AI API 키
- **기본값**: 빈 문자열
- **필요 시점**: AI 기능을 사용할 때

##### GITHUB_TOKEN
- **설명**: GitHub API 토큰
- **기본값**: 빈 문자열
- **필요 시점**: GitHub 연동 기능을 사용할 때

##### IFRAMELY_API_KEY
- **설명**: Iframely API 키 (URL 미리보기)
- **기본값**: 빈 문자열
- **필요 시점**: URL 미리보기 기능을 사용할 때

##### SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_WEBHOOK_URL
- **설명**: Slack 알림 서비스 정보
- **기본값**: 빈 문자열
- **필요 시점**: Slack 알림 기능을 사용할 때

##### SPELLCHECK_API_KEY, SPELLCHECK_URL
- **설명**: 맞춤법 검사 API 정보
- **기본값**: 빈 문자열, `http://localhost:8081`
- **필요 시점**: 맞춤법 검사 기능을 사용할 때

#### 모니터링 및 로깅

##### SENTRY_DSN
- **설명**: Sentry 오류 추적 DSN
- **기본값**: 빈 문자열
- **필요 시점**: Sentry 오류 추적을 사용할 때

##### OTEL_EXPORTER_OTLP_ENDPOINT
- **설명**: OpenTelemetry Exporter 엔드포인트
- **기본값**: 빈 문자열
- **필요 시점**: OpenTelemetry 모니터링을 사용할 때

##### PUBLIC_ENVIRONMENT
- **설명**: 실행 환경 (`local`, `dev`, `prod` 등)
- **기본값**: `local`
- **사용처**: 모든 앱

##### NODE_ENV
- **설명**: Node.js 실행 환경
- **기본값**: `development`
- **사용처**: 모든 앱

## 환경별 설정

### 로컬 개발 (Local Development)

로컬 개발 환경에서는 최소한의 설정으로 시작할 수 있습니다:

```bash
# 필수 환경 변수만 설정
DATABASE_URL=postgresql://typie:typie@localhost:5432/typie
REDIS_URL=redis://localhost:6379

# 선택 환경 변수 (기본값 사용)
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

### 프로덕션 (Production)

프로덕션 환경에서는 모든 외부 서비스의 실제 인증 정보를 설정해야 합니다.
보안을 위해 [Doppler](https://www.doppler.com/) 같은 시크릿 관리 도구 사용을 권장합니다.

## 환경 변수 로딩 순서

1. **시스템 환경 변수**: 운영체제에서 설정된 환경 변수
2. **`.env.local`**: 루트 디렉토리의 로컬 환경 변수 (Git에서 무시됨)
3. **`.env`**: 각 앱의 환경 변수 파일 (Git에서 무시됨)
4. **Doppler**: `dev:doppler` 스크립트 사용 시 Doppler에서 로드

## 문제 해결

### 데이터베이스 연결 실패

```bash
# PostgreSQL이 실행 중인지 확인
docker-compose ps postgres

# 또는 로컬 PostgreSQL 확인
psql -U postgres -c "SELECT 1"

# Docker Compose로 재시작
docker-compose restart postgres
```

### Redis 연결 실패

```bash
# Redis가 실행 중인지 확인
docker-compose ps redis

# 또는 로컬 Redis 확인
redis-cli ping

# Docker Compose로 재시작
docker-compose restart redis
```

### Meilisearch 연결 실패

```bash
# Meilisearch가 실행 중인지 확인
docker-compose ps meilisearch

# Meilisearch 상태 확인
curl http://localhost:7700/health

# Docker Compose로 재시작
docker-compose restart meilisearch
```

## 보안 주의사항

1. **절대 시크릿을 Git에 커밋하지 마세요**: `.env`, `.env.local` 파일은 `.gitignore`에 포함되어 있습니다.
2. **프로덕션 환경에서는 강력한 비밀번호 사용**: 기본 더미 값을 절대 프로덕션에서 사용하지 마세요.
3. **시크릿 관리 도구 사용**: Doppler, AWS Secrets Manager, HashiCorp Vault 등을 사용하세요.
4. **정기적으로 시크릿 교체**: API 키와 시크릿은 정기적으로 교체하세요.

## 추가 리소스

- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Doppler 문서](https://docs.doppler.com/)
- [Bun 환경 변수](https://bun.sh/docs/runtime/env)
