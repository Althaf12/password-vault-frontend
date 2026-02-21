const COOKIE_NAMES = [
  'et_token',
  'et_user_id',
  'et_username',
  'et_email',
  'et_subscription',
  'token',
  'userId',
  'user_id',
  'username',
  'email',
  'subscription',
  'eternivity_auth',
]

/** Parse document.cookie into a Record<string, string> */
export function parseCookies(): Record<string, string> {
  return document.cookie
    .split(';')
    .reduce<Record<string, string>>((acc, pair) => {
      const idx = pair.indexOf('=')
      if (idx === -1) return acc
      const key = pair.substring(0, idx).trim()
      const val = decodeURIComponent(pair.substring(idx + 1).trim())
      if (key) acc[key] = val
      return acc
    }, {})
}

/** Get a specific cookie value */
export function getCookie(name: string): string | undefined {
  return parseCookies()[name]
}

/** Try to read auth data from visible cookies */
export function getAuthFromCookies(): {
  token?: string
  userId?: string
  username?: string
  email?: string
  subscription?: string
} | null {
  const cookies = parseCookies()

  // Try consolidated eternivity_auth cookie first
  const consolidated = cookies['eternivity_auth']
  if (consolidated) {
    try {
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(consolidated)
      } catch {
        // Might be base64-encoded
        parsed = JSON.parse(atob(consolidated))
      }
      return {
        token: parsed.token as string | undefined,
        userId: (parsed.userId ?? parsed.user_id) as string | undefined,
        username: parsed.username as string | undefined,
        email: parsed.email as string | undefined,
        subscription: parsed.subscription as string | undefined,
      }
    } catch {
      // Fall through to individual cookies
    }
  }

  // Try individual cookies
  const token = cookies['et_token'] || cookies['token']
  const userId = cookies['et_user_id'] || cookies['userId'] || cookies['user_id']
  const username = cookies['et_username'] || cookies['username']
  const email = cookies['et_email'] || cookies['email']
  const subscription = cookies['et_subscription'] || cookies['subscription']

  if (!token && !userId) return null

  return { token, userId, username, email, subscription }
}

/** Check if any auth cookies are present */
export function isAuthenticatedViaCookies(): boolean {
  return getAuthFromCookies() !== null
}

/** Clear all known auth cookies across domain variations */
export function clearAuthCookies(): void {
  const hostname = window.location.hostname
  const domains = [hostname]

  // Add eternivity.com variants for production
  if (hostname.endsWith('.eternivity.com')) {
    domains.push('.eternivity.com', 'eternivity.com')
  }

  const paths = ['/', '']

  for (const name of COOKIE_NAMES) {
    for (const domain of domains) {
      for (const path of paths) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`
      }
    }
    // Also clear without domain
    for (const path of paths) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
    }
  }
}
