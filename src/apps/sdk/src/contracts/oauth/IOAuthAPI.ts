export interface PKCEPair {
  codeVerifier: string
  codeChallenge: string
}

export interface OAuthAuthorizeOptions {
  authUrl: string
  state?: string
  timeoutMs?: number
}

export interface OAuthResult {
  code: string
  state?: string
  [param: string]: string | undefined
}

export interface IOAuthAPI {
  generatePKCE(): PKCEPair
  authorize(options: OAuthAuthorizeOptions): Promise<OAuthResult>
}
