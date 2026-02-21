import { AUTH_BASE_URL, APP_BASE_URL, API_BASE_URL, getLoginUrl } from './config'
import type { SessionData } from '../types/app'

// ─── Types ──────────────────────────────────────────────────────────
export type AuthUser = {
  userId: string
  username?: string
  email?: string
  profileImageUrl?: string
  subscription?: { plan?: string; status?: string; expiresAt?: string }
}

export type LoginResult = {
  success: boolean
  user?: AuthUser
  error?: string
}

// ─── Module-level dedup for refreshAuth ─────────────────────────────
let refreshPromise: Promise<boolean> | null = null

// ─── Helpers ────────────────────────────────────────────────────────
function parseUserId(data: Record<string, unknown>): string {
  return String(data.userId ?? data.user_id ?? data.id ?? data.sub ?? '')
}

function parseUsername(data: Record<string, unknown>): string | undefined {
  return (data.username ?? data.name ?? data.displayName) as string | undefined
}

function parseProfileImage(data: Record<string, unknown>): string | undefined {
  return (data.profileImageUrl ?? data.profile_image ?? data.avatar ?? data.picture) as
    | string
    | undefined
}

// ─── Core Functions ─────────────────────────────────────────────────

/** POST login with identifier (username or email) + password */
export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, password }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { success: false, error: body.message || body.error || 'Login failed' }
    }

    const user = await checkAuth()
    if (!user) return { success: false, error: 'Could not retrieve user after login' }
    return { success: true, user }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Network error' }
  }
}

/** POST Google one-tap credential */
export async function loginWithGoogle(credential: string): Promise<LoginResult> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/google`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { success: false, error: body.message || body.error || 'Google login failed' }
    }

    const user = await checkAuth()
    if (!user) return { success: false, error: 'Could not retrieve user after Google login' }
    return { success: true, user }
  } catch (err) {
    return { success: false, error: (err as Error).message || 'Network error' }
  }
}

/** GET /api/auth/me — returns AuthUser or null (unauthenticated) */
export async function checkAuth(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    })

    if (res.status === 401) return null
    if (!res.ok) return null

    const data = (await res.json()) as Record<string, unknown>

    const userId = parseUserId(data)
    if (!userId) return null

    return {
      userId,
      username: parseUsername(data),
      email: data.email as string | undefined,
      profileImageUrl: parseProfileImage(data),
      subscription: data.subscription as AuthUser['subscription'] | undefined,
    }
  } catch {
    return null
  }
}

/** POST /api/auth/refresh — deduplicated */
export async function refreshAuth(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      return res.ok
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/** Redirect browser to SSO login page */
export function redirectToLogin(redirectUri?: string): void {
  window.location.href = getLoginUrl(redirectUri)
}

/**
 * Logout — two calls in sequence:
 * 1. App API logout (best-effort)
 * 2. SSO logout (clears HttpOnly cookies)
 * Then redirect to APP_BASE_URL.
 */
export async function logout(): Promise<void> {
  // 1. Application API logout (best-effort)
  try {
    await fetch(`${API_BASE_URL}/user/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Intentionally swallowed — must not block SSO logout
  }

  // 2. SSO logout
  try {
    await fetch(`${AUTH_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Best-effort
  }

  // 3. Redirect
  window.location.href = APP_BASE_URL
}

/** Map AuthUser to SessionData (token always undefined) */
export function toSessionData(user: AuthUser): SessionData {
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    token: undefined,
    subscription: user.subscription,
  }
}

// Default export for convenience
const authService = {
  login,
  loginWithGoogle,
  checkAuth,
  refreshAuth,
  redirectToLogin,
  logout,
  toSessionData,
}
export default authService
