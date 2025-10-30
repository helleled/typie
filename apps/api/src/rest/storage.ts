import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import * as storage from '@/storage/local';
import type { Env } from '@/context';

export const storageRouter = new Hono<Env>();

storageRouter.post('/uploads/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    const key = formData.get('key') as string | null;
    const filename = formData.get('filename') as string | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !key) {
      throw new HTTPException(400, { message: 'Missing required fields' });
    }

    const buffer = await file.arrayBuffer();

    await storage.putObject({
      bucket: storage.BUCKETS.uploads,
      key,
      body: Buffer.from(buffer),
      contentType: file.type,
      metadata: {
        name: filename ?? file.name,
        'user-id': userId ?? undefined,
      },
    });

    return c.json({ success: true, key });
  } catch (error) {
    console.error('Upload error:', error);
    throw new HTTPException(500, { message: 'Upload failed' });
  }
});

storageRouter.get('/:bucket/:type/:path{.+}', async (c) => {
  const bucket = c.req.param('bucket') as storage.BUCKETS[keyof typeof storage.BUCKETS];
  const type = c.req.param('type');
  const filePath = c.req.param('path');

  if (!Object.values(storage.BUCKETS).includes(bucket)) {
    throw new HTTPException(404, { message: 'Bucket not found' });
  }

  try {
    const key = `${type}/${filePath}`;
    const object = await storage.getObject({ bucket, key });

    return c.body(object.body, {
      headers: {
        'Content-Type': object.contentType ?? 'application/octet-stream',
        'Content-Length': object.contentLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    throw new HTTPException(404, { message: 'File not found' });
  }
});

storageRouter.get('/:bucket/:path{.+}', async (c) => {
  const bucket = c.req.param('bucket') as storage.BUCKETS[keyof typeof storage.BUCKETS];
  const filePath = c.req.param('path');

  if (!Object.values(storage.BUCKETS).includes(bucket)) {
    throw new HTTPException(404, { message: 'Bucket not found' });
  }

  try {
    const object = await storage.getObject({ bucket, key: filePath });

    return c.body(object.body, {
      headers: {
        'Content-Type': object.contentType ?? 'application/octet-stream',
        'Content-Length': object.contentLength.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    throw new HTTPException(404, { message: 'File not found' });
  }
});
