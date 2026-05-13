import { useState, useEffect } from 'react'
import { listTrash, restoreFromTrash, permanentlyDelete } from '../vault/vaultService'
import type { TrashItemResponse } from '../vault/types'
import styles from './Trash.module.css'

export default function Trash() {
  const [items, setItems] = useState<TrashItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({})

  const fetchTrash = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listTrash()
      setItems(data)
    } catch (err) {
      setError((err as Error).message || 'Failed to load trash')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrash() }, [])

  const handleRestore = async (vaultItemId: number) => {
    setActionLoading((prev) => ({ ...prev, [vaultItemId]: true }))
    try {
      await restoreFromTrash(vaultItemId)
      setItems((prev) => prev.filter((i) => i.vaultItemId !== vaultItemId))
    } catch (err) {
      alert((err as Error).message || 'Failed to restore item')
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[vaultItemId]; return n })
    }
  }

  const handlePermanentDelete = async (vaultItemId: number) => {
    if (!confirm('Permanently delete this item? This cannot be undone.')) return
    setActionLoading((prev) => ({ ...prev, [vaultItemId]: true }))
    try {
      await permanentlyDelete(vaultItemId)
      setItems((prev) => prev.filter((i) => i.vaultItemId !== vaultItemId))
    } catch (err) {
      alert((err as Error).message || 'Failed to permanently delete item')
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[vaultItemId]; return n })
    }
  }

  return (
    <main className={styles.main}>
        <div className={styles.wrapper}>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <div className={styles.pageTitleIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <div>
                <h1 className={styles.title}>Trash</h1>
                <p className={styles.sub}>Deleted items — restore or permanently remove them</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className={styles.loading}>
              <span className={styles.spinner} />
              Loading trash…
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <p>Trash is empty</p>
              <span>Deleted vault items will appear here</span>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className={styles.list}>
              {items.map((item) => {
                const busy = actionLoading[item.vaultItemId]
                return (
                  <div key={item.deletedId} className={styles.card}>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardIcon}>
                        {item.title.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.cardDetails}>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        <div className={styles.cardMeta}>
                          {item.username && <span>{item.username}</span>}
                          {item.websiteUrl && <span>{item.websiteUrl.replace(/^https?:\/\//, '')}</span>}
                        </div>
                        <div className={styles.cardDates}>
                          <span>Created: {new Date(item.originalCreatedAt).toLocaleDateString()}</span>
                          <span className={styles.deletedAt}>
                            Deleted: {new Date(item.deletedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.restoreBtn}
                        onClick={() => handleRestore(item.vaultItemId)}
                        disabled={busy}
                        title="Restore to vault"
                      >
                        {busy ? <span className={styles.miniSpinner} /> : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                        )}
                        Restore
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handlePermanentDelete(item.vaultItemId)}
                        disabled={busy}
                        title="Permanently delete"
                      >
                        {busy ? <span className={styles.miniSpinner} /> : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        )}
                        Delete Forever
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
    </main>
  )
}
