#!/usr/bin/env node

import { eq, inArray } from 'drizzle-orm';
import { Canvases, db, Entities, PostContents, Posts } from '@/db';
import { EntityState } from '@/enums';
import { indexPost, deletePostFromIndex, indexCanvas, deleteCanvasFromIndex } from '@/search';

const CHUNK_SIZE = 100;

const processPostsInChunks = async (): Promise<number> => {
  let offset = 0;
  let totalProcessed = 0;

  while (true) {
    const posts = await db
      .select({
        id: Posts.id,
        siteId: Entities.siteId,
        title: Posts.title,
        subtitle: Posts.subtitle,
        text: PostContents.text,
      })
      .from(Posts)
      .innerJoin(Entities, eq(Entities.id, Posts.entityId))
      .innerJoin(PostContents, eq(PostContents.postId, Posts.id))
      .where(eq(Entities.state, EntityState.ACTIVE))
      .orderBy(Posts.id)
      .limit(CHUNK_SIZE)
      .offset(offset);

    if (posts.length === 0) {
      break;
    }

    for (const post of posts) {
      indexPost(post.id, post.siteId, post.title, post.subtitle, post.text);
    }

    totalProcessed += posts.length;
    offset += CHUNK_SIZE;

    console.log(`Processed ${totalProcessed} posts...`);

    if (posts.length < CHUNK_SIZE) {
      break;
    }
  }

  return totalProcessed;
};

const processDeletedPostsInChunks = async (): Promise<number> => {
  let offset = 0;
  let totalProcessed = 0;

  while (true) {
    const deletedPosts = await db
      .select({ id: Posts.id })
      .from(Posts)
      .innerJoin(Entities, eq(Entities.id, Posts.entityId))
      .where(inArray(Entities.state, [EntityState.DELETED, EntityState.PURGED]))
      .orderBy(Posts.id)
      .limit(CHUNK_SIZE)
      .offset(offset);

    if (deletedPosts.length === 0) {
      break;
    }

    for (const post of deletedPosts) {
      deletePostFromIndex(post.id);
    }

    totalProcessed += deletedPosts.length;
    offset += CHUNK_SIZE;

    console.log(`Deleted ${totalProcessed} posts from index...`);

    if (deletedPosts.length < CHUNK_SIZE) {
      break;
    }
  }

  return totalProcessed;
};

const processCanvasesInChunks = async (): Promise<number> => {
  let offset = 0;
  let totalProcessed = 0;

  while (true) {
    const canvases = await db
      .select({ id: Canvases.id, siteId: Entities.siteId, title: Canvases.title })
      .from(Canvases)
      .innerJoin(Entities, eq(Entities.id, Canvases.entityId))
      .where(eq(Entities.state, EntityState.ACTIVE))
      .orderBy(Canvases.id)
      .limit(CHUNK_SIZE)
      .offset(offset);

    if (canvases.length === 0) {
      break;
    }

    for (const canvas of canvases) {
      indexCanvas(canvas.id, canvas.siteId, canvas.title);
    }

    totalProcessed += canvases.length;
    offset += CHUNK_SIZE;

    console.log(`Processed ${totalProcessed} canvases...`);

    if (canvases.length < CHUNK_SIZE) {
      break;
    }
  }

  return totalProcessed;
};

const processDeletedCanvasesInChunks = async (): Promise<number> => {
  let offset = 0;
  let totalProcessed = 0;

  while (true) {
    const deletedCanvases = await db
      .select({ id: Canvases.id })
      .from(Canvases)
      .innerJoin(Entities, eq(Entities.id, Canvases.entityId))
      .where(inArray(Entities.state, [EntityState.DELETED, EntityState.PURGED]))
      .orderBy(Canvases.id)
      .limit(CHUNK_SIZE)
      .offset(offset);

    if (deletedCanvases.length === 0) {
      break;
    }

    for (const canvas of deletedCanvases) {
      deleteCanvasFromIndex(canvas.id);
    }

    totalProcessed += deletedCanvases.length;
    offset += CHUNK_SIZE;

    console.log(`Deleted ${totalProcessed} canvases from index...`);

    if (deletedCanvases.length < CHUNK_SIZE) {
      break;
    }
  }

  return totalProcessed;
};

try {
  console.log('Starting FTS index update...');
  await processDeletedPostsInChunks();
  await processPostsInChunks();
  await processCanvasesInChunks();
  await processDeletedCanvasesInChunks();
  console.log('FTS index update completed successfully.');
} catch (error) {
  console.error('Error updating FTS index:', error);
  process.exit(1);
}

process.exit(0);
