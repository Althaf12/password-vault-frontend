import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useVault } from '../context/VaultContext'
import { createVaultItem } from '../vault/vaultService'
import styles from './AddPasswordForm.module.css'

interface FormState {
  title: string
  username: string
  websiteUrl: string
  password: string
  notes: string
}

const EMPTY: FormState = { title: '', username: '', websiteUrl: '', password: '', notes: '' }

export default function AddPasswordForm() {
  const { encryptPw, bumpVaultVersion } = useVault()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      // Encrypt password client-side before sending to server
      const { passwordEncrypted, encryptionIv, encryptionAlgo } = await encryptPw(form.password)

      await createVaultItem({
        title: form.title,
        username: form.username || undefined,
        websiteUrl: form.websiteUrl || undefined,
        passwordEncrypted,
        encryptionIv,
        encryptionAlgo,
      })

      setForm(EMPTY)
      setSuccess(true)
      bumpVaultVersion()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError((err as Error).message || 'Failed to save password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Add New Password
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>Title <span className={styles.required}>*</span></label>
          <input
            id="title"
            name="title"
            type="text"
            className={styles.input}
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Gmail, GitHub, Netflix"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="username" className={styles.label}>Username / Email</label>
          <input
            id="username"
            name="username"
            type="text"
            className={styles.input}
            value={form.username}
            onChange={handleChange}
            placeholder="username or email"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="websiteUrl" className={styles.label}>Website URL</label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            className={styles.input}
            value={form.websiteUrl}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password <span className={styles.required}>*</span></label>
          <div className={styles.passwordWrap}>
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPw(!showPw)}
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

        {error && (
          <div className={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Password saved and encrypted successfully!
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <>
              <span className={styles.spinner} />
              Encrypting &amp; Saving…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Save Encrypted Password
            </>
          )}
        </button>
      </form>
    </section>
  )
}
