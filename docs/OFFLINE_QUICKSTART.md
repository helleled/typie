# 🚀 Typie 오프라인 빠른 시작 가이드

5분 만에 Typie 개발 환경을 구축하고 오프라인으로 개발을 시작하세요!

## 🎯 이 가이드를 사용해야 하는 경우

- ✅ 새로운 기여자가 빠르게 개발 환경을 설정하고 싶을 때
- ✅ 외부 서비스 없이 로컬에서만 개발하고 싶을 때
- ✅ 오프라인 환경에서 코드 테스트 및 개발을 하고 싶을 때
- ✅ CI/CD 파이프라인 설정을 위해 최소한의 환경이 필요할 때

## ⚡ 5분 빠른 시작

### 1️⃣ 사전 요구사항 확인

```bash
# Bun 설치 확인 (1.3.0+)
bun --version

# Node.js 설치 확인 (22+)
node --version
```

❗ **설치가 필요한 경우:**
```bash
# Bun 설치
curl -fsSL https://bun.sh/install | bash

# Node.js (nvm 사용)
nvm install 22
nvm use 22
```

### 2️⃣ 코드 클론 및 의존성 설치

```bash
# 리포지토리 클론
git clone https://github.com/your-org/typie.git
cd typie

# 의존성 설치 (1-2분 소요)
bun install
```

### 3️⃣ 개발 서버 시작

```bash
# 🚀 모든 서비스 오프라인 모드로 시작
bun run dev
```

**성공!** 🎉 다음 서비스가 자동으로 시작됩니다:

- ✅ **API 서버**: http://localhost:8080 (오프라인 모드)
- ✅ **웹사이트**: http://localhost:5173 (자동 API 연결)
- ✅ **데이터베이스**: SQLite 자동 생성 및 마이그레이션
- ✅ **파일 스토리지**: 로컬 스토리지 자동 설정

### 4️⃣ 개발 환경 확인

브라우저에서 다음 주소를 열어 확인하세요:

- **웹사이트**: http://localhost:5173
- **GraphQL Playground**: http://localhost:8080/graphql
- **API 상태**: http://localhost:8080/health

## 🏠 오프라인 모드에서 자동 설정되는 것들

| 구성요소 | 위치 | 설명 |
|---------|------|------|
| **🗄️ SQLite DB** | `apps/api/data/typie.db` | 자동 생성 및 마이그레이션 |
| **📁 파일 스토리지** | `apps/api/.storage/` | S3 호환 로컬 스토리지 |
| **🔄 데이터 시딩** | 자동 실행 | 기본 플랜 데이터 삽입 |
| **🚫 외부 서비스** | 스텁 처리 | 인증, 결제, 이메일 등 |

## 📱 추가 클라이언트 설정

### 모바일 개발

```bash
# Flutter 개발 환경 설정
cd apps/mobile

# 안드로이드 에뮬레이터 (10.0.2.2 사용)
API_URL=http://10.0.2.2:8080 flutter run

# iOS 시뮬레이터 (localhost 사용)
API_URL=http://localhost:8080 flutter run
```

### 데스크톱 개발

```bash
# Tauri 데스크톱 앱
cd apps/desktop
bun run dev
```

## 🔧 일반적인 문제 해결

### 데이터베이스 관련 문제

```bash
# 데이터베이스 초기화
rm -rf apps/api/data apps/api/.storage
bun run dev  # 자동 재생성
```

### 포트 충돌

```bash
# 포트 확인 및 종료
lsof -i :8080  # API
lsof -i :5173  # 웹사이트
kill -9 <PID>
```

### 파일 권한 문제

```bash
# 권한 설정
chmod -R 755 apps/api/.storage apps/api/data
```

## 📊 유용한 명령어

```bash
# 개발 환경 상태 확인
bun run check-services

# 오프라인 환경 정보 보기
bun run dev-services

# 데이터베이스 시각적 확인
cd apps/api && bun x drizzle-kit studio

# 스토리지 용량 확인
du -sh apps/api/.storage/
```

## 🚫 오프라인 모드 제한사항

다음 기능들은 오프라인 모드에서 제한됩니다:

- 🔐 **외부 OAuth 로그인**: Google, Apple, Kakao, Naver
- 💳 **실제 결제 처리**: PortOne, App Store, Google Play
- 📧 **이메일 발송**: 콘솔에 로그됨
- 🔍 **외부 검색**: Meilisearch 연동
- 📱 **푸시 알림**: 콘솔에 로그됨

## 🔄 프로덕션 환경 전환

프로덕션과 유사한 환경이 필요한 경우:

```bash
# 선택적: Meilisearch 시작
docker-compose up -d meilisearch

# 선택적: PostgreSQL + Redis 시작  
docker-compose up -d postgres redis
```

> **💡 팁**: 외부 서비스를 시작하려면 해당 환경 변수를 설정해야 합니다. 자세한 내용은 [ENVIRONMENT.md](../ENVIRONMENT.md)를 참조하세요.

## 📚 추가 문서

- [⚙️ 상세 설정 가이드](../SETUP.md) - 전체 개발 환경 설정
- [🔧 환경 변수 설정](../ENVIRONMENT.md) - 모든 환경 변수 설명
- [📖 오프라인 모드 상세](../apps/api/OFFLINE_MODE.md) - API 레벨 동작
- [✍️ 코드 스타일 가이드](../CLAUDE.md) - 개발 가이드라인

## 🤥 도움이 필요하신가요?

- 🐛 **버그 발견**: GitHub Issues에 등록
- 💬 **질문 있음**: GitHub Discussions 이용
- 📧 **기타 문의**: 팀에 직접 연락

---

**🎉 축하합니다!** 이제 Typie 오프라인 개발 환경 설정이 완료되었습니다. 즐거운 개발 되세요!