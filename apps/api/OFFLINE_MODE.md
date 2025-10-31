# Offline Mode Storage

This document describes the local filesystem storage implementation used when running Typie in offline mode.

## Storage Location

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