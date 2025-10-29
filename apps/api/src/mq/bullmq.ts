import os from 'node:os';
import * as Sentry from '@sentry/bun';
import { logger } from '@typie/lib';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { dev, env, stack } from '@/env';
import { crons, jobs } from './tasks';

const log = logger.getChild('mq');
const lane = dev ? os.hostname() : stack;
const taskMap = Object.fromEntries([...jobs, ...crons].map((job) => [job.name, job.fn]));

export const queue = new Queue(lane, {
  connection: new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  }),

  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,

    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const worker = new Worker(
  lane,
  async (job) => {
    const fn = taskMap[job.name];
    await fn?.(job.data);
  },
  {
    connection: new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    }),

    autorun: false,
    concurrency: 50,
  },
);

worker.on('completed', (job) => {
  log.info('Job completed {*}', { id: job.id, name: job.name, data: job.data });
});

worker.on('failed', (job, error) => {
  log.error('Job failed {*}', { id: job?.id, name: job?.name, data: job?.data, error });
  Sentry.captureException(error);
});

worker.on('error', (error) => {
  log.error('Job error {*}', { error });
  Sentry.captureException(error);
});

if (!process.env.SCRIPT && !process.env.NO_WORKER) {
  worker.run();
}
