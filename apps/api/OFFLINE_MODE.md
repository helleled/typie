# 오프라인 모드 (Offline Mode)

이 문서는 Typie가 오프라인 모드(`OFFLINE_MODE=true`)로 실행될 때의 동작을 설명합니다.

## 🎯 개요

오프라인 모드에서는 모든 외부 서비스 연동이 스텁(stub) 처리되어 외부 네트워크 호출을 방지합니다. 시스템은 결정적 fallback 동작을 통해 외부 의존성 없이 개발과 테스트를 계속 진행할 수 있습니다.

**✅ 자동 활성화**: 개발 환경에서는 `bun run dev` 실행 시 자동으로 오프라인 모드가 활성화되며, 별도 설정이 필요 없습니다.

## 🚫 스텁 처리된 외부 서비스

### 🔐 인증 & SSO
- **Apple 로그인**: "Apple 로그인은 오프라인 모드에서 사용할 수 없습니다" 에러 반환
- **Google 로그인**: "Google 로그인은 오프라인 모드에서 사용할 수 없습니다" 에러 반환
- **Kakao 로그인**: "Kakao 로그인은 오프라인 모드에서 사용할 수 없습니다" 에러 반환
- **Naver 로그인**: "Naver 로그인은 오프라인 모드에서 사용할 수 없습니다" 에러 반환

### 📢 통신
- **이메일 (AWS SES)**: 발송 대신 `[Email Outbox]` 접두사로 콘솔에 내용 로그
- **Slack 알림**: 발송 대신 `[Slack Offline]` 접두사로 콘솔에 메시지 로그
- **푸시 알림 (Firebase)**: 발송 대신 `[Firebase Offline]` 접두사로 콘솔에 알림 상세 로그

### 💳 결제 & 구독
- **PortOne 결제**: "결제 처리는 오프라인 모드에서 사용할 수 없습니다" 에러와 함께 실패 반환
- **App Store IAP**: "App Store 연동은 오프라인 모드에서 사용할 수 없습니다" 에러 반환
- **Google Play IAP**: "Google Play 연동은 오프라인 모드에서 사용할 수 없습니다" 에러 반환

### 📝 콘텐츠 & 기능
- **맞춤법 검사**: 추천어 빈 배열 반환, `[Spellcheck Offline]` 접두사로 텍스트 길이 로그
- **링크 임베딩 (Iframely)**: "링크 임베딩은 오프라인 모드에서 사용할 수 없습니다" 에러 반환

### 🏗️ 인프라 & 모니터링
- **AWS 서비스**: 
  - SES 클라이언트는 null (이메일은 별도 처리됨)
  - Cost Explorer 클라이언트는 null (통계는 0 반환)
- **GitHub API**: 전체 및 주간 커밋 수 모두 0 반환
- **환율 API**: 고정 환율 1,350 KRW/USD 반환
- **인프라 비용**: 0 KRW 반환

### 📁 스토리지
- **S3 키 생성**: 고유 키 대신 "offline-mode-stub-key" 반환

## 📁 로컬 스토리지 구현

파일은 다음 디렉토리 구조에 로컬로 저장됩니다:

```
apps/api/.storage/
├── uploads/           # 임시 업로드 버킷
├── usercontent/       # 영구 사용자 콘텐츠 버킷
│   ├── files/         # 일반 파일
│   ├── images/        # 이미지 파일
│   └── fonts/         # 폰트 파일 (WOFF2)
```

**절대 경로**: `<project-root>/apps/api/.storage/`

### 🎯 자동 생성

- `bun run dev` 실행 시 자동으로 디렉토리 생성
- 필요한 권한 자동 설정
- S3 호환 API 제공

## 📦 스토리지 버킷

### 📤 uploads
- **목적**: 처리 전 업로드 파일의 임시 저장
- **수명**: 처리 후 `usercontent` 버킷으로 이동
- **접근**: 파일 업로드 및 처리 워크플로우 중 내부적으로 사용

### 👤 usercontent
- **목적**: 처리된 사용자 콘텐츠의 영구 저장
- **하위 디렉토리**:
  - `files/`: 일반 파일 업로드
  - `images/`: 썸네일 포함 처리된 이미지
  - `fonts/`: 처리된 폰트 (WOFF2 형식)

## 📂 파일 구성

저장된 각 파일은 다음을 가집니다:
1. **객체 파일**: 실제 파일 내용
2. **메타데이터 파일**: 메타데이터와 태그가 있는 `.meta.json` 사이드카

예시 구조:
```
usercontent/
├── images/
│   ├── abc123.jpg
│   ├── abc123.jpg.meta.json
│   └── def456.png
│       └── def456.png.meta.json
└── files/
    ├── document.pdf
    └── document.pdf.meta.json
```

## Metadata Format

Each `.meta.json` file contains:
```json
{
  "contentLength": 1024,
  "contentType": "image/jpeg",
  "metadata": {
    "name": "example.jpg",
    "user-id": "user-123"
  },
  "tags": {
    "UserId": "user-123",
    "Type": "profile"
  },
  "contentDisposition": "inline; filename=\"example.jpg\""
}
```

## Quota Considerations

### Disk Space Usage
- **Development**: No quota enforcement (use responsibly)
- **Production**: Consider implementing disk space monitoring
- **Testing**: Use `cleanupStorage()` helper to reset between tests

### Recommended Monitoring
```bash
# Check storage size
du -sh apps/api/.storage/

# Monitor during development
watch -n 5 'du -sh apps/api/.storage/'
```

## File URLs

Local storage URLs follow this pattern:
- Without type: `http://localhost:3000/storage/<bucket>/<key>`
- With type: `http://localhost:3000/storage/<bucket>/<type>/<key>`

Examples:
- `http://localhost:3000/storage/uploads/temp-file.pdf`
- `http://localhost:3000/storage/usercontent/images/profile.jpg`

## API Endpoints

The storage router provides these endpoints:
- `POST /storage/uploads/upload` - Upload files
- `GET /storage/:bucket/:type/:path` - Access typed content (images, files, fonts)
- `GET /storage/:bucket/:path` - Direct file access

## Operations

### Supported Operations
- ✅ `putObject` - Store files with metadata
- ✅ `getObject` - Retrieve files with metadata
- ✅ `headObject` - Get file metadata without content
- ✅ `copyObject` - Copy between buckets
- ✅ `deleteObject` - Remove files and metadata
- ✅ `getObjectTags` - Read object tags
- ✅ `putObjectTags` - Update object tags
- ✅ `setObjectAcl` - No-op (ACL not applicable locally)

### Atomic Operations
- File writes use temporary files and atomic rename
- Metadata is written after successful file storage
- Prevents partial/corrupted files

## Testing

Use the provided test utilities:
```typescript
import { cleanupStorage, initStorage } from '@/storage/local';

// Before tests
await cleanupStorage();
await initStorage();

// After tests
await cleanupStorage();
```

## Migration from S3

When switching from S3 to local storage:
1. No code changes required - same API interface
2. Files are automatically stored locally
3. URLs remain consistent
4. Metadata and tags are preserved

## Limitations

### Current Limitations
- No built-in quota enforcement
- No file compression or optimization
- No CDN integration
- No cross-region replication

### Future Enhancements
- Disk space quota enforcement
- Automatic cleanup of old uploads
- File compression for images
- Backup and restore utilities