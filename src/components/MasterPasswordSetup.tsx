import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useVault } from '../context/VaultContext'
import styles from './MasterPasswordSetup.module.css'

interface Props {
  mode: 'setup' | 'unlock'
}

export default function MasterPasswordSetup({ mode }: Props) {
  const { setupMasterPassword, unlock } = useVault()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'setup') {
      if (password.length < 8) {
        setError('Master password must be at least 8 characters')
        return
      }
      if (password !== confirm) {
        setError('Passwords do not match')
        return
      }
    }

    setLoading(true)
    const err =
      mode === 'setup'
        ? await setupMasterPassword(password)
        : await unlock(password)
    setLoading(false)

    if (err) setError(err)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.iconWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className={styles.title}>
          {mode === 'setup' ? 'Create Master Password' : 'Unlock Your Vault'}
        </h1>
        <p className={styles.sub}>
          {mode === 'setup'
            ? 'Your master password encrypts all vault data client-side. It is never stored or sent to the server.'
            : 'Enter your master password to decrypt and access your vault.'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="mp-password" className={styles.label}>
              Master Password
            </label>
            <div className={styles.inputWrap}>
              <input
                id="mp-password"
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder={mode === 'setup' ? 'Create a strong master password' : 'Enter your master password'}
                autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                required
                autoFocus
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw((p) => !p)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {mode === 'setup' && (
            <div className={styles.field}>
              <label htmlFor="mp-confirm" className={styles.label}>
                Confirm Master Password
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="mp-confirm"
                  type={showPw ? 'text' : 'password'}
                  className={styles.input}
                  value={confirm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                  placeholder="Confirm your master password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} />
                {mode === 'setup' ? 'Setting up…' : 'Unlocking…'}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {mode === 'setup' ? (
                    <>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </>
                  ) : (
                    <>
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </>
                  )}
                </svg>
                {mode === 'setup' ? 'Create Vault' : 'Unlock Vault'}
              </>
            )}
          </button>
        </form>

        {mode === 'setup' && (
          <div className={styles.warning}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              <strong>Important:</strong> This password cannot be recovered. If you forget it, your encrypted data cannot be decrypted.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
