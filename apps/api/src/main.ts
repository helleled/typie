import '@typie/lib/dayjs';
import '@/mq';

import { logger } from '@typie/lib';
import { websocket } from 'hono/bun';
import { HTTPException } from 'hono/http-exception';
import { app } from '@/app';
import { deriveContext } from '@/context';
import { runMigrations } from '@/db';
import { env } from '@/env';
import { graphql } from '@/graphql';
import { cors, security } from '@/middleware';
import { rest } from '@/rest';
import * as storage from '@/storage/local';
import { seedDatabase } from '../scripts/seed';

const log = logger.getChild('main');

await storage.initializeStorage();

// Run database migrations on startup
log.info('Running database migrations...');
runMigrations();
log.info('Database migrations completed');

// Seed database with initial data
await seedDatabase();

// Apply security headers middleware
app.use('*', security());

// Apply CORS middleware
app.use('*', cors());

app.use('*', async (c, next) => {
  const context = await deriveContext(c);
  c.set('context', context);

  return next();
});

app.route('/', rest);
app.route('/graphql', graphql);

app.notFound((c) => {
  return c.text('Not Found', { status: 404 });
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  log.error('Unhandled error {*}', { error });

  return c.text('Internal Server Error', { status: 500 });
});

const server = Bun.serve({
  fetch: app.fetch,
  hostname: '0.0.0.0',
  port: env.LISTEN_PORT ?? 3000,
  websocket,
  idleTimeout: 60,
});

log.info('Listening {*}', { hostname: server.hostname, port: server.port });
