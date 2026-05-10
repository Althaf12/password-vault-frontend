import { useState, useEffect, useCallback } from 'react'
import { useVault } from '../context/VaultContext'
import { listVaultItems, deleteVaultItem, getVersion } from '../vault/vaultService'
import type { VaultItemResponse } from '../vault/types'
import styles from './PasswordList.module.css'

export default function PasswordList() {
  const { vaultVersion, decryptPw, bumpVaultVersion } = useVault()
  const [items, setItems] = useState<VaultItemResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // revealed[vaultItemId] = decrypted plaintext or null while loading
  const [revealed, setRevealed] = useState<Record<number, string | null>>({})
  const [revealLoading, setRevealLoading] = useState<Record<number, boolean>>({})
  const [copied, setCopied] = useState<Record<number, boolean>>({})

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listVaultItems()
      setItems(data)
    } catch (err) {
      setError((err as Error).message || 'Failed to load vault items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
    // clear revealed passwords on refresh
    setRevealed({})
    setRevealLoading({})
  }, [fetchItems, vaultVersion])

  const toggleReveal = async (item: VaultItemResponse) => {
    const id = item.vaultItemId
    if (revealed[id] !== undefined) {
      setRevealed((prev) => { const n = { ...prev }; delete n[id]; return n })
      return
    }
    setRevealLoading((prev) => ({ ...prev, [id]: true }))
    try {
      const versionDetail = await getVersion(id, item.currentVersion)
      const plain = await decryptPw(versionDetail.passwordEncrypted, versionDetail.encryptionIv)
      setRevealed((prev) => ({ ...prev, [id]: plain }))
    } catch {
      setRevealed((prev) => ({ ...prev, [id]: '[Decryption failed]' }))
    } finally {
      setRevealLoading((prev) => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const copyPassword = async (item: VaultItemResponse) => {
    const id = item.vaultItemId
    try {
      let plain = revealed[id]
      if (!plain) {
        const versionDetail = await getVersion(id, item.currentVersion)
        plain = await decryptPw(versionDetail.passwordEncrypted, versionDetail.encryptionIv)
      }
      await navigator.clipboard.writeText(plain)
      setCopied((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => setCopied((prev) => { const n = { ...prev }; delete n[id]; return n }), 2000)
    } catch { /* ignore */ }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Move this item to trash?')) return
    try {
      await deleteVaultItem(id)
      bumpVaultVersion()
    } catch (err) {
      alert((err as Error).message || 'Failed to delete item')
    }
  }

  // colour palette for service icons (cycles by index)
  const ICON_COLORS = [
    '#818cf8', '#34d399', '#fb923c', '#f472b6',
    '#38bdf8', '#a78bfa', '#facc15', '#4ade80',
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingSpinner} />
        <span>Loading vault…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
        <button onClick={fetchItems} className={styles.retryBtn}>Retry</button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p>No passwords saved yet</p>
        <span className={styles.emptyHint}>Add your first password using the form below</span>
      </div>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
          Saved Passwords
        </h2>
        <span className={styles.count}>{items.length}</span>
      </div>

      <div className={styles.grid}>
        {items.map((item, idx) => {
          const iconColor = ICON_COLORS[idx % ICON_COLORS.length]
          const isRevealed = revealed[item.vaultItemId] !== undefined
          const isRevLoading = revealLoading[item.vaultItemId]
          const isCopied = copied[item.vaultItemId]

          return (
            <div key={item.vaultItemId} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.serviceIcon} style={{ background: `${iconColor}22`, color: iconColor, borderColor: `${iconColor}44` }}>
                  {item.title.charAt(0).toUpperCase()}
                </div>
                <div className={styles.serviceInfo}>
                  <h3 className={styles.serviceName}>{item.title}</h3>
                  <span className={styles.username}>{item.username || item.websiteUrl || '—'}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.copyBtn}
                    onClick={() => copyPassword(item)}
                    title={isCopied ? 'Copied!' : 'Copy password'}
                    aria-label="Copy password"
                  >
                    {isCopied ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.vaultItemId)}
                    title="Move to trash"
                    aria-label={`Delete ${item.title}`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {item.websiteUrl && (
                <a
                  href={item.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.websiteLink}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {item.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}

              <div className={styles.passwordRow}>
                <span className={styles.passwordLabel}>Password</span>
                <div className={styles.passwordValue}>
                  <code className={styles.passwordText}>
                    {isRevLoading ? '…' : isRevealed ? (revealed[item.vaultItemId] ?? '') : '••••••••••••'}
                  </code>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => toggleReveal(item)}
                    title={isRevealed ? 'Hide' : 'Reveal'}
                    aria-label={isRevealed ? 'Hide password' : 'Reveal password'}
                    disabled={isRevLoading}
                  >
                    {isRevLoading ? (
                      <span className={styles.miniSpinner} />
                    ) : isRevealed ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.versionBadge}>v{item.currentVersion}</span>
                <span className={styles.metaDate}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
