import './metrics';

import { queue } from './bullmq';
import { crons } from './tasks';
import type { JobMap, JobName } from './tasks';
import type { JobFn } from './types';

type JobOptions = {
  attempts?: number;
  backoff?: {
    type: 'exponential';
    delay: number;
  };
  jobId?: string;
  delay?: number;
};

for (const cron of crons) {
  queue.upsertCron({
    name: cron.name,
    pattern: cron.pattern,
    tz: 'Asia/Seoul',
  });
}

export const enqueueJob = async <N extends JobName, F extends JobMap[N]>(
  name: N,
  payload: F extends JobFn<infer P> ? P : never,
  options?: JobOptions,
) => {
  await queue.add(name, payload, options);
};
