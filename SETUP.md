# Typie 개발 환경 설정 가이드

이 가이드는 Typie 모노레포의 오프라인 우선 개발 환경을 설정하는 방법을 설명합니다.

## 🚀 빠른 시작 (권장)

```bash
# 1. 의존성 설치
bun install

# 2. 오프라인 모드로 모든 서비스 시작
bun run dev
```

**그게 전부입니다!** 🎉 별도의 데이터베이스나 Redis 서버 설정이 필요 없습니다.

### 자동으로 설정되는 것들

첫 실행 시 자동으로:
- ✅ SQLite 데이터베이스 생성 (`apps/api/data/typie.db`)
- ✅ 데이터베이스 마이그레이션 실행
- ✅ 초기 데이터 시딩 (플랜 정보 등)
- ✅ 로컬 스토리지 디렉토리 생성 (`apps/api/.storage`)
- ✅ 오프라인 모드 활성화 (외부 서비스 스텁)
- ✅ API 서버 시작 (http://localhost:8080)
- ✅ 웹사이트 시작 (http://localhost:5173)

## 자동 설정 스크립트

더 자세한 설정과 검증이 필요한 경우:

```bash
bun run setup
```

이 스크립트는 다음을 자동으로 수행합니다:

- ✅ 필수 도구 확인 (Bun, Node.js)
- ✅ 의존성 설치
- ✅ 공유 패키지 빌드
- ✅ 개발 환경 정보 출력

## 필수 요구사항

### Bun (1.3.0+)

```bash
curl -fsSL https://bun.sh/install | bash
```

### Node.js (22+)

```bash
# nvm 사용
nvm install 22
nvm use 22

# 또는 공식 웹사이트에서 다운로드
# https://nodejs.org
```

## 🏠 오프라인 우선 개발 환경

Typie는 오프라인 우선 아키텍처를 사용하여 외부 서비스 의존성을 제거했습니다:

### 🗄️ SQLite 데이터베이스

- **위치**: `apps/api/data/typie.db`
- **특징**: 별도의 PostgreSQL 서버 불필요
- **마이그레이션**: 첫 실행 시 자동 적용
- **시딩**: 기본 플랜 데이터 자동 삽입
- **백업**: `apps/api/data/typie.db` 파일 복사으로 간단

### 📁 로컬 파일 스토리지

- **위치**: `apps/api/.storage`
- **특징**: 별도의 S3 서버 불필요
- **구조**: S3 호환 API 제공
- **초기화**: 첫 실행 시 자동 생성
- **버킷**: `uploads`, `usercontent` (files, images, fonts)

### 🚫 외부 서비스 스텁

오프라인 모드에서 모든 외부 서비스는 스텁으로 동작:

| 서비스 | 동작 | 로그 형식 |
|--------|------|-----------|
| 이메일 (SES) | 콘솔 로그 | `[Email Outbox]` |
| 슬랙 알림 | 콘솔 로그 | `[Slack Offline]` |
| 푸시 알림 | 콘솔 로그 | `[Firebase Offline]` |
| OAuth 로그인 | 에러 반환 | "Unavailable in offline mode" |
| 결제 처리 | 실패 반환 | "Unavailable in offline mode" |
| 맞춤법 검사 | 빈 배열 | `[Spellcheck Offline]` |

### 🧠 인메모리 캐싱

- **특징**: 별도의 Redis 서버 불필요
- **사용**: 개발 모드에서 메모리 기반 캐시 사용
- **제한**: 서버 재시작 시 캐시 초기화

## 🚀 개발 서버 실행

### 모든 앱 실행 (권장)

```bash
bun run dev
```

이 명령은 다음을 자동으로 시작합니다:
- ✅ API 서버 (http://localhost:8080) - 오프라인 모드
- ✅ 웹사이트 (http://localhost:5173) - 자동 API 연결

### 개별 앱 실행

```bash
# API 서버만 (오프라인 모드)
cd apps/api
bun run dev

# 웹사이트만
cd apps/website
bun run dev

# 모바일 (Flutter)
cd apps/mobile
flutter run

# 데스크톱 (Tauri)
cd apps/desktop
bun run dev
```

### 📱 모바일 개발 설정

#### 안드로이드 에뮬레이터
```bash
# 에뮬레이터에서 localhost 접속을 위해
# API_URL=http://10.0.2.2:8080
# WS_URL=ws://10.0.2.2:8080
```

#### iOS 시뮬레이터
```bash
# 시뮬레이터에서 localhost 접속을 위해
# API_URL=http://localhost:8080
# WS_URL=ws://localhost:8080
```

### 🖥️ 데스크톱 개발 설정

데스크톱 앱은 자동으로 localhost API 서버에 연결됩니다:
- 개발 모드에서는 별도 설정 불필요
- API 서버가 실행 중이어야 함

## 데이터베이스 관리

### 데이터베이스 초기화

모든 데이터를 삭제하고 처음부터 시작:

```bash
rm -rf apps/api/data
bun run dev  # 자동으로 재생성 및 마이그레이션
```

### Drizzle Studio

데이터베이스 내용을 시각적으로 확인:

```bash
cd apps/api
bun x drizzle-kit studio
```

브라우저에서 https://local.drizzle.studio 열기

### 마이그레이션 생성

스키마 변경 후 마이그레이션 생성:

```bash
cd apps/api
bun x drizzle-kit generate
```

## 사용 가능한 명령어

```bash
# 개발 환경
bun run setup          # 개발 환경 자동 설정
bun run dev-services   # 오프라인 개발 환경 정보
bun run check-services # 개발 환경 상태 확인

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
│   │   ├── data/         # SQLite 데이터베이스 (gitignore)
│   │   ├── .storage/     # 로컬 파일 스토리지 (gitignore)
│   │   └── src/
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
    ├── setup.ts          # 자동 설정 스크립트
    ├── check-services.ts # 서비스 상태 확인
    └── dev-services.ts   # 개발 환경 정보
```

## 엔드포인트

- **API GraphQL Playground**: http://localhost:8080/graphql
- **웹사이트**: http://localhost:5173
- **API 상태**: http://localhost:8080/health

## 선택 사항: 프로덕션 환경 시뮬레이션

프로덕션과 유사한 환경이 필요한 경우 Docker Compose를 사용할 수 있습니다:

### Meilisearch (검색 엔진)

```bash
docker-compose up -d meilisearch
```

환경 변수 설정:
```bash
# apps/api/.env 또는 .env.local
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=masterKey
```

### PostgreSQL + Redis

```bash
docker-compose up -d postgres redis
```

환경 변수 설정:
```bash
# apps/api/.env 또는 .env.local
DATABASE_URL=postgresql://typie:typie@localhost:5432/typie
REDIS_URL=redis://localhost:6379
```

**참고**: 환경 변수를 설정하지 않으면 기본적으로 SQLite와 인메모리 캐시를 사용합니다.

## 🔧 문제 해결

### 일반적인 오프라인 모드 문제

#### 데이터베이스 관련 오류
```bash
# 데이터베이스 잠금 파일 제거
rm -f apps/api/data/typie.db-shm
rm -f apps/api/data/typie.db-wal

# 데이터베이스 완전 초기화
rm -rf apps/api/data apps/api/.storage
bun run dev  # 자동 재생성
```

#### 파일 권한 문제
```bash
# 스토리지 디렉토리 권한 설정
chmod -R 755 apps/api/.storage
chmod -R 755 apps/api/data

# 소유자 확인 (필요시)
sudo chown -R $USER:$USER apps/api/.storage apps/api/data
```

#### 빌드 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
bun install

# 빌드 캐시 삭제
rm -rf .turbo
turbo run build --force

# 공유 패키지 재빌드
bun run build
```

#### 포트 충돌
```bash
# 포트 사용 프로세스 찾기
lsof -i :8080  # API 서버
lsof -i :5173  # 웹사이트

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
LISTEN_PORT=8081 cd apps/api && bun run dev
```

### 📱 모바일 개발 문제

#### 안드로이드 에뮬레이터 연결 오류
```bash
# 에뮬레이터 네트워크 확인
adb shell ping 10.0.2.2

# 방화벽 확인
sudo ufw status
```

#### iOS 시뮬레이터 연결 오류
```bash
# localhost 연결 확인
curl http://localhost:8080/health

# 시뮬레이터 재시작
xcrun simctl shutdown all
xcrun simctl boot "iPhone 15"
```

### 🧪 테스트 환경 초기화

```bash
# 테스트 데이터 정리
cd apps/api
bun test -- --reset

# 스토리지 정리 (테스트용)
rm -rf apps/api/.storage/test-*
```

### 📊 상태 확인 명령어

```bash
# 개발 환경 상태 확인
bun run check-services

# 오프라인 환경 정보 보기
bun run dev-services

# 스토리지 용량 확인
du -sh apps/api/.storage/
watch -n 5 'du -sh apps/api/.storage/'

# 데이터베이스 크기 확인
ls -lh apps/api/data/typie.db
```

## 개발 워크플로우

### 1. 새로운 기능 개발

```bash
# 1. 브랜치 생성
git checkout -b feature/new-feature

# 2. 개발 서버 시작
bun run dev

# 3. 코드 작성 및 테스트
# (hot reload 자동 적용)

# 4. 타입 체크 및 린트
bun run lint:typecheck
bun run lint:eslint

# 5. 커밋
git add .
git commit -m "feat: add new feature"
```

### 2. 데이터베이스 스키마 변경

```bash
# 1. 스키마 파일 수정
# apps/api/src/db/schemas/tables.ts

# 2. 마이그레이션 생성
cd apps/api
bun x drizzle-kit generate

# 3. 서버 재시작 (자동 마이그레이션 적용)
bun run dev
```

### 3. UI 컴포넌트 개발

```bash
# 1. styled-system 변경 시
cd packages/styled-system
bun run codegen

# 2. UI 컴포넌트 변경 시
cd packages/ui
# 자동 hot reload
```

## 추가 리소스

- [Bun 문서](https://bun.sh/docs)
- [Hono 문서](https://hono.dev)
- [SvelteKit 문서](https://kit.svelte.dev)
- [Drizzle ORM 문서](https://orm.drizzle.team)
- [PandaCSS 문서](https://panda-css.com)

## 문의

문제가 발생하거나 질문이 있으면 팀에 문의하세요.
