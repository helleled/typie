import path from 'node:path';
import { and, eq } from 'drizzle-orm';
import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { db, Files, first, firstOrThrow, FontFamilies, Fonts, Images, TableCode, validateDbId } from '@/db';
import { FontFamilyState } from '@/enums';
import { TypieError } from '@/errors';
import * as aws from '@/external/aws';
import * as storage from '@/storage/local';
import { builder } from '../builder';
import { Blob, File, Font, Image, isTypeOf } from '../objects';

type FondueModule = {
  getFontMetadata: (buffer: Uint8Array) => {
    familyName?: string;
    fullName?: string;
    postScriptName?: string;
    weight: number;
    style: string;
  };
  toWoff2: (buffer: Uint8Array) => Uint8Array;
};

let fondue: FondueModule | null = null;
let fondueLoadAttempted = false;

async function loadFondue() {
  if (fondueLoadAttempted) {
    return fondue;
  }

  fondueLoadAttempted = true;

  try {
    fondue = await import('@typie/fondue');
    return fondue;
  } catch {
    console.warn('[fondue] Native module not available, font features disabled');
    return null;
  }
}

/**
 * * Types
 */

Blob.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    size: t.exposeInt('size'),
  }),
});

File.implement({
  isTypeOf: isTypeOf(TableCode.FILES),
  interfaces: [Blob],
  fields: (t) => ({
    name: t.exposeString('name'),

    url: t.string({ resolve: (blob) => storage.getFileUrl(storage.BUCKETS.usercontents, blob.path, 'files') }),
  }),
});

Image.implement({
  isTypeOf: isTypeOf(TableCode.IMAGES),
  interfaces: [Blob],
  fields: (t) => ({
    placeholder: t.exposeString('placeholder'),

    ratio: t.float({ resolve: (image) => image.width / image.height }),
    url: t.string({ resolve: (blob) => storage.getFileUrl(storage.BUCKETS.usercontents, blob.path, 'images') }),
  }),
});

/**
 * * Queries
 */

builder.queryFields((t) => ({
  image: t.field({
    type: Image,
    args: { imageId: t.arg.id({ validate: validateDbId(TableCode.IMAGES) }) },
    resolve: async (_, args) => {
      return args.imageId;
    },
  }),
}));

/**
 * * Mutations
 */

builder.mutationFields((t) => ({
  issueBlobUploadUrl: t.withAuth({ session: true }).fieldWithInput({
    type: t.builder.simpleObject('IssueBlobUploadUrlResult', {
      fields: (t) => ({
        path: t.string(),
        url: t.string(),
        fields: t.field({ type: 'JSON' }),
      }),
    }),
    input: { filename: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      const ext = path.extname(input.filename);
      const key = aws.createFragmentedS3ObjectKey();

      return {
        path: key,
        url: storage.getFileUrl(storage.BUCKETS.uploads, '', '').replace(/\/$/, '') + '/upload',
        fields: {
          key,
          filename: input.filename,
          userId: ctx.session.userId,
        },
      };
    },
  }),

  persistBlobAsFile: t.withAuth({ session: true }).fieldWithInput({
    type: File,
    input: { path: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      const head = await storage.headObject({
        bucket: storage.BUCKETS.uploads,
        key: input.path,
      });

      const fileName = head.metadata.name ?? 'file';

      await storage.copyObject({
        sourceBucket: storage.BUCKETS.uploads,
        sourceKey: input.path,
        destinationBucket: storage.BUCKETS.usercontents,
        destinationKey: `files/${input.path}`,
        contentType: head.contentType,
        contentDisposition: `attachment; filename="${fileName}"`,
        tags: {
          UserId: ctx.session.userId,
        },
      });

      return await db
        .insert(Files)
        .values({
          userId: ctx.session.userId,
          name: decodeURIComponent(fileName),
          size: head.contentLength,
          format: head.contentType ?? 'application/octet-stream',
          path: input.path,
        })
        .returning()
        .then(firstOrThrow);
    },
  }),

  persistBlobAsImage: t.withAuth({ session: true }).fieldWithInput({
    type: Image,
    input: {
      path: t.input.string(),
      modification: t.input.field({ type: 'JSON', required: false }),
    },
    resolve: async (_, { input }, ctx) => {
      const object = await storage.getObject({
        bucket: storage.BUCKETS.uploads,
        key: input.path,
      });

      const buffer = object.body;

      let img = sharp(buffer, { failOn: 'none' });

      if (input.modification) {
        if (input.modification.ensureAlpha) {
          img = img.ensureAlpha();
        }

        if (input.modification.resize) {
          img = img.resize(input.modification.resize);
        }

        if (input.modification.format) {
          img = img.toFormat(input.modification.format);
        }
      }

      let data;
      let info;

      if (input.modification) {
        const res = await img.toBuffer({ resolveWithObject: true });
        data = res.data;
        info = res.info;
      } else {
        const res = await img.metadata();
        data = buffer;
        info = res;
      }

      const mimetype = info.format === 'svg' ? 'image/svg+xml' : `image/${info.format}`;

      const raw = await img
        .clone()
        .resize({ width: 100, height: 100, fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const placeholder = rgbaToThumbHash(raw.info.width, raw.info.height, raw.data);

      await storage.putObject({
        bucket: storage.BUCKETS.usercontents,
        key: `images/${input.path}`,
        body: data,
        contentType: mimetype,
        tags: {
          UserId: ctx.session.userId,
        },
      });

      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      return await db
        .insert(Images)
        .values({
          userId: ctx.session.userId,
          name: decodeURIComponent(object.metadata.name ?? 'image'),
          size: data.length,
          format: mimetype,
          width: info.width!,
          height: info.height!,
          path: input.path,
          placeholder: placeholder.toBase64(),
        })
        .returning()
        .then(firstOrThrow);
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    },
  }),

  persistBlobAsFont: t.withAuth({ session: true }).fieldWithInput({
    type: Font,
    input: { path: t.input.string() },
    resolve: async (_, { input }, ctx) => {
      const fondueModule = await loadFondue();
      if (!fondueModule) {
        throw new TypieError({ code: 'feature_unavailable', message: 'Font processing is not available in this environment' });
      }

      const object = await storage.getObject({
        bucket: storage.BUCKETS.uploads,
        key: input.path,
      });

      const buffer = object.body;

      const metadata = fondueModule.getFontMetadata(buffer);

      if (metadata.style !== 'normal') {
        throw new TypieError({ code: 'invalid_font_style' });
      }

      const filePath = path.join(path.dirname(input.path), `${path.basename(input.path, path.extname(input.path))}.woff2`);
      const woff2 = fondueModule.toWoff2(buffer);

      const name =
        metadata.familyName ??
        metadata.fullName ??
        metadata.postScriptName ??
        path.basename(decodeURIComponent(object.metadata.name ?? 'font'), path.extname(decodeURIComponent(object.metadata.name ?? 'font')));

      await storage.putObject({
        bucket: storage.BUCKETS.usercontents,
        key: `fonts/${filePath}`,
        body: woff2,
        contentType: 'font/woff2',
        tags: {
          UserId: ctx.session.userId,
        },
      });

      let familyId: string | null = null;
      const familyName = metadata.familyName || name;

      return await db.transaction(async (tx) => {
        const fontFamily = await tx
          .select({ id: FontFamilies.id, state: FontFamilies.state })
          .from(FontFamilies)
          .where(and(eq(FontFamilies.userId, ctx.session.userId), eq(FontFamilies.name, familyName)))
          .then(first);

        if (fontFamily) {
          familyId = fontFamily.id;

          if (fontFamily.state === FontFamilyState.ARCHIVED) {
            await tx.update(FontFamilies).set({ state: FontFamilyState.ACTIVE }).where(eq(FontFamilies.id, familyId));
          }
        } else {
          const fontFamily = await tx
            .insert(FontFamilies)
            .values({
              userId: ctx.session.userId,
              name: familyName,
            })
            .returning({ id: FontFamilies.id })
            .then(firstOrThrow);

          familyId = fontFamily.id;
        }

        const existingFont = await tx
          .select({ id: Fonts.id })
          .from(Fonts)
          .where(and(eq(Fonts.familyId, familyId), eq(Fonts.weight, metadata.weight)))
          .then(first);

        if (existingFont) {
          await tx.delete(Fonts).where(eq(Fonts.id, existingFont.id));
        }

        return await tx
          .insert(Fonts)
          .values({
            familyId,
            name,
            fullName: metadata.fullName,
            postScriptName: metadata.postScriptName,
            weight: metadata.weight,
            size: woff2.length,
            path: filePath,
          })
          .returning()
          .then(firstOrThrow);
      });
    },
  }),
}));
