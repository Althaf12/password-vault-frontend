import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PasswordList from '../components/PasswordList'
import AddPasswordForm from '../components/AddPasswordForm'
import styles from './Home.module.css'

export default function Home() {
  const { session, isGuest, handleLogin } = useAuth()

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.wrapper}>
          {/* ── Hero ── */}
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>
              {isGuest ? 'Welcome to Password Vault' : `Welcome back, ${session?.username || 'User'}`}
            </h1>
            <p className={styles.heroSub}>
              {isGuest
                ? 'Securely store and manage all your passwords in one place'
                : 'Securely manage all your passwords in one place'}
            </p>
            {isGuest && (
              <button className={styles.heroCta} onClick={handleLogin}>
                Sign In to Get Started
              </button>
            )}
          </section>

          {/* ── Content ── */}
          {!isGuest && (
            <div className={styles.content}>
              <PasswordList />
              <AddPasswordForm />
            </div>
          )}

          {/* ── Guest feature cards ── */}
          {isGuest && (
            <section className={styles.features}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3>End-to-End Encryption</h3>
                <p>Your passwords are encrypted before they leave your device</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3>Zero-Knowledge Architecture</h3>
                <p>We never see your master password or your data</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <h3>Cross-Platform Access</h3>
                <p>Access your vault from any device, anywhere</p>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
