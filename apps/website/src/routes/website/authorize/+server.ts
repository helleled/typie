import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Authorization endpoint is disabled for local-only mode
export const GET: RequestHandler = async () => {
  // Redirect directly to dashboard for local-only mode
  redirect(302, '/website/');
};