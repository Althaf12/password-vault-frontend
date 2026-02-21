import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { checkAuth, toSessionData, logout as ssoLogout, redirectToLogin } from '../auth/authService'
import { clearAuthCookies } from '../auth/cookies'
import { MAIN_SITE_URL } from '../auth/config'
import type { SessionData } from '../types/app'

// ─── Context shape ──────────────────────────────────────────────────
interface AuthContextValue {
  session: SessionData | null
  isAuthChecked: boolean
  isGuest: boolean
  handleLogin: () => void
  handleLogout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Storage helpers ────────────────────────────────────────────────
const SESSION_KEY = 'session'
function loadSessionFromStorage(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as SessionData) : null
  } catch {
    return null
  }
}
function saveSession(s: SessionData | null) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  else localStorage.removeItem(SESSION_KEY)
}

const GUEST_SESSION: SessionData = { userId: 'guest-user', username: 'Guest' }

// ─── Provider ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(loadSessionFromStorage)
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  const isGuest = session?.userId === 'guest-user'

  // Initial auth check
  useEffect(() => {
    ;(async () => {
      const user = await checkAuth()
      if (user) {
        const sd = toSessionData(user)
        setSession(sd)
        saveSession(sd)
      } else {
        setSession(GUEST_SESSION)
        saveSession(null)
      }
      setIsAuthChecked(true)
    })()
  }, [])

  const refreshSession = useCallback(async () => {
    const user = await checkAuth()
    if (user) {
      const sd = toSessionData(user)
      setSession(sd)
      saveSession(sd)
    }
  }, [])

  const handleLogin = useCallback(() => {
    const redirect = window.location.href
    window.location.href = `${MAIN_SITE_URL}/login?redirect_uri=${encodeURIComponent(redirect)}`
  }, [])

  const handleLogout = useCallback(async () => {
    // Clear React state
    setSession(GUEST_SESSION)
    saveSession(null)
    clearAuthCookies()

    if (isGuest) {
      window.location.reload()
      return
    }

    await ssoLogout()
  }, [isGuest])

  return (
    <AuthContext.Provider
      value={{ session, isAuthChecked, isGuest, handleLogin, handleLogout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
