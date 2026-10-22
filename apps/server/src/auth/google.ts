import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Verifies a Google Identity Services ID token (the `credential` returned by the
 * "Sign in with Google" button). Only used when GOOGLE_CLIENT_ID is configured.
 */
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string;
}

export async function verifyGoogleCredential(credential: string, clientId: string): Promise<GoogleIdentity> {
  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  });
  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Google token is missing required claims.');
  }
  if (payload.email_verified !== true) {
    throw new Error('Google account email is not verified.');
  }
  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim().slice(0, 60) : payload.email.split('@')[0]!,
  };
}
