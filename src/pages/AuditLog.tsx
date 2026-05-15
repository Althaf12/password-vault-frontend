import { useState, useEffect } from 'react'
import { getAuditLogs } from '../vault/vaultService'
import type { AuditLogResponse, AuditActionType } from '../vault/types'
import styles from './AuditLog.module.css'

const ACTION_LABELS: Record<AuditActionType, { label: string; color: string }> = {
  CREATE:           { label: 'Create',            color: 'success' },
  VIEW:             { label: 'View',               color: 'info' },
  VIEW_PASSWORD:    { label: 'View Password',      color: 'warning' },
  UPDATE:           { label: 'Update',             color: 'info' },
  ADD_VERSION:      { label: 'Add Version',        color: 'accent' },
  DELETE:           { label: 'Delete',             color: 'danger' },
  RESTORE:          { label: 'Restore',            color: 'success' },
  PERMANENT_DELETE: { label: 'Permanent Delete',   color: 'danger' },
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAuditLogs()
        setLogs(data)
      } catch (err) {
        setError((err as Error).message || 'Failed to load audit logs')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.actionType === filter)
  const actionTypes: string[] = ['ALL', 'CREATE', 'VIEW', 'VIEW_PASSWORD', 'UPDATE', 'ADD_VERSION', 'DELETE', 'RESTORE', 'PERMANENT_DELETE']

  return (
    <main className={styles.main}>
        <div className={styles.wrapper}>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <div className={styles.pageTitleIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h1 className={styles.title}>Audit Log</h1>
                <p className={styles.sub}>All security events for your vault account</p>
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div className={styles.filters}>
            {actionTypes.map((type) => (
              <button
                key={type}
                className={`${styles.filterChip} ${filter === type ? styles.filterChipActive : ''}`}
                onClick={() => setFilter(type)}
              >
                {type === 'ALL' ? 'All Events' : (ACTION_LABELS[type as AuditActionType]?.label ?? type)}
              </button>
            ))}
          </div>

          {loading && (
            <div className={styles.loading}>
              <span className={styles.spinner} />
              Loading audit logs…
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

          {!loading && !error && filtered.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p>No audit events found</p>
              <span>Events will appear here as you use your vault</span>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className={styles.logTable}>
              <div className={styles.tableScroll}>
                <div className={styles.tableHeader}>
                  <span>Action</span>
                  <span>Item ID</span>
                  <span>Status</span>
                  <span>IP Address</span>
                  <span>Timestamp</span>
                </div>
                {filtered.map((log) => {
                  const meta = ACTION_LABELS[log.actionType] ?? { label: log.actionType, color: 'info' }
                  return (
                    <div key={log.auditId} className={styles.tableRow}>
                      <span>
                        <span className={`${styles.actionBadge} ${styles['badge_' + meta.color]}`}>
                          {meta.label}
                        </span>
                      </span>
                      <span className={styles.itemId}>#{log.vaultItemId}</span>
                      <span>
                        <span className={`${styles.statusBadge} ${log.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFail}`}>
                          {log.status}
                        </span>
                      </span>
                      <span className={styles.ip}>{log.ipAddress}</span>
                      <span className={styles.timestamp}>
                        {new Date(log.actionTimestamp).toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
    </main>
  )
}
