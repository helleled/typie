# 타이피 - 작가를 위한 올인원 글쓰기 도구

작성, 정리, 공유까지. 글쓰기의 모든 과정을 하나의 도구로 해결하세요.

## 빠른 시작

```bash
# 1. 서비스 시작 (Docker Compose 사용 시 - 권장)
docker-compose up -d

# 2. 의존성 설치 및 개발 환경 설정
bun run setup

# 3. 개발 서버 시작
bun run dev
```

## 개발 환경 설정

자세한 설정 가이드는 [SETUP.md](./SETUP.md)를 참조하세요.

### 필수 요구사항

- [Bun](https://bun.sh) 1.3.0+
- [Node.js](https://nodejs.org) 22+
- [PostgreSQL](https://www.postgresql.org) 12+
- [Redis](https://redis.io) 6+

### 자동 설정

```bash
bun run setup
```

이 명령어는 개발 환경을 자동으로 설정합니다:

- 필수 도구 확인
- 의존성 설치
- 환경 변수 설정
- 데이터베이스 마이그레이션
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
- **데이터베이스**: PostgreSQL + Drizzle ORM
- **실시간**: Yjs, Redis, WebSocket
- **큐**: BullMQ
- **검색**: Meilisearch
- **인증**: 커스텀 OIDC 제공자

### 프론트엔드

- **프레임워크**: SvelteKit + Svelte 5
- **스타일링**: PandaCSS
- **에디터**: TipTap (ProseMirror)
- **상태 관리**: Svelte Runes

### 모바일

- **프레임워크**: Flutter/Dart
- **GraphQL**: Ferry 클라이언트

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

# 테스트
bun run test # 테스트 실행

# 기타
bun run bootstrap # Git 훅 설치 (Lefthook)
```

## 엔드포인트

- **API GraphQL Playground**: http://localhost:8080/graphql
- **웹사이트**: http://localhost:5173

## 문서

- [개발 환경 설정 가이드](./SETUP.md)
- [코드 스타일 가이드](./CLAUDE.md)

## 라이센스

[LICENSE](./LICENSE) 파일을 참조하세요.
