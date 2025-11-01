import fs from 'node:fs/promises';
import path from 'node:path';

export const BUCKETS = {
  uploads: 'uploads',
  usercontents: 'usercontent',
} as const;

const STORAGE_ROOT = path.join(process.cwd(), '.storage');

type PutObjectParams = {
  bucket: string;
  key: string;
  body: Buffer;
  contentType?: string;
  metadata?: Record<string, string | undefined>;
  tags?: Record<string, string>;
  contentDisposition?: string;
};

type GetObjectResult = {
  body: Buffer;
  contentType?: string;
  contentLength: number;
  metadata?: Record<string, string | undefined>;
};

type HeadObjectResult = {
  contentType?: string;
  contentLength: number;
  metadata?: Record<string, string | undefined>;
};

type CopyObjectParams = {
  sourceBucket: string;
  sourceKey: string;
  bucket: string;
  key: string;
  contentType?: string;
  metadata?: Record<string, string | undefined>;
  tags?: Record<string, string>;
  contentDisposition?: string;
};

export async function initStorage(): Promise<void> {
  await fs.mkdir(path.join(STORAGE_ROOT, BUCKETS.uploads), { recursive: true });
  await fs.mkdir(path.join(STORAGE_ROOT, BUCKETS.usercontents), { recursive: true });
}

export async function cleanupStorage(): Promise<void> {
  try {
    await fs.rm(STORAGE_ROOT, { recursive: true, force: true });
  } catch {
    // Ignore if doesn't exist
  }
}

export async function putObject(params: PutObjectParams): Promise<void> {
  const filePath = path.join(STORAGE_ROOT, params.bucket, params.key);
  const dirPath = path.dirname(filePath);

  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, params.body);

  const metaPath = `${filePath}.meta.json`;
  const meta = {
    contentLength: params.body.length,
    contentType: params.contentType,
    metadata: params.metadata,
    tags: params.tags,
    contentDisposition: params.contentDisposition,
  };
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
}

export async function getObject(bucket: string, key: string): Promise<GetObjectResult> {
  const filePath = path.join(STORAGE_ROOT, bucket, key);
  const body = await fs.readFile(filePath);

  const metaPath = `${filePath}.meta.json`;
  let meta: any = {};
  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    meta = JSON.parse(metaContent);
  } catch {
    // No metadata
  }

  return {
    body,
    contentType: meta.contentType,
    contentLength: body.length,
    metadata: meta.metadata,
  };
}

export async function headObject(bucket: string, key: string): Promise<HeadObjectResult> {
  const filePath = path.join(STORAGE_ROOT, bucket, key);
  const stat = await fs.stat(filePath);

  const metaPath = `${filePath}.meta.json`;
  let meta: any = {};
  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    meta = JSON.parse(metaContent);
  } catch {
    // No metadata
  }

  return {
    contentType: meta.contentType,
    contentLength: stat.size,
    metadata: meta.metadata,
  };
}

export async function copyObject(params: CopyObjectParams): Promise<void> {
  const sourceFilePath = path.join(STORAGE_ROOT, params.sourceBucket, params.sourceKey);
  const destFilePath = path.join(STORAGE_ROOT, params.bucket, params.key);
  const destDirPath = path.dirname(destFilePath);

  await fs.mkdir(destDirPath, { recursive: true });
  await fs.copyFile(sourceFilePath, destFilePath);

  const sourceMetaPath = `${sourceFilePath}.meta.json`;
  const destMetaPath = `${destFilePath}.meta.json`;
  
  try {
    const sourceMetaContent = await fs.readFile(sourceMetaPath, 'utf-8');
    const sourceMeta = JSON.parse(sourceMetaContent);
    
    const newMeta = {
      ...sourceMeta,
      contentType: params.contentType ?? sourceMeta.contentType,
      metadata: params.metadata ?? sourceMeta.metadata,
      tags: params.tags ?? sourceMeta.tags,
      contentDisposition: params.contentDisposition ?? sourceMeta.contentDisposition,
    };
    
    await fs.writeFile(destMetaPath, JSON.stringify(newMeta, null, 2));
  } catch {
    // No source metadata, create new
    const stat = await fs.stat(destFilePath);
    const meta = {
      contentLength: stat.size,
      contentType: params.contentType,
      metadata: params.metadata,
      tags: params.tags,
      contentDisposition: params.contentDisposition,
    };
    await fs.writeFile(destMetaPath, JSON.stringify(meta, null, 2));
  }
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  const filePath = path.join(STORAGE_ROOT, bucket, key);
  const metaPath = `${filePath}.meta.json`;

  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore if doesn't exist
  }

  try {
    await fs.unlink(metaPath);
  } catch {
    // Ignore if doesn't exist
  }
}

export async function getObjectTags(bucket: string, key: string): Promise<Record<string, string>> {
  const filePath = path.join(STORAGE_ROOT, bucket, key);
  const metaPath = `${filePath}.meta.json`;

  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    const meta = JSON.parse(metaContent);
    return meta.tags ?? {};
  } catch {
    return {};
  }
}

export async function putObjectTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
  const filePath = path.join(STORAGE_ROOT, bucket, key);
  const metaPath = `${filePath}.meta.json`;

  let meta: any = {};
  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    meta = JSON.parse(metaContent);
  } catch {
    // No existing metadata
  }

  meta.tags = tags;
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
}

export async function setObjectAcl(_bucket: string, _key: string, _acl: string): Promise<void> {
  // No-op for local storage
}
