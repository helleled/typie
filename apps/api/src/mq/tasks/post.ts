import * as Sentry from '@sentry/bun';
import { findChildren } from '@tiptap/core';
import dayjs from 'dayjs';
import { and, asc, eq, gt, lt, lte, notInArray, or, sql } from 'drizzle-orm';
import * as R from 'remeda';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import * as Y from 'yjs';
import { redis } from '@/cache';
import {
  db,
  Entities,
  firstOrThrow,
  PostAnchors,
  PostCharacterCountChanges,
  PostContents,
  Posts,
  PostSnapshotContributors,
  PostSnapshots,
} from '@/db';
import { EntityState, PostLayoutMode } from '@/enums';
import { Lock } from '@/lock';
import { schema } from '@/pm';
import { pubsub } from '@/pubsub';
import { indexPost, deletePostFromIndex } from '@/search';
import { makeText } from '@/utils';
import { compressZstd, decompressZstd } from '@/utils/compression';
import { enqueueJob } from '../index';
import { defineCron, defineJob } from '../types';
import type { Node } from '@tiptap/pm/model';
import type { PageLayout } from '@/db/schemas/json';

const getCharacterCount = (text: string) => {
  return [...text.replaceAll('\u200B', '').replaceAll(/\s+/g, ' ').trim()].length;
};

const getBlobSize = (node: Node) => {
  const sizes = findChildren(node, (node) => node.type.name === 'file' || node.type.name === 'image').map(
    ({ node }) => Number(node.attrs.size) || 0,
  );
  return sizes.reduce((acc, size) => acc + size, 0);
};

export const PostSyncCollectJob = defineJob('post:sync:collect', async (postId: string) => {
  const lock = new Lock(`post:${postId}`);

  const acquired = await lock.tryAcquire();
  if (!acquired) {
    return;
  }

  let updates: string[] = [];
  let updated = false;

  try {
    updates = (await redis.rpop(`post:sync:updates:${postId}`, 5)) ?? [];
    if (updates.length === 0) {
      return;
    }

    const post = await db
      .select({
        id: Posts.id,
        update: PostContents.update,
        text: PostContents.text,
        siteId: Entities.siteId,
      })
      .from(Posts)
      .innerJoin(PostContents, eq(Posts.id, PostContents.postId))
      .innerJoin(Entities, eq(Posts.entityId, Entities.id))
      .where(eq(Posts.id, postId))
      .then(firstOrThrow);

    const pendingUpdates = R.groupBy(
      updates.map((update) => JSON.parse(update) as { userId: string; data: string }),
      ({ userId }) => userId,
    );

    const doc = new Y.Doc({ gc: false });
    Y.applyUpdateV2(doc, post.update);

    let prevCharacterCount = getCharacterCount(post.text);
    let order = 0;

    type Snapshot = {
      userId: string;
      snapshot: Uint8Array;
      order: number;
      delta: number;
    };

    const snapshots: Snapshot[] = [];

    for (const [userId, data] of Object.entries(pendingUpdates)) {
      const prevSnapshot = Y.snapshot(doc);
      const update = Y.mergeUpdatesV2(data.map(({ data }) => Uint8Array.fromBase64(data)));

      Y.applyUpdateV2(doc, update);
      const snapshot = Y.snapshot(doc);

      if (!Y.equalSnapshots(prevSnapshot, snapshot)) {
        const snapshotData = Y.encodeSnapshotV2(snapshot);
        const compressedSnapshot = await compressZstd(snapshotData);

        const fragment = doc.getXmlFragment('body');
        const node = yXmlFragmentToProseMirrorRootNode(fragment, schema);
        const body = node.toJSON();
        const text = makeText(body);

        const characterCount = getCharacterCount(text);
        const delta = characterCount - prevCharacterCount;

        snapshots.push({
          userId,
          snapshot: compressedSnapshot,
          order: order++,
          delta,
        });

        prevCharacterCount = characterCount;
      }
    }

    const finalUpdate = Y.encodeStateAsUpdateV2(doc);
    const finalVector = Y.encodeStateVector(doc);

    if (snapshots.length > 0) {
      const map = doc.getMap('attrs');

      const title = (map.get('title') as string) || null;
      const subtitle = (map.get('subtitle') as string) || null;
      const maxWidth = (map.get('maxWidth') as number) ?? 800;
      const coverImageId = JSON.parse((map.get('coverImage') as string) || '{}')?.id ?? null;
      const layoutMode = (map.get('layoutMode') as PostLayoutMode) ?? PostLayoutMode.SCROLL;
      const pageLayout = (map.get('pageLayout') as PageLayout) ?? null;
      const anchors = (map.get('anchors') as Record<string, string | null>) ?? {};

      const fragment = doc.getXmlFragment('body');
      const node = yXmlFragmentToProseMirrorRootNode(fragment, schema);
      const body = node.toJSON();
      const text = makeText(body);

      const characterCount = getCharacterCount(text);
      const blobSize = getBlobSize(node);

      const updatedAt = dayjs();

      const effectiveLayoutMode = [PostLayoutMode.SCROLL, PostLayoutMode.PAGE].includes(layoutMode) ? layoutMode : PostLayoutMode.SCROLL;

      const sanitizedText = text.replaceAll('\u0000', '');
      const sanitizedBody = JSON.parse(JSON.stringify(body).replaceAll(String.raw`\u0000`, ''));

      await db.transaction(async (tx) => {
        for (const snapshot of snapshots) {
          const postSnapshot = await tx
            .insert(PostSnapshots)
            .values({
              postId,
              snapshot: snapshot.snapshot,
              order: snapshot.order,
            })
            .returning({ id: PostSnapshots.id })
            .then(firstOrThrow);

          await tx.insert(PostSnapshotContributors).values({
            snapshotId: postSnapshot.id,
            userId: snapshot.userId,
          });

          if (snapshot.delta !== 0) {
            await tx
              .insert(PostCharacterCountChanges)
              .values({
                postId,
                userId: snapshot.userId,
                bucket: dayjs().startOf('hour'),
                additions: Math.max(snapshot.delta, 0),
                deletions: Math.max(-snapshot.delta, 0),
              })
              .onConflictDoUpdate({
                target: [PostCharacterCountChanges.userId, PostCharacterCountChanges.postId, PostCharacterCountChanges.bucket],
                set: {
                  additions: snapshot.delta > 0 ? sql`${PostCharacterCountChanges.additions} + ${snapshot.delta}` : undefined,
                  deletions: snapshot.delta < 0 ? sql`${PostCharacterCountChanges.deletions} + ${-snapshot.delta}` : undefined,
                },
              });
          }
        }

        await tx
          .update(PostContents)
          .set({
            update: finalUpdate,
            vector: finalVector,
            body: sanitizedBody,
            text: sanitizedText,
            characterCount,
            blobSize,
            layoutMode: effectiveLayoutMode,
            pageLayout,
            updatedAt,
          })
          .where(eq(PostContents.postId, postId));

        await tx
          .update(Posts)
          .set({
            title,
            subtitle,
            maxWidth,
            coverImageId,
            updatedAt,
          })
          .where(eq(Posts.id, postId));

        await tx.delete(PostAnchors).where(and(eq(PostAnchors.postId, postId), notInArray(PostAnchors.nodeId, Object.keys(anchors))));

        for (const [nodeId, name] of Object.entries(anchors)) {
          await tx
            .insert(PostAnchors)
            .values({ postId, nodeId, name })
            .onConflictDoUpdate({
              target: [PostAnchors.postId, PostAnchors.nodeId],
              set: { name },
            });
        }

        lock.signal.throwIfAborted();
      });

      updated = true;
    } else {
      await db
        .update(PostContents)
        .set({
          update: finalUpdate,
          vector: finalVector,
        })
        .where(eq(PostContents.postId, postId));
    }
  } catch (err) {
    Sentry.captureException(err);

    if (updates.length > 0) {
      await redis.rpush(`post:sync:updates:${postId}`, ...updates.toReversed());
    }
  } finally {
    await lock.release();
  }

  const updatesLeft = await redis.llen(`post:sync:updates:${postId}`);
  if (updatesLeft > 0) {
    await enqueueJob('post:sync:collect', postId);
  }

  if (updated) {
    const { siteId, entityId } = await db
      .select({ siteId: Entities.siteId, entityId: Entities.id })
      .from(Posts)
      .innerJoin(Entities, eq(Posts.entityId, Entities.id))
      .where(eq(Posts.id, postId))
      .then(firstOrThrow);

    pubsub.publish('site:update', siteId, { scope: 'entity', entityId });
    pubsub.publish('site:usage:update', siteId, null);

    await enqueueJob('post:index', postId, {
      deduplication: {
        id: postId,
        ttl: 60 * 1000,
      },
    });
  }
});

export const PostSyncScanCron = defineCron('post:sync:scan', '* * * * *', async () => {
  const keys = await redis.keys('post:sync:updates:*');

  await Promise.all(
    keys.map((key) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      enqueueJob('post:sync:collect', key.split(':').at(-1)!),
    ),
  );
});

export const PostIndexJob = defineJob('post:index', async (postId: string) => {
  const post = await db
    .select({
      id: Posts.id,
      state: Entities.state,
      siteId: Entities.siteId,
      title: Posts.title,
      subtitle: Posts.subtitle,
      text: PostContents.text,
    })
    .from(Posts)
    .innerJoin(PostContents, eq(Posts.id, PostContents.postId))
    .innerJoin(Entities, eq(Posts.entityId, Entities.id))
    .where(eq(Posts.id, postId))
    .then(firstOrThrow);

  if (post.state === EntityState.ACTIVE) {
    indexPost(post.id, post.siteId, post.title, post.subtitle, post.text);
  } else {
    deletePostFromIndex(post.id);
  }
});

export const PostCompactJob = defineJob('post:compact', async (postId: string) => {
  const lock = new Lock(`post:${postId}`);

  const acquired = await lock.tryAcquire();
  if (!acquired) {
    return;
  }

  try {
    type Snapshot = { id: string; createdAt: dayjs.Dayjs; userIds: Set<string> };

    const snapshots = await db
      .select({
        id: PostSnapshots.id,
        createdAt: PostSnapshots.createdAt,
      })
      .from(PostSnapshots)
      .where(eq(PostSnapshots.postId, postId))
      .orderBy(asc(PostSnapshots.createdAt), asc(PostSnapshots.order));

    if (snapshots.length === 0) {
      await db.update(PostContents).set({ compactedAt: dayjs() }).where(eq(PostContents.postId, postId));
      return;
    }

    const contributors = await db
      .select({
        snapshotId: PostSnapshotContributors.snapshotId,
        userId: PostSnapshotContributors.userId,
      })
      .from(PostSnapshotContributors)
      .innerJoin(PostSnapshots, eq(PostSnapshotContributors.snapshotId, PostSnapshots.id))
      .where(eq(PostSnapshots.postId, postId));

    const contributorsBySnapshotId = new Map<string, Set<string>>();
    for (const contributor of contributors) {
      const userIds = contributorsBySnapshotId.get(contributor.snapshotId) ?? new Set();
      userIds.add(contributor.userId);
      contributorsBySnapshotId.set(contributor.snapshotId, userIds);
    }

    const threshold24h = dayjs().subtract(24, 'hours');
    const threshold2w = dayjs().subtract(2, 'weeks');
    const windowedSnapshots = new Map<string, Snapshot>();

    for (const snapshot of snapshots) {
      const userIds = [...(contributorsBySnapshotId.get(snapshot.id) ?? [])];

      const window = snapshot.createdAt.isAfter(threshold24h)
        ? snapshot.createdAt.toISOString()
        : snapshot.createdAt.isAfter(threshold2w)
          ? snapshot.createdAt.startOf('minute').toISOString()
          : snapshot.createdAt.startOf('hour').toISOString();

      const windowedSnapshot = windowedSnapshots.get(window);

      if (windowedSnapshot) {
        windowedSnapshots.set(window, {
          id: snapshot.id,
          createdAt: snapshot.createdAt,
          userIds: new Set([...windowedSnapshot.userIds, ...userIds]),
        });
      } else {
        windowedSnapshots.set(window, {
          id: snapshot.id,
          createdAt: snapshot.createdAt,
          userIds: new Set(userIds),
        });
      }
    }

    const retainedSnapshots = [...windowedSnapshots.values()].toSorted((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());

    if (retainedSnapshots.length === snapshots.length) {
      await db.update(PostContents).set({ compactedAt: dayjs() }).where(eq(PostContents.postId, postId));
      return;
    }

    const content = await db
      .select({ update: PostContents.update })
      .from(PostContents)
      .where(eq(PostContents.postId, postId))
      .then(firstOrThrow);

    const oldDoc = new Y.Doc({ gc: false });
    Y.applyUpdateV2(oldDoc, content.update);

    const newDoc = new Y.Doc({ gc: false });

    type CompactedSnapshot = {
      snapshot: Uint8Array;
      createdAt: dayjs.Dayjs;
      userIds: string[];
    };

    const compactedSnapshots: CompactedSnapshot[] = [];

    let index = 0;
    for (const retainedSnapshot of retainedSnapshots) {
      const { snapshot: snapshotData } = await db
        .select({ snapshot: PostSnapshots.snapshot })
        .from(PostSnapshots)
        .where(eq(PostSnapshots.id, retainedSnapshot.id))
        .then(firstOrThrow);

      try {
        const decompressedSnapshot = await decompressZstd(snapshotData);
        const snapshotDoc = Y.createDocFromSnapshot(oldDoc, Y.decodeSnapshotV2(decompressedSnapshot));

        if (index === 0) {
          Y.applyUpdateV2(newDoc, Y.encodeStateAsUpdateV2(snapshotDoc));
        } else {
          const newStateVector = Y.encodeStateVector(newDoc);
          const snapshotStateVector = Y.encodeStateVector(snapshotDoc);

          const missingUpdate = Y.encodeStateAsUpdateV2(newDoc, snapshotStateVector);

          const undoManager = new Y.UndoManager(snapshotDoc, { trackedOrigins: new Set(['snapshot']) });
          Y.applyUpdateV2(snapshotDoc, missingUpdate, 'snapshot');
          undoManager.undo();

          const revertUpdate = Y.encodeStateAsUpdateV2(snapshotDoc, newStateVector);
          Y.applyUpdateV2(newDoc, revertUpdate);
        }

        const newSnapshotData = Y.encodeSnapshotV2(Y.snapshot(newDoc));
        const compressedNewSnapshot = await compressZstd(newSnapshotData);

        compactedSnapshots.push({
          snapshot: compressedNewSnapshot,
          createdAt: retainedSnapshot.createdAt,
          userIds: [...retainedSnapshot.userIds],
        });

        index++;
      } catch {
        continue;
      }
    }

    const beforeSnapshot = Y.snapshot(newDoc);

    const newStateVector = Y.encodeStateVector(newDoc);
    const oldStateVector = Y.encodeStateVector(oldDoc);

    const missingUpdate = Y.encodeStateAsUpdateV2(newDoc, oldStateVector);

    const undoManager = new Y.UndoManager(oldDoc, { trackedOrigins: new Set(['snapshot']) });
    Y.applyUpdateV2(oldDoc, missingUpdate, 'snapshot');
    undoManager.undo();

    const revertUpdate = Y.encodeStateAsUpdateV2(oldDoc, newStateVector);
    Y.applyUpdateV2(newDoc, revertUpdate);

    const afterSnapshot = Y.snapshot(newDoc);

    if (!Y.equalSnapshots(beforeSnapshot, afterSnapshot)) {
      const finalSnapshotData = Y.encodeSnapshotV2(afterSnapshot);
      const compressedFinalSnapshot = await compressZstd(finalSnapshotData);

      compactedSnapshots.push({
        snapshot: compressedFinalSnapshot,
        createdAt: dayjs(),
        userIds: [],
      });
    }

    const finalUpdate = Y.encodeStateAsUpdateV2(newDoc);
    const finalVector = Y.encodeStateVector(newDoc);

    await db.transaction(async (tx) => {
      await tx.delete(PostSnapshots).where(eq(PostSnapshots.postId, postId));

      for (const snapshot of compactedSnapshots) {
        const postSnapshot = await tx
          .insert(PostSnapshots)
          .values({
            postId,
            snapshot: snapshot.snapshot,
            createdAt: snapshot.createdAt,
            order: 0,
          })
          .returning({ id: PostSnapshots.id })
          .then(firstOrThrow);

        if (snapshot.userIds.length > 0) {
          await tx.insert(PostSnapshotContributors).values(
            snapshot.userIds.map((userId) => ({
              snapshotId: postSnapshot.id,
              userId,
            })),
          );
        }
      }

      await tx
        .update(PostContents)
        .set({
          update: finalUpdate,
          vector: finalVector,
          compactedAt: dayjs(),
        })
        .where(eq(PostContents.postId, postId));

      lock.signal.throwIfAborted();
    });
  } finally {
    await lock.release();
  }
});

export const PostCompactScanCron = defineCron('post:compact:scan', '0 * * * *', async () => {
  const now = dayjs();

  const threshold1h = now.subtract(1, 'hour');
  const threshold6h = now.subtract(6, 'hours');
  const threshold24h = now.subtract(24, 'hours');

  const threshold1d = now.subtract(1, 'day');
  const threshold2d = now.subtract(2, 'days');
  const threshold14d = now.subtract(14, 'days');

  const posts = await db
    .select({ postId: PostContents.postId })
    .from(PostContents)
    .where(
      or(
        and(lte(PostContents.updatedAt, threshold1h), gt(PostContents.updatedAt, threshold24h), lt(PostContents.compactedAt, threshold6h)),
        and(lte(PostContents.updatedAt, threshold1d), gt(PostContents.updatedAt, threshold14d), lt(PostContents.compactedAt, threshold2d)),
      ),
    );

  await Promise.all(
    posts.map(({ postId }) =>
      enqueueJob('post:compact', postId, {
        delay: Math.floor(Math.random() * 50 * 60 * 1000),
        priority: 0,
      }),
    ),
  );
});
