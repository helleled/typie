import * as Sentry from '@sentry/bun';
import { logger } from '@typie/lib';
import { CronJob } from 'cron';
import { nanoid } from 'nanoid';
import { store } from './store';

const log = logger.getChild('scheduler');

type JobData = {
  id: string;
  name: string;
  data: unknown;
  attempts: number;
  maxAttempts: number;
  backoffDelay: number;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
};

type JobHandler = (data: unknown) => Promise<void>;

type JobOptions = {
  attempts?: number;
  backoff?: {
    type: 'exponential';
    delay: number;
  };
  jobId?: string;
  delay?: number;
};

type CronConfig = {
  name: string;
  pattern: string;
  tz: string;
};

class Scheduler {
  #handlers = new Map<string, JobHandler>();
  #queue: JobData[] = [];
  #activeJobs = new Set<string>();
  #processing = false;
  #concurrency = 50;
  #crons = new Map<string, CronJob>();
  #listeners = new Map<string, Set<(job: JobData, error?: Error) => void>>();

  async add(name: string, data: unknown, options?: JobOptions): Promise<void> {
    const jobId = options?.jobId || nanoid();
    
    if (options?.jobId) {
      const dedupeKey = `job:dedupe:${jobId}`;
      if (store.checkDedupe(dedupeKey)) {
        log.info('Job deduplicated {*}', { id: jobId, name });
        return;
      }
      store.setDedupe(dedupeKey, 3600);
    }

    const job: JobData = {
      id: jobId,
      name,
      data,
      attempts: 0,
      maxAttempts: options?.attempts ?? 3,
      backoffDelay: options?.backoff?.delay ?? 1000,
      timestamp: Date.now(),
    };

    if (options?.delay) {
      setTimeout(() => {
        this.#queue.push(job);
        this.#process();
      }, options.delay);
    } else {
      this.#queue.push(job);
      this.#process();
    }
  }

  register(name: string, handler: JobHandler): void {
    this.#handlers.set(name, handler);
  }

  upsertCron(config: CronConfig): void {
    const existing = this.#crons.get(config.name);
    if (existing) {
      existing.stop();
    }

    const job = new CronJob(
      config.pattern,
      () => {
        this.add(config.name, {}).catch((error) => {
          log.error('Failed to enqueue cron job {*}', { name: config.name, error });
        });
      },
      null,
      true,
      config.tz,
    );

    this.#crons.set(config.name, job);
    log.info('Cron job registered {*}', { name: config.name, pattern: config.pattern });
  }

  on(event: 'active' | 'completed' | 'failed', listener: (job: JobData, error?: Error) => void): void {
    const listeners = this.#listeners.get(event) || new Set();
    listeners.add(listener);
    this.#listeners.set(event, listeners);
  }

  #emit(event: 'active' | 'completed' | 'failed', job: JobData, error?: Error): void {
    const listeners = this.#listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(job, error);
        } catch (err) {
          log.error('Listener error {*}', { event, error: err });
        }
      }
    }
  }

  async #process(): Promise<void> {
    if (this.#processing) return;
    this.#processing = true;

    while (this.#queue.length > 0) {
      while (this.#activeJobs.size >= this.#concurrency && this.#queue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (this.#queue.length === 0) break;

      const job = this.#queue.shift();
      if (!job) continue;

      this.#activeJobs.add(job.id);
      this.#executeJob(job);
    }

    this.#processing = false;
  }

  async #executeJob(job: JobData): Promise<void> {
    const handler = this.#handlers.get(job.name);
    
    if (!handler) {
      log.error('No handler found for job {*}', { id: job.id, name: job.name });
      this.#activeJobs.delete(job.id);
      return;
    }

    job.processedOn = Date.now();
    this.#emit('active', job);

    try {
      await handler(job.data);
      job.finishedOn = Date.now();
      this.#emit('completed', job);
      log.info('Job completed {*}', { id: job.id, name: job.name, data: job.data });
    } catch (error) {
      job.attempts++;
      
      if (job.attempts < job.maxAttempts) {
        const delay = job.backoffDelay * Math.pow(2, job.attempts - 1);
        log.warn('Job failed, retrying {*}', { 
          id: job.id, 
          name: job.name, 
          attempt: job.attempts, 
          maxAttempts: job.maxAttempts,
          delay,
          error,
        });
        
        setTimeout(() => {
          this.#queue.push(job);
          this.#process();
        }, delay);
      } else {
        log.error('Job failed {*}', { id: job.id, name: job.name, data: job.data, error });
        this.#emit('failed', job, error as Error);
        Sentry.captureException(error);
      }
    } finally {
      this.#activeJobs.delete(job.id);
    }
  }

  async getJobCounts(): Promise<{
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
  }> {
    return {
      waiting: this.#queue.length,
      active: this.#activeJobs.size,
      delayed: 0,
      failed: 0,
    };
  }

  close(): void {
    for (const cron of this.#crons.values()) {
      cron.stop();
    }
    this.#crons.clear();
    this.#queue = [];
    this.#activeJobs.clear();
    this.#handlers.clear();
    this.#listeners.clear();
  }
}

export const scheduler = new Scheduler();
