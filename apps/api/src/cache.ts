import { Redis } from 'ioredis';
import { env } from '@/env';

// Use simple Redis URL connection instead of Sentinel mode for development
export const redis = new Redis(env.REDIS_URL);
