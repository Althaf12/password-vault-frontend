import { useAuth } from '../context/AuthContext'
import { useVault } from '../context/VaultContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PasswordList from '../components/PasswordList'
import AddPasswordForm from '../components/AddPasswordForm'
import MasterPasswordSetup from '../components/MasterPasswordSetup'
import styles from './Home.module.css'

export default function Home() {
  const { session, isGuest, handleLogin } = useAuth()
  const { lockState } = useVault()

  // Show unlock/setup overlay when authenticated but vault is locked
  const showVaultGate = !isGuest && (lockState === 'locked' || lockState === 'no-settings')

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
                : lockState === 'unlocked'
                  ? 'Your vault is unlocked — manage your passwords below'
                  : 'Securely manage all your passwords in one place'}
            </p>
            {isGuest && (
              <button className={styles.heroCta} onClick={handleLogin}>
                Sign In to Get Started
              </button>
            )}
          </section>

          {/* ── Vault gate overlay (setup / unlock) ── */}
          {showVaultGate && (
            <MasterPasswordSetup mode={lockState === 'no-settings' ? 'setup' : 'unlock'} />
          )}

          {/* ── Vault content ── */}
          {!isGuest && lockState === 'unlocked' && (
            <div className={styles.content}>
              <PasswordList />
              <AddPasswordForm />
            </div>
          )}

          {/* ── Checking state ── */}
          {!isGuest && lockState === 'checking' && (
            <div className={styles.checking}>
              <span className={styles.checkingSpinner} />
              <span>Checking vault…</span>
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
                <p>Your passwords are encrypted with AES-256-GCM before they leave your device</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3>Zero-Knowledge Architecture</h3>
                <p>Keys derived with Argon2id — we never see your master password or plaintext</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3>Full Audit Trail</h3>
                <p>Every access logged — know exactly when and where your vault was accessed</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3>Password History</h3>
                <p>Keep up to 20 versions per entry — roll back whenever you need</p>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
