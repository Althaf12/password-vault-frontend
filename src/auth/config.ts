export const AUTH_BASE_URL: string = import.meta.env.VITE_AUTH_BASE_URL
export const MAIN_SITE_URL: string = import.meta.env.VITE_MAIN_SITE_URL
export const APP_BASE_URL: string = import.meta.env.VITE_APP_BASE_URL
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE

/**
 * Build login URL with redirect back to current page.
 * For SSO, we redirect to auth.eternivity.com/login (or localhost:8080/login in dev).
 */
export function getLoginUrl(redirectUri?: string): string {
  const redirect = redirectUri || window.location.href
  return `${AUTH_BASE_URL}/login?redirect_uri=${encodeURIComponent(redirect)}`
}

export function getRegistrationUrl(): string {
  return `${MAIN_SITE_URL}/register`
}

export function getLogoutUrl(): string {
  return `${AUTH_BASE_URL}/api/auth/logout`
}

export function getAuthMeUrl(): string {
  return `${AUTH_BASE_URL}/api/auth/me`
}

export function getRefreshUrl(): string {
  return `${AUTH_BASE_URL}/api/auth/refresh`
}
