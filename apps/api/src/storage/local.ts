import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '@/env';

export const BUCKETS = {
  uploads: 'uploads',
  usercontents: 'usercontents',
} as const;

const STORAGE_ROOT = path.join(process.cwd(), 'data', 'storage');

export async function initStorage() {
  await fs.mkdir(path.join(STORAGE_ROOT, BUCKETS.uploads), { recursive: true });
  await fs.mkdir(path.join(STORAGE_ROOT, BUCKETS.usercontents), { recursive: true });
}

export function getFileUrl(bucket: string, filePath: string, type: string): string {
  const baseUrl = env.API_URL;
  if (type) {
    return `${baseUrl}/storage/${bucket}/${type}/${filePath}`;
  }
  return `${baseUrl}/storage/${bucket}/${filePath}`;
}

interface PutObjectParams {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
  contentDisposition?: string;
  metadata?: Record<string, string | undefined>;
  tags?: Record<string, string>;
}

export async function putObject(params: PutObjectParams): Promise<void> {
  const filePath = path.join(STORAGE_ROOT, params.bucket, params.key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, params.body);

  const metadataPath = `${filePath}.meta.json`;
  const metadata = {
    contentType: params.contentType,
    contentDisposition: params.contentDisposition,
    metadata: params.metadata,
    tags: params.tags,
  };
  await fs.writeFile(metadataPath, JSON.stringify(metadata));
}

interface GetObjectParams {
  bucket: string;
  key: string;
}

interface ObjectResult {
  body: Buffer;
  contentType: string | null;
  contentLength: number;
  metadata: Record<string, string>;
}

export async function getObject(params: GetObjectParams): Promise<ObjectResult> {
  const filePath = path.join(STORAGE_ROOT, params.bucket, params.key);
  const body = await fs.readFile(filePath);

  const metadataPath = `${filePath}.meta.json`;
  let contentType: string | null = null;
  let metadata: Record<string, string> = {};

  try {
    const metaContent = await fs.readFile(metadataPath, 'utf-8');
    const meta = JSON.parse(metaContent);
    contentType = meta.contentType ?? null;
    metadata = meta.metadata ?? {};
  } catch {
    // Metadata file doesn't exist, continue with defaults
  }

  return {
    body,
    contentType,
    contentLength: body.length,
    metadata,
  };
}

interface HeadObjectParams {
  bucket: string;
  key: string;
}

interface HeadObjectResult {
  contentType: string | null;
  contentLength: number;
  metadata: Record<string, string>;
}

export async function headObject(params: HeadObjectParams): Promise<HeadObjectResult> {
  const filePath = path.join(STORAGE_ROOT, params.bucket, params.key);
  const stats = await fs.stat(filePath);

  const metadataPath = `${filePath}.meta.json`;
  let contentType: string | null = null;
  let metadata: Record<string, string> = {};

  try {
    const metaContent = await fs.readFile(metadataPath, 'utf-8');
    const meta = JSON.parse(metaContent);
    contentType = meta.contentType ?? null;
    metadata = meta.metadata ?? {};
  } catch {
    // Metadata file doesn't exist, continue with defaults
  }

  return {
    contentType,
    contentLength: stats.size,
    metadata,
  };
}

interface CopyObjectParams {
  sourceBucket: string;
  sourceKey: string;
  destinationBucket: string;
  destinationKey: string;
  contentType?: string;
  contentDisposition?: string;
  tags?: Record<string, string>;
}

export async function copyObject(params: CopyObjectParams): Promise<void> {
  const sourcePath = path.join(STORAGE_ROOT, params.sourceBucket, params.sourceKey);
  const destPath = path.join(STORAGE_ROOT, params.destinationBucket, params.destinationKey);

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.copyFile(sourcePath, destPath);

  const sourceMetaPath = `${sourcePath}.meta.json`;
  const destMetaPath = `${destPath}.meta.json`;

  let metadata: Record<string, string> = {};
  try {
    const metaContent = await fs.readFile(sourceMetaPath, 'utf-8');
    const meta = JSON.parse(metaContent);
    metadata = meta.metadata ?? {};
  } catch {
    // Source metadata doesn't exist
  }

  const newMeta = {
    contentType: params.contentType,
    contentDisposition: params.contentDisposition,
    metadata,
    tags: params.tags,
  };
  await fs.writeFile(destMetaPath, JSON.stringify(newMeta));
}
