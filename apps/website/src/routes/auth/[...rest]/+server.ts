import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Authentication endpoints are disabled for local-only mode
const handler: RequestHandler = async () => {
  // Redirect to dashboard for local-only mode
  throw redirect(302, '/website/');
};

export { handler as GET, handler as POST };