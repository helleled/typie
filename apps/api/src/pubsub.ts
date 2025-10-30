import { createPubSub } from 'graphql-yoga';
import type { CanvasSyncType, PostSyncType } from '@/enums';

export const pubsub = createPubSub<{
  'post:sync': [postId: string, { target: string; type: PostSyncType; data: string }];
  'canvas:sync': [canvasId: string, { target: string; type: CanvasSyncType; data: string }];
  'site:update': [siteId: string, { scope: 'site' } | { scope: 'entity'; entityId: string }];
  'site:usage:update': [siteId: string, null];
}>();
