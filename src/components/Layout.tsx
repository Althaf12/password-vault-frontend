import { type ReactNode, useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: ReactNode }) {
  const { isGuest } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <Header onMobileMenuToggle={() => setMobileSidebarOpen((o) => !o)} />
      <div className={styles.body}>
        {!isGuest && (
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        )}
        {mobileSidebarOpen && !isGuest && (
          <div
            className={styles.mobileBackdrop}
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <div className={styles.content}>{children}</div>
      </div>
      <Footer />
    </div>
  )
}
