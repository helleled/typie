import { dev } from '@/env';
import type * as jose from 'jose';

export const jwk: jose.JWK | null = null;
export const privateKey: unknown = null;
export const publicKey: unknown = null;

// OIDC disabled for localhost development
// Authentication is simplified for local-only operation
if (dev) {
  console.log('[Auth] OIDC authentication disabled in development mode');
}
