# Offline Mode

This document describes the behavior of Typie when running in offline mode (`OFFLINE_MODE=true`).

## Overview

When `OFFLINE_MODE=true`, all external service integrations are stubbed to prevent outbound network calls. The system continues to operate with deterministic fallback behaviors, ensuring development and testing can proceed without external dependencies.

## Stubbed External Services

### Authentication & SSO
- **Apple Sign-In**: Returns error "Apple Sign-In is unavailable in offline mode"
- **Google Sign-In**: Returns error "Google Sign-In is unavailable in offline mode"
- **Kakao Sign-In**: Returns error "Kakao Sign-In is unavailable in offline mode"
- **Naver Sign-In**: Returns error "Naver Sign-In is unavailable in offline mode"

### Communications
- **Email (AWS SES)**: Logs email content to console with `[Email Outbox]` prefix instead of sending
- **Slack Notifications**: Logs message content to console with `[Slack Offline]` prefix instead of sending
- **Push Notifications (Firebase)**: Logs notification details to console with `[Firebase Offline]` prefix instead of sending

### Payments & Subscriptions
- **PortOne Payments**: Returns failure result with error "Payment processing is unavailable in offline mode"
- **App Store IAP**: Returns error "App Store integration is unavailable in offline mode"
- **Google Play IAP**: Returns error "Google Play integration is unavailable in offline mode"

### Content & Features
- **Spell Checking**: Returns empty array of suggestions, logs text length with `[Spellcheck Offline]` prefix
- **Link Embedding (Iframely)**: Returns error "Link embedding is unavailable in offline mode"

### Infrastructure & Monitoring
- **AWS Services**: 
  - SES client is null (email already handled separately)
  - Cost Explorer client is null (stats return 0)
- **GitHub API**: Returns 0 commits for both total and weekly
- **Exchange Rate API**: Returns fixed rate of 1350 KRW/USD
- **Infrastructure Cost**: Returns 0 KRW

### Storage
- **S3 Key Generation**: Returns "offline-mode-stub-key" instead of generated unique keys

## Local Storage Implementation

Files are stored locally under the following directory structure:

```
apps/api/.storage/
├── uploads/           # Temporary upload bucket
├── usercontent/       # Persistent user content bucket
│   ├── files/
│   ├── images/
│   └── fonts/
```

The absolute path is: `<project-root>/apps/api/.storage/`

## Storage Buckets

### uploads
- **Purpose**: Temporary storage for uploaded files before processing
- **Lifetime**: Files are moved to `usercontent` bucket after processing
- **Access**: Used internally during file upload and processing workflows

### usercontent
- **Purpose**: Persistent storage for processed user content
- **Sub-directories**:
  - `files/`: General file uploads
  - `images/`: Processed images with thumbnails
  - `fonts/`: Processed fonts (WOFF2 format)

## File Organization

Each stored file has:
1. **Object file**: The actual file content
2. **Metadata file**: `.meta.json` sidecar with metadata and tags

Example structure:
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