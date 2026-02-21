import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>&copy; {new Date().getFullYear()} Password Vault</span>
        <span className={styles.dot}>·</span>
        <span className={styles.tagline}>Secure your passwords with confidence</span>
      </div>
    </footer>
  )
}
