# 기여 가이드

Typie 프로젝트에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 설명합니다.

## 시작하기

### 1. 개발 환경 설정

먼저 개발 환경을 설정하세요:

```bash
# 프로젝트 클론
git clone https://github.com/your-org/typie.git
cd typie

# 자동 설정 스크립트 실행
bun run setup
```

자세한 설정 방법은 [SETUP.md](./SETUP.md)를 참조하세요.

### 2. 브랜치 생성

새로운 기능이나 버그 수정을 위해 브랜치를 생성하세요:

```bash
git checkout -b feature/your-feature-name
# 또는
git checkout -b fix/bug-description
```

브랜치 네이밍 컨벤션:

- `feature/`: 새로운 기능
- `fix/`: 버그 수정
- `docs/`: 문서 업데이트
- `refactor/`: 리팩토링
- `test/`: 테스트 추가/수정
- `chore/`: 기타 변경사항

### 3. 개발

코드를 작성하기 전에 다음을 확인하세요:

```bash
# 서비스 상태 확인
bun run check-services

# 개발 서버 시작
bun run dev
```

## 코드 스타일

### TypeScript/JavaScript

- ESLint와 Prettier 설정을 따릅니다
- 린트 오류가 없어야 합니다

```bash
# 린트 실행
bun run lint:eslint
bun run lint:prettier

# 타입 체크
bun run lint:typecheck
```

### Svelte

- Svelte 5의 Runes를 사용합니다
- PandaCSS를 사용하여 스타일링합니다

```bash
# Svelte 체크
bun run lint:svelte
```

### PandaCSS 사용법

```typescript
import { css } from '@typie/styled-system/css';

// 올바른 사용법
css({
  paddingX: '16px',
  paddingY: '8px',
  color: 'text.default',
  backgroundColor: 'surface.default',
});

// 잘못된 사용법 (하드코딩된 값)
css({
  padding: '16px 8px',
  color: '#000000',
});
```

### Dart/Flutter

- Flutter의 공식 스타일 가이드를 따릅니다
- import 문은 코드를 작성한 후에 추가합니다

```dart
// 시맨틱 컬러 사용
Icon(Icons.check, color: context.colors.textDefault)
```

## 커밋 메시지

커밋 메시지는 다음 형식을 따릅니다:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스나 도구 변경

### 예시

```
feat(api): Add user authentication endpoint

Implement JWT-based authentication for API endpoints.
- Add login endpoint
- Add token validation middleware
- Update GraphQL schema

Closes #123
```

## Pull Request

### 체크리스트

PR을 생성하기 전에 다음을 확인하세요:

- [ ] 모든 테스트가 통과합니다
- [ ] 린트 오류가 없습니다
- [ ] 타입 체크가 통과합니다
- [ ] 새로운 기능에 대한 테스트를 추가했습니다
- [ ] 문서를 업데이트했습니다 (필요한 경우)
- [ ] 커밋 메시지가 컨벤션을 따릅니다

```bash
# 테스트 실행
bun run test

# 모든 린트 체크
bun run lint:eslint
bun run lint:prettier
bun run lint:typecheck
bun run lint:svelte
```

### PR 템플릿

```markdown
## 변경 사항

- 변경 사항 1
- 변경 사항 2

## 관련 이슈

Closes #123

## 테스트

- [ ] 단위 테스트 추가
- [ ] 통합 테스트 추가
- [ ] 수동 테스트 완료

## 스크린샷 (UI 변경 시)

<!-- 스크린샷 첨부 -->

## 체크리스트

- [ ] 테스트 통과
- [ ] 린트 통과
- [ ] 문서 업데이트
- [ ] 타입 체크 통과
```

## 프로젝트 구조

### 모노레포 구조

```
typie/
├── apps/              # 애플리케이션
│   ├── api/          # Hono + GraphQL API
│   ├── website/      # SvelteKit 웹앱
│   ├── mobile/       # Flutter 모바일 앱
│   └── desktop/      # Tauri 데스크톱 앱
├── packages/         # 공유 패키지
│   ├── ui/          # UI 컴포넌트
│   ├── lib/         # 유틸리티
│   ├── styled-system/ # PandaCSS
│   └── sark/        # GraphQL 툴링
└── crates/          # Rust 크레이트
```

### 패키지 간 의존성

- `packages/*`는 다른 패키지와 앱에서 사용됩니다
- 새로운 패키지를 추가할 때는 workspace를 사용하세요: `workspace:*`
- 순환 의존성을 피하세요

## 테스트

### 단위 테스트

```bash
# 모든 테스트 실행
bun run test

# 특정 패키지 테스트
cd packages/lib
bun test
```

### E2E 테스트

E2E 테스트는 Playwright를 사용합니다.

```bash
# E2E 테스트 실행
cd apps/website
bun run test:e2e
```

## 디버깅

### API 디버깅

```bash
cd apps/api
bun run dev

# GraphQL Playground
# http://localhost:8080/graphql
```

### 웹사이트 디버깅

```bash
cd apps/website
bun run dev

# http://localhost:5173
```

### 로그

- API: 콘솔에 로그가 출력됩니다
- 웹사이트: 브라우저 개발자 도구를 사용하세요

## 문제 해결

### 빌드 오류

```bash
# 캐시 삭제 및 재빌드
rm -rf node_modules
rm -rf .turbo
bun install
turbo run build --force
```

### 타입 오류

```bash
# 타입 체크
bun run lint:typecheck

# 특정 패키지 타입 체크
cd packages/lib
bun run lint:typecheck
```

### 데이터베이스 이슈

```bash
# 마이그레이션 재실행
cd apps/api
bun drizzle-kit migrate

# 데이터베이스 초기화 (주의: 모든 데이터 삭제)
psql -U postgres -c "DROP DATABASE typie; CREATE DATABASE typie;"
bun drizzle-kit migrate
```

## 리소스

- [개발 환경 설정 가이드](./SETUP.md)
- [코드 스타일 가이드](./CLAUDE.md)
- [프로젝트 README](./README.md)

## 질문이나 도움이 필요하신가요?

- GitHub Issues에 질문을 남겨주세요
- 팀 슬랙 채널에서 문의하세요
- 코드 리뷰를 요청하세요

## 라이센스

프로젝트에 기여함으로써 귀하의 기여가 프로젝트와 동일한 라이센스에 따라 라이센스된다는 데 동의합니다.
