import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './ProtectedRoute.module.css'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthChecked, isGuest, handleLogin } = useAuth()

  if (!isAuthChecked) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Checking authentication…</p>
      </div>
    )
  }

  if (isGuest) {
    return (
      <div className={styles.centered}>
        <div className={styles.lockIcon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className={styles.heading}>Login Required</h2>
        <p className={styles.subtext}>Sign in to access your password vault</p>
        <button className={styles.loginBtn} onClick={handleLogin}>
          Sign In
        </button>
      </div>
    )
  }

  return <>{children}</>
}
