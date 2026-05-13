import { type ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: ReactNode }) {
  const { isGuest } = useAuth()

  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.body}>
        {!isGuest && <Sidebar />}
        <div className={styles.content}>{children}</div>
      </div>
      <Footer />
    </div>
  )
}
