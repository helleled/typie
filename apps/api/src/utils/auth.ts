import * as jose from 'jose';
import { env } from '@/env';
import { decode } from './text';

export let jwk: jose.JWK | null = null;
export let privateKey: jose.KeyLike | null = null;
export let publicKey: jose.KeyLike | null = null;

// OIDC is optional for development - only initialize if properly configured
if (env.OIDC_JWK) {
  try {
    jwk = JSON.parse(
      decode(Uint8Array.fromBase64(env.OIDC_JWK, { alphabet: 'base64url', lastChunkHandling: 'loose' })),
    ) as jose.JWK;
    const publicJwk = { kid: jwk.kid, kty: jwk.kty, alg: jwk.alg, crv: jwk.crv, x: jwk.x };

    privateKey = await jose.importJWK(jwk, jwk.alg);
    publicKey = await jose.importJWK(publicJwk, jwk.alg);
  } catch (e) {
    console.warn('[OIDC] Invalid JWK configuration, OIDC features disabled:', e);
  }
}
