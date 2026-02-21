import { useState, type FormEvent, type ChangeEvent } from 'react'
import styles from './AddPasswordForm.module.css'

interface FormState {
  service: string
  username: string
  password: string
}

export default function AddPasswordForm() {
  const [form, setForm] = useState<FormState>({ service: '', username: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: call backend to persist encrypted password
    console.log('Saving password:', form)
    alert(`Password for ${form.service} saved successfully!`)
    setForm({ service: '', username: '', password: '' })
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
          <label htmlFor="service" className={styles.label}>Service</label>
          <input
            id="service"
            name="service"
            type="text"
            className={styles.input}
            value={form.service}
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
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <div className={styles.passwordWrap}>
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
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

        <button type="submit" className={styles.submitBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Add Password
        </button>
      </form>
    </section>
  )
}
