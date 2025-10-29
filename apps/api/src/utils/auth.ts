import * as jose from 'jose';
import { env } from '@/env';
import { decode } from './text';

export let jwk: jose.JWK | null = null;
export let privateKey: jose.KeyLike | null = null;
export let publicKey: jose.KeyLike | null = null;

// OIDC is optional for development - only initialize if properly configured
if (env.OIDC_JWK) {
  try {
    // Trim whitespace and validate the input
    const jwkInput = env.OIDC_JWK.trim();

    if (!jwkInput) {
      throw new Error('OIDC_JWK is empty or contains only whitespace');
    }

    // Try to parse as JSON first (plain JSON format from documentation)
    // If that fails, try to decode as base64url (encoded format)
    let jwkString: string;

    if (jwkInput.startsWith('{')) {
      // Input appears to be plain JSON
      jwkString = jwkInput;
    } else {
      // Input appears to be base64url-encoded, try to decode it
      try {
        // Validate base64url characters
        if (!/^[A-Za-z0-9_-]+$/.test(jwkInput)) {
          throw new Error('Invalid base64url characters detected');
        }

        const decodedBytes = Uint8Array.fromBase64(jwkInput, {
          alphabet: 'base64url',
          lastChunkHandling: 'loose',
        });
        jwkString = decode(decodedBytes);
      } catch (err) {
        throw new Error(
          `Failed to decode base64url JWK: ${err instanceof Error ? err.message : String(err)}. ` +
            'OIDC_JWK should be either a JSON string like {"kty":"RSA",...} or a valid base64url-encoded string.',
        );
      }
    }

    // Parse the JWK JSON
    jwk = JSON.parse(jwkString) as jose.JWK;

    // Validate required JWK fields
    if (!jwk.kty) {
      throw new Error('JWK missing required field: kty');
    }

    const publicJwk = { kid: jwk.kid, kty: jwk.kty, alg: jwk.alg, crv: jwk.crv, x: jwk.x };

    privateKey = await jose.importJWK(jwk, jwk.alg);
    publicKey = await jose.importJWK(publicJwk, jwk.alg);

    console.log('[OIDC] JWK loaded successfully');
  } catch (err) {
    console.warn('[OIDC] Invalid JWK configuration, OIDC features disabled:', err instanceof Error ? err.message : String(err));
    jwk = null;
    privateKey = null;
    publicKey = null;
  }
}
