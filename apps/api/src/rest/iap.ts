import { Hono } from 'hono';
import type { Env } from '@/context';

export const iap = new Hono<Env>();

iap.post('/appstore', async (c) => {
  return c.json({ message: 'IAP features disabled for local mode' }, 404);
});

iap.post('/googleplay', async (c) => {
  return c.json({ message: 'IAP features disabled for local mode' }, 404);
});
