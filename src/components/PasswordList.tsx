import { useState } from 'react'
import styles from './PasswordList.module.css'

interface PasswordEntry {
  id: number
  service: string
  username: string
  password: string
}

export default function PasswordList() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([
    { id: 1, service: 'Email', username: 'user@example.com', password: '••••••••' },
    { id: 2, service: 'Social Media', username: 'john_doe', password: '••••••••' },
    { id: 3, service: 'Banking', username: 'john.doe', password: '••••••••' },
  ])

  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})

  const togglePassword = (id: number) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const deletePassword = (id: number) => {
    setPasswords((prev) => prev.filter((p) => p.id !== id))
  }

  if (passwords.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p>No passwords saved yet</p>
        <span className={styles.emptyHint}>Add your first password below</span>
      </div>
    )
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
        Saved Passwords
        <span className={styles.count}>{passwords.length}</span>
      </h2>

      <div className={styles.grid}>
        {passwords.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.serviceIcon}>
                {item.service.charAt(0).toUpperCase()}
              </div>
              <div className={styles.serviceInfo}>
                <h3 className={styles.serviceName}>{item.service}</h3>
                <span className={styles.username}>{item.username}</span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => deletePassword(item.id)}
                title="Delete"
                aria-label={`Delete ${item.service}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>

            <div className={styles.passwordRow}>
              <span className={styles.passwordLabel}>Password</span>
              <div className={styles.passwordValue}>
                <code className={styles.passwordText}>
                  {showPassword[item.id] ? 'Demo-Pass123!' : '••••••••••'}
                </code>
                <button
                  className={styles.toggleBtn}
                  onClick={() => togglePassword(item.id)}
                  title={showPassword[item.id] ? 'Hide' : 'Show'}
                  aria-label={showPassword[item.id] ? 'Hide password' : 'Show password'}
                >
                  {showPassword[item.id] ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
