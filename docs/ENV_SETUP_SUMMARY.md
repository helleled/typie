# 환경 변수 설정 간소화 요약

이 문서는 Typie 프로젝트의 환경 변수 설정 간소화 작업에 대한 요약입니다.

## 변경 사항

### 1. 새로운 파일 생성

#### `.env.local.example` (루트 디렉토리)
- **목적**: 로컬 개발을 위한 통합 환경 변수 예제 파일
- **특징**:
  - 필수 환경 변수와 선택 환경 변수를 명확히 구분
  - 모든 변수에 대한 상세한 한국어 설명
  - Docker Compose와 완벽하게 연동되는 기본값
  - 빠른 시작 가이드 포함
- **사용법**: `cp .env.local.example .env.local`

#### 앱별 `.env.example` 파일
각 앱 디렉토리에 `.env.example` 파일 생성:
- `apps/api/.env.example`
- `apps/website/.env.example`
- `apps/desktop/.env.example`
- `apps/mobile/.env.example`

#### `ENVIRONMENT.md`
- **목적**: 환경 변수에 대한 종합 문서
- **내용**:
  - 각 환경 변수의 상세 설명
  - 필수/선택 환경 변수 구분
  - 문제 해결 가이드
  - 보안 주의사항

### 2. 기존 파일 업데이트

#### 앱별 `.env` 파일
기존에 빈 값으로 되어 있던 환경 변수에 localhost 기본값 설정:
- `apps/website/.env`: localhost URL 설정
- `apps/desktop/.env`: localhost URL 설정
- `apps/mobile/.env`: localhost URL 설정

#### `SETUP.md`
- 환경 변수 설정 섹션 간소화
- `ENVIRONMENT.md` 참조 추가
- Docker Compose와 통합된 설정 가이드

#### `README.md`
- 빠른 시작 섹션에 환경 변수 설정 단계 추가
- 문서 섹션에 `ENVIRONMENT.md` 링크 추가

#### `.envrc.example`
- 사용법 설명 추가
- `.env.local.example` 참조

## 기본 설정값

### 필수 서비스 (Docker Compose 기준)

```env
DATABASE_URL=postgresql://typie:typie@localhost:5432/typie
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

### 서버 설정

```env
LISTEN_PORT=8080
AUTH_URL=http://localhost:5173
WEBSITE_URL=http://localhost:5173
USERSITE_URL=http://localhost:5173
```

### OAuth 개발용 더미 값

```env
OIDC_CLIENT_ID=dev-client-id
OIDC_CLIENT_SECRET=dev-client-secret
OIDC_JWK={"kty":"RSA","n":"dummy","e":"AQAB"}
```

### 환경 설정

```env
PUBLIC_ENVIRONMENT=local
NODE_ENV=development
```

## 이점

### 1. 간소화된 설정
- 환경 변수 파일 하나만 복사하면 로컬 개발 시작 가능
- 복잡한 외부 서비스 설정 없이 기본 기능 테스트 가능

### 2. 명확한 문서화
- 각 환경 변수의 목적과 사용법 명확히 설명
- 필수/선택 환경 변수 구분으로 혼동 방지
- 한국어 설명으로 접근성 향상

### 3. Docker Compose 통합
- Docker Compose 설정과 환경 변수가 완벽하게 일치
- 서비스 시작 후 바로 연결 가능

### 4. 보안 강화
- 프로덕션 환경에 더미 값 사용 방지 안내
- 시크릿 관리 도구 사용 권장
- .gitignore에 환경 변수 파일 포함 확인

### 5. 쉬운 온보딩
- 새로운 개발자가 3단계로 개발 환경 설정 가능
- 상세한 문제 해결 가이드 제공

## 사용 예시

### 시나리오 1: 완전히 새로운 개발자

```bash
# 1. 저장소 클론
git clone <repository-url>
cd typie

# 2. 서비스 시작
docker-compose up -d

# 3. 환경 변수 설정
cp .env.local.example .env.local

# 4. 개발 환경 설정
bun run setup

# 5. 개발 서버 시작
bun run dev
```

### 시나리오 2: 특정 앱만 개발

```bash
# API만 개발하는 경우
cd apps/api
cp .env.example .env

# 필요한 경우 환경 변수 수정
nano .env

# 개발 서버 시작
bun run dev
```

### 시나리오 3: OAuth 연동 테스트

```bash
# .env.local 파일 수정
# GOOGLE_OAUTH_CLIENT_ID와 GOOGLE_OAUTH_CLIENT_SECRET에 실제 값 설정

# 개발 서버 재시작
bun run dev
```

## 환경 변수 파일 우선순위

1. **시스템 환경 변수**: OS에서 설정된 환경 변수
2. **`.env.local`**: 루트 디렉토리의 로컬 환경 변수 (Git에서 무시됨)
3. **`.env`**: 각 앱의 환경 변수 파일 (Git에서 무시됨)
4. **Doppler**: `dev:doppler` 스크립트 사용 시

## 주의사항

1. **절대 시크릿을 Git에 커밋하지 마세요**
   - `.env`, `.env.local` 파일은 `.gitignore`에 포함
   - `.env.example` 파일만 Git에 커밋

2. **프로덕션 환경에서는 실제 값 사용**
   - 더미 값은 로컬 개발용
   - Doppler 등 시크릿 관리 도구 사용 권장

3. **환경 변수 파일 위치**
   - 루트 디렉토리: `.env.local` (모든 앱 공통)
   - 각 앱 디렉토리: `.env` (앱별 설정)

## 관련 문서

- [ENVIRONMENT.md](../ENVIRONMENT.md): 환경 변수 상세 가이드
- [SETUP.md](../SETUP.md): 개발 환경 설정 가이드
- [README.md](../README.md): 프로젝트 개요 및 빠른 시작

## 피드백

환경 변수 설정에 문제가 있거나 개선 사항이 있다면 이슈를 등록해주세요.
