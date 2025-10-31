import { Hono } from 'hono';
import type { Env } from '@/context';

export const auth = new Hono<Env>();

// All authentication endpoints are disabled for local-only mode
auth.all('/*', (c) => {
  return c.json({ error: 'Authentication disabled for local-only mode' }, 503);
});