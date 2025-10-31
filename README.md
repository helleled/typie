# 타이피 - 작가를 위한 올인원 글쓰기 도구

작성, 정리, 공유까지. 글쓰기의 모든 과정을 하나의 도구로 해결하세요.

## 🚀 빠른 시작

```bash
# 1. 의존성 설치
bun install

# 2. 오프라인 모드로 모든 서비스 시작
bun run dev
```

**그게 전부입니다!** 🎉

별도의 데이터베이스나 Redis 서버 설정이 필요 없습니다. 모든 데이터는 로컬 SQLite 파일에 저장되며, 외부 서비스 없이 완전히 오프라인에서 개발할 수 있습니다.

> **💡 새로운 오프라인 우선 아키텍처**: 이제 PostgreSQL, Redis, Meilisearch 같은 외부 서비스 없이도 바로 개발을 시작할 수 있습니다. 자동으로 SQLite 데이터베이스와 로컬 스토리지가 설정됩니다.

## 개발 환경 설정

자세한 설정 가이드는 [SETUP.md](./SETUP.md)를 참조하세요.

### 필수 요구사항

- [Bun](https://bun.sh) 1.3.0+
- [Node.js](https://nodejs.org) 22+

### 자동 설정

```bash
bun run setup
```

이 명령어는 개발 환경을 자동으로 설정합니다:

- 필수 도구 확인
- 의존성 설치
- 공유 패키지 빌드

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
└── crates/               # Rust 크레이트
```

## 기술 스택

### 백엔드

- **프레임워크**: Hono
- **GraphQL**: GraphQL Yoga + Pothos
- **데이터베이스**: SQLite + Drizzle ORM (오프라인 개발)
- **실시간**: Yjs, WebSocket
- **인증**: 커스텀 OIDC 제공자
- **스토리지**: 로컬 파일 시스템

### 프론트엔드

- **프레임워크**: SvelteKit + Svelte 5
- **스타일링**: PandaCSS
- **에디터**: TipTap (ProseMirror)
- **상태 관리**: Svelte Runes

### 모바일

- **프레임워크**: Flutter/Dart
- **GraphQL**: Ferry 클라이언트

## 🛠️ 사용 가능한 명령어

### 🚀 개발 환경
```bash
bun run setup          # 개발 환경 자동 설정
bun run dev-services   # 오프라인 개발 환경 정보
bun run check-services # 개발 환경 상태 확인
bun run quickstart     # 빠른 시작 (정보 + dev)
```

### 💻 개발
```bash
bun run dev   # 모든 앱의 개발 서버 시작 (API + 웹)
bun run build # 모든 패키지 빌드
```

### 🔍 린트 및 타입 체크
```bash
bun run lint:typecheck # 타입 체크
bun run lint:eslint    # ESLint 실행
bun run lint:prettier  # Prettier 체크
bun run lint:svelte    # Svelte 컴포넌트 체크
bun run lint:syncpack  # 패키지 버전 동기화 체크
```

### 🧪 테스트
```bash
bun run test # 테스트 실행
```

### ⚙️ 기타
```bash
bun run bootstrap # Git 훅 설치 (Lefthook)
```

### 🏗️ Turbo/워크스페이스 정보

Typie는 Turbo를 사용하여 모노레포를 관리합니다:

- **자동 의존성 관리**: `bun run dev`는 API와 웹사이트를 동시에 시작
- **효율적인 빌드**: 변경된 패키지만 재빌드
- **공유 패키지**: UI, styled-system, lib 등 재사용 가능
- **병렬 실행**: 여러 작업을 동시에 실행하여 속도 향상

**워크스페이스 구조**:
```
apps/          # 애플리케이션 (api, website, mobile, desktop)
packages/      # 공유 패키지 (ui, styled-system, lib, sark)
crates/        # Rust 크레이트
```

## 엔드포인트

- **API GraphQL Playground**: http://localhost:8080/graphql
- **웹사이트**: http://localhost:5173

## 🏠 오프라인 우선 개발 환경

Typie는 오프라인 우선 아키텍처를 사용하여 별도의 서비스 설정 없이 바로 개발을 시작할 수 있습니다:

### 자동 설정되는 구성요소

- **🗄️ SQLite 데이터베이스**: `apps/api/data/typie.db`에 자동 생성
- **📁 로컬 파일 스토리지**: `apps/api/.storage`에 모든 파일 저장 (S3 호환 API)
- **🔄 자동 마이그레이션**: 첫 실행 시 데이터베이스 스키마 자동 생성
- **🌱 자동 데이터 시딩**: 기본 플랜 데이터 자동 삽입
- **🚫 외부 서비스 스텁**: 인증, 결제, 이메일 등 모두 오프라인 모드로 동작

### 클라이언트별 접속 방법

| 클라이언트 | 접속 주소 | 특이사항 |
|-----------|-----------|---------|
| **웹사이트** | http://localhost:5173 | 자동으로 로컬 API 연결 |
| **데스크톱** | 자동 실행 | localhost API 자동 연결 |
| **모바일** | http://localhost:8080 | 에뮬레이터에서 10.0.2.2 사용 |

### 오프라인 모드에서 제한되는 기능

- 🔐 외부 OAuth 로그인 (Google, Apple, Kakao, Naver)
- 💳 실제 결제 처리 (PortOne, App Store, Google Play)
- 📧 이메일 발송 (콘솔에 로그됨)
- 🔍 외부 검색 엔진 (Meilisearch)
- 📱 푸시 알림 (콘솔에 로그됨)

### 데이터베이스 관리

```bash
# 데이터베이스 초기화 (모든 데이터 삭제)
rm -rf apps/api/data

# Drizzle Studio로 데이터 확인
cd apps/api && bun x drizzle-kit studio

# 스토리지 용량 확인
du -sh apps/api/.storage/
```

### 🔧 문제 해결

#### 일반적인 오프라인 모드 문제

```bash
# 파일 권한 문제 해결
chmod -R 755 apps/api/.storage
chmod -R 755 apps/api/data

# 데이터베이스 잠금 파일 제거
rm -f apps/api/data/typie.db-shm
rm -f apps/api/data/typie.db-wal

# 완전히 초기화
rm -rf apps/api/data apps/api/.storage
bun run dev  # 자동 재생성
```

#### 선택 사항: 프로덕션 환경 시뮬레이션

프로덕션과 유사한 환경이 필요한 경우:

```bash
# Meilisearch (검색 엔진)
docker-compose up -d meilisearch

# PostgreSQL + Redis  
docker-compose up -d postgres redis
```

> **⚠️ 주의**: 외부 서비스를 시작하려면 해당 환경 변수를 설정해야 합니다. 자세한 내용은 [ENVIRONMENT.md](./ENVIRONMENT.md)를 참조하세요.

## 📚 문서

- [🚀 오프라인 빠른 시작](./docs/OFFLINE_QUICKSTART.md) - 5분 만에 개발 환경 구축
- [⚙️ 개발 환경 설정 가이드](./SETUP.md) - 상세 설정 및 문제 해결
- [🔧 환경 변수 설정 가이드](./ENVIRONMENT.md) - 모든 환경 변수 설명
- [📖 오프라인 모드 상세 설명](./apps/api/OFFLINE_MODE.md) - API 레벨 오프라인 동작
- [✍️ 코드 스타일 가이드](./CLAUDE.md) - 개발 가이드라인

## 라이센스

[LICENSE](./LICENSE) 파일을 참조하세요.
