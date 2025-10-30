import { scheduler } from '@/runtime/scheduler';
import { crons, jobs } from './tasks';

const taskMap = Object.fromEntries([...jobs, ...crons].map((job) => [job.name, job.fn]));

for (const [name, handler] of Object.entries(taskMap)) {
  scheduler.register(name, handler);
}




export {scheduler as queue, scheduler as worker} from '@/runtime/scheduler';