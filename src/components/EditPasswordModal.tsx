import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useVault } from '../context/VaultContext'
import { updateVaultItem, addVersion, listVersions, getVersion } from '../vault/vaultService'
import type { VaultItemResponse, VaultItemVersionSummary } from '../vault/types'
import styles from './EditPasswordModal.module.css'

interface Props {
  item: VaultItemResponse
  initialTab?: ActiveTab
  onClose: () => void
  onSaved: () => void
}

type ActiveTab = 'edit' | 'history'

export default function EditPasswordModal({ item, initialTab, onClose, onSaved }: Props) {
  const { encryptPw, decryptPw } = useVault()
  const [tab, setTab] = useState<ActiveTab>(initialTab ?? 'edit')

  // ── Edit state ────────────────────────────────────────────────────
  const [title, setTitle] = useState(item.title)
  const [username, setUsername] = useState(item.username ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(item.websiteUrl ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ── History state ─────────────────────────────────────────────────
  const [versions, setVersions] = useState<VaultItemVersionSummary[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [versionsError, setVersionsError] = useState<string | null>(null)
  const [revealedVersions, setRevealedVersions] = useState<Record<number, string>>({})
  const [revealLoadingVersions, setRevealLoadingVersions] = useState<Record<number, boolean>>({})
  const [copiedVersion, setCopiedVersion] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (tab === 'history') {
      loadVersions()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const loadVersions = async () => {
    setVersionsLoading(true)
    setVersionsError(null)
    try {
      const data = await listVersions(item.vaultItemId)
      setVersions([...data].sort((a, b) => b.versionNumber - a.versionNumber))
    } catch (err) {
      setVersionsError((err as Error).message || 'Failed to load version history')
    } finally {
      setVersionsLoading(false)
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)
    setSaving(true)
    try {
      await updateVaultItem(item.vaultItemId, {
        title,
        username: username || undefined,
        websiteUrl: websiteUrl || undefined,
      })
      if (newPassword.trim()) {
        const { passwordEncrypted, encryptionIv, encryptionAlgo } = await encryptPw(newPassword)
        await addVersion(item.vaultItemId, { passwordEncrypted, encryptionIv, encryptionAlgo })
        setNewPassword('')
      }
      setSaveSuccess(true)
      onSaved()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError((err as Error).message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const toggleRevealVersion = async (versionNumber: number) => {
    if (revealedVersions[versionNumber] !== undefined) {
      setRevealedVersions((prev) => {
        const n = { ...prev }
        delete n[versionNumber]
        return n
      })
      return
    }
    setRevealLoadingVersions((prev) => ({ ...prev, [versionNumber]: true }))
    try {
      const detail = await getVersion(item.vaultItemId, versionNumber)
      const plain = await decryptPw(detail.passwordEncrypted, detail.encryptionIv)
      setRevealedVersions((prev) => ({ ...prev, [versionNumber]: plain }))
    } catch {
      setRevealedVersions((prev) => ({ ...prev, [versionNumber]: '[Decryption failed]' }))
    } finally {
      setRevealLoadingVersions((prev) => {
        const n = { ...prev }
        delete n[versionNumber]
        return n
      })
    }
  }

  const copyVersion = async (versionNumber: number) => {
    try {
      let plain = revealedVersions[versionNumber]
      if (!plain) {
        const detail = await getVersion(item.vaultItemId, versionNumber)
        plain = await decryptPw(detail.passwordEncrypted, detail.encryptionIv)
      }
      await navigator.clipboard.writeText(plain)
      setCopiedVersion((prev) => ({ ...prev, [versionNumber]: true }))
      setTimeout(
        () =>
          setCopiedVersion((prev) => {
            const n = { ...prev }
            delete n[versionNumber]
            return n
          }),
        2000,
      )
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <span id="edit-modal-title" className={styles.modalTitle}>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {item.title}
          </span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'edit' ? styles.tabActive : ''}`}
            onClick={() => setTab('edit')}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Details
          </button>
          <button
            className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setTab('history')}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Version History
            <span className={styles.versionCount}>{item.currentVersion}</span>
          </button>
        </div>

        {/* ── Edit Tab ── */}
        {tab === 'edit' && (
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-title">
                Title <span className={styles.required}>*</span>
              </label>
              <input
                id="edit-title"
                className={styles.input}
                type="text"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g. Gmail, GitHub"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-username">
                Username / Email
              </label>
              <input
                id="edit-username"
                className={styles.input}
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                placeholder="username or email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-url">
                Website URL
              </label>
              <input
                id="edit-url"
                className={styles.input}
                type="url"
                value={websiteUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <hr className={styles.divider} />

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-password">
                New Password
                <span className={styles.labelOptional}>(leave blank to keep current)</span>
              </label>
              <div className={styles.passwordWrap}>
                <input
                  id="edit-password"
                  className={styles.input}
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  placeholder="Enter new password to create a new version"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {newPassword.trim() && (
                <span className={styles.hint}>
                  A new encrypted version will be created (v{item.currentVersion + 1}).
                </span>
              )}
            </div>

            {saveError && (
              <div className={styles.errorBox}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className={styles.successBox}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Changes saved successfully!
              </div>
            )}

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? (
                  <>
                    <span className={styles.spinner} />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div className={styles.historyPanel}>
            {versionsLoading && (
              <div className={styles.historyLoading}>
                <span className={styles.miniSpinner} />
                Loading history…
              </div>
            )}

            {versionsError && (
              <div className={styles.historyError}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {versionsError}
                <button className={styles.retryBtn} onClick={loadVersions}>
                  Retry
                </button>
              </div>
            )}

            {!versionsLoading && !versionsError && versions.length === 0 && (
              <p className={styles.noHistory}>No version history available.</p>
            )}

            {!versionsLoading &&
              !versionsError &&
              versions.map((v) => {
                const isCurrent = v.versionNumber === item.currentVersion
                const isRevealed = revealedVersions[v.versionNumber] !== undefined
                const isRevLoading = revealLoadingVersions[v.versionNumber]
                const isCopied = copiedVersion[v.versionNumber]

                return (
                  <div key={v.versionId} className={styles.versionItem}>
                    <div
                      className={`${styles.versionNum} ${isCurrent ? styles.versionCurrent : ''}`}
                    >
                      v{v.versionNumber}
                    </div>

                    <div className={styles.versionInfo}>
                      <div className={styles.versionMeta}>
                        {isCurrent && <span className={styles.currentBadge}>Current</span>}
                        <span className={styles.versionDate}>
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {isRevealed && (
                        <code className={styles.versionPasswordText}>
                          {revealedVersions[v.versionNumber]}
                        </code>
                      )}
                    </div>

                    <div className={styles.versionActions}>
                      <button
                        className={styles.versionRevealBtn}
                        onClick={() => toggleRevealVersion(v.versionNumber)}
                        disabled={isRevLoading}
                        title={isRevealed ? 'Hide password' : 'Reveal password'}
                        aria-label={isRevealed ? 'Hide password' : 'Reveal password'}
                      >
                        {isRevLoading ? (
                          <span className={styles.miniSpinner} />
                        ) : isRevealed ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>

                      <button
                        className={styles.versionCopyBtn}
                        onClick={() => copyVersion(v.versionNumber)}
                        title={isCopied ? 'Copied!' : 'Copy password'}
                        aria-label="Copy version password"
                      >
                        {isCopied ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
