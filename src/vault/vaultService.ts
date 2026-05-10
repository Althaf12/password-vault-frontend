import { authFetch } from '../auth/httpClient'
import type {
  CryptoSettingsResponse,
  CryptoSettingsRequest,
  VaultItemResponse,
  CreateVaultItemRequest,
  UpdateVaultItemRequest,
  VaultItemVersionSummary,
  VaultItemVersionDetail,
  AddVersionRequest,
  TrashItemResponse,
  AuditLogResponse,
  ViewSessionResponse,
} from './types'

// ── Crypto Settings ───────────────────────────────────────────────────

export async function getCryptoSettings(): Promise<CryptoSettingsResponse | null> {
  try {
    return await authFetch<CryptoSettingsResponse>('/vault/crypto-settings')
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 404) return null
    throw err
  }
}

export async function saveCryptoSettings(req: CryptoSettingsRequest): Promise<CryptoSettingsResponse> {
  return authFetch<CryptoSettingsResponse>('/vault/crypto-settings', {
    method: 'PUT',
    body: JSON.stringify(req),
  })
}

// ── Vault Items ───────────────────────────────────────────────────────

export async function listVaultItems(): Promise<VaultItemResponse[]> {
  return authFetch<VaultItemResponse[]>('/vault/items')
}

export async function getVaultItem(vaultItemId: number): Promise<VaultItemResponse> {
  return authFetch<VaultItemResponse>(`/vault/items/${vaultItemId}`)
}

export async function createVaultItem(req: CreateVaultItemRequest): Promise<VaultItemResponse> {
  return authFetch<VaultItemResponse>('/vault/items', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

export async function updateVaultItem(
  vaultItemId: number,
  req: UpdateVaultItemRequest,
): Promise<VaultItemResponse> {
  return authFetch<VaultItemResponse>(`/vault/items/${vaultItemId}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  })
}

export async function deleteVaultItem(vaultItemId: number): Promise<void> {
  await authFetch(`/vault/items/${vaultItemId}`, { method: 'DELETE' })
}

// ── Password Versions ─────────────────────────────────────────────────

export async function listVersions(vaultItemId: number): Promise<VaultItemVersionSummary[]> {
  return authFetch<VaultItemVersionSummary[]>(`/vault/items/${vaultItemId}/versions`)
}

export async function getVersion(
  vaultItemId: number,
  versionNumber: number,
): Promise<VaultItemVersionDetail> {
  return authFetch<VaultItemVersionDetail>(`/vault/items/${vaultItemId}/versions/${versionNumber}`)
}

export async function addVersion(
  vaultItemId: number,
  req: AddVersionRequest,
): Promise<VaultItemVersionDetail> {
  return authFetch<VaultItemVersionDetail>(`/vault/items/${vaultItemId}/versions`, {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

// ── Trash ─────────────────────────────────────────────────────────────

export async function listTrash(): Promise<TrashItemResponse[]> {
  return authFetch<TrashItemResponse[]>('/vault/trash')
}

export async function restoreFromTrash(vaultItemId: number): Promise<VaultItemResponse> {
  return authFetch<VaultItemResponse>(`/vault/trash/${vaultItemId}/restore`, { method: 'POST' })
}

export async function permanentlyDelete(vaultItemId: number): Promise<void> {
  await authFetch(`/vault/trash/${vaultItemId}`, { method: 'DELETE' })
}

// ── Audit Logs ────────────────────────────────────────────────────────

export async function getAuditLogs(): Promise<AuditLogResponse[]> {
  return authFetch<AuditLogResponse[]>('/vault/audit')
}

export async function getAuditLogsForItem(vaultItemId: number): Promise<AuditLogResponse[]> {
  return authFetch<AuditLogResponse[]>(`/vault/audit/${vaultItemId}`)
}

// ── View Sessions ─────────────────────────────────────────────────────

export async function getViewSessions(): Promise<ViewSessionResponse[]> {
  return authFetch<ViewSessionResponse[]>('/vault/view-sessions')
}

export async function getViewSessionsForItem(vaultItemId: number): Promise<ViewSessionResponse[]> {
  return authFetch<ViewSessionResponse[]>(`/vault/view-sessions/${vaultItemId}`)
}
