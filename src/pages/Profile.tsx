import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from './Profile.module.css'

export default function Profile() {
  const { session, handleLogout } = useAuth()

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.wrapper}>
          <div className={styles.card}>
            {/* ── Avatar section ── */}
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {session?.profileImageUrl ? (
                  <img src={session.profileImageUrl} alt="Avatar" className={styles.avatarImg} />
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="8" r="3" />
                    <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
                  </svg>
                )}
              </div>
              <h1 className={styles.name}>{session?.username || 'User'}</h1>
              <span className={styles.email}>{session?.email || '—'}</span>
              {session?.subscription?.plan && (
                <span className={styles.badge}>{session.subscription.plan}</span>
              )}
            </div>

            {/* ── Info sections ── */}
            <div className={styles.sections}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Personal Information
                </h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Username</span>
                    <span className={styles.infoValue}>{session?.username || '—'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{session?.email || '—'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>User ID</span>
                    <span className={styles.infoValue}>{session?.userId || '—'}</span>
                  </div>
                </div>
              </section>

              {session?.subscription && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Subscription
                  </h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Plan</span>
                      <span className={styles.infoValue}>{session.subscription.plan || '—'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Status</span>
                      <span className={styles.infoValue}>{session.subscription.status || '—'}</span>
                    </div>
                    {session.subscription.expiresAt && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Expires</span>
                        <span className={styles.infoValue}>{session.subscription.expiresAt}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                  Vault Statistics
                </h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total Passwords</span>
                    <span className={styles.infoValue}>3</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Last Updated</span>
                    <span className={styles.infoValue}>Today</span>
                  </div>
                </div>
              </section>
            </div>

            {/* ── Actions ── */}
            <div className={styles.actions}>
              <Link to="/" className={styles.backBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Vault
              </Link>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
