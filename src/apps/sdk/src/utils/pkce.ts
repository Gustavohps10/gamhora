import { createHash, randomBytes } from 'node:crypto'

import { PKCEPair } from '../contracts/oauth/IOAuthAPI'

/**
 * Generate a cryptographically random PKCE code_verifier and SHA-256 code_challenge (RFC 7636).
 */
export function generatePKCE(): PKCEPair {
  // Generate 32 random bytes -> 43 characters base64url string
  const codeVerifier = randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return {
    codeVerifier,
    codeChallenge,
  }
}
