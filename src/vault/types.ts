// ── Crypto Settings ─────────────────────────────────────────────────

export interface CryptoSettingsResponse {
  userId: string
  kdfAlgorithm: string
  kdfSalt: string // base64
  kdfIterations: number
  kdfMemoryKb: number
  kdfParallelism: number
  createdAt: string
  updatedAt: string
}

export interface CryptoSettingsRequest {
  kdfAlgorithm: string
  kdfSalt: string // base64
  kdfIterations: number
  kdfMemoryKb: number
  kdfParallelism: number
}

// ── Vault Items ──────────────────────────────────────────────────────

export type VaultItemStatus = 'ACTIVE' | 'DELETED'

export interface VaultItemResponse {
  vaultItemId: number
  userId: string
  title: string
  websiteUrl: string | null
  username: string | null
  notesEncrypted: string | null
  status: VaultItemStatus
  currentVersion: number
  createdAt: string
  updatedAt: string
}

export interface CreateVaultItemRequest {
  title: string
  websiteUrl?: string
  username?: string
  notesEncrypted?: string
  passwordEncrypted: string
  encryptionIv: string
  encryptionAlgo: string
}

export interface UpdateVaultItemRequest {
  title: string
  websiteUrl?: string
  username?: string
  notesEncrypted?: string
}

// ── Password Versions ────────────────────────────────────────────────

export interface VaultItemVersionSummary {
  versionId: number
  vaultItemId: number
  versionNumber: number
  encryptionAlgo: string
  createdBy: string
  createdAt: string
}

export interface VaultItemVersionDetail {
  versionId: number
  vaultItemId: number
  versionNumber: number
  passwordEncrypted: string
  encryptionIv: string
  encryptionAlgo: string
  createdBy: string
  createdAt: string
}

export interface AddVersionRequest {
  passwordEncrypted: string
  encryptionIv: string
  encryptionAlgo: string
}

// ── Trash ────────────────────────────────────────────────────────────

export interface TrashItemResponse {
  deletedId: number
  vaultItemId: number
  userId: string
  title: string
  websiteUrl: string | null
  username: string | null
  deletedAt: string
  originalCreatedAt: string
}

// ── Audit Logs ───────────────────────────────────────────────────────

export type AuditActionType =
  | 'CREATE'
  | 'VIEW'
  | 'VIEW_PASSWORD'
  | 'UPDATE'
  | 'ADD_VERSION'
  | 'DELETE'
  | 'RESTORE'
  | 'PERMANENT_DELETE'

export interface AuditLogResponse {
  auditId: number
  userId: string
  vaultItemId: number
  actionType: AuditActionType
  ipAddress: string
  userAgent: string
  status: string
  actionTimestamp: string
}

// ── View Sessions ────────────────────────────────────────────────────

export interface ViewSessionResponse {
  sessionId: number
  userId: string
  vaultItemId: number
  sessionIp: string
  viewedAt: string
}

// ── API Error ────────────────────────────────────────────────────────

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
}

// ── Vault Context state ──────────────────────────────────────────────

export type VaultLockState = 'checking' | 'no-settings' | 'locked' | 'unlocked'
