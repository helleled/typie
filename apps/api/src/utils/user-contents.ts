import path from 'node:path';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { db, firstOrThrow, Images } from '@/db';
import * as aws from '@/external/aws';
import * as storage from '@/storage/local';

type PersistBlobAsImageParams = { userId?: string; file: File };
export const persistBlobAsImage = async ({ userId, file }: PersistBlobAsImageParams) => {
  const buffer = await file.arrayBuffer();
  const img = sharp(buffer, { failOn: 'none' });
  const metadata = await img.metadata();
  const mimetype = metadata.format === 'svg' ? 'image/svg+xml' : `image/${metadata.format}`;

  const raw = await img
    .clone()
    .resize({ width: 100, height: 100, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const placeholder = rgbaToThumbHash(raw.info.width, raw.info.height, raw.data);

  const ext = path.extname(file.name);
  const key = `${aws.createFragmentedS3ObjectKey()}${ext}`;

  return await db.transaction(async (tx) => {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const image = await tx
      .insert(Images)
      .values({
        // userId,
        name: file.name,
        size: file.size,
        format: mimetype,
        width: metadata.width!,
        height: metadata.height!,
        path: key,
        placeholder: placeholder.toBase64(),
      })
      .returning()
      .then(firstOrThrow);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    await storage.putObject({
      bucket: storage.BUCKETS.usercontents,
      key: `images/${key}`,
      body: Buffer.from(buffer),
      contentType: mimetype,
      tags: {
        UserId: userId ?? 'anonymous',
      },
    });

    return image;
  });
};
