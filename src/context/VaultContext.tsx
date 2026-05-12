import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { getCryptoSettings, saveCryptoSettings } from '../vault/vaultService'
import {
  deriveKey,
  generateSalt,
  encryptPassword,
  decryptPassword,
  type EncryptResult,
} from '../vault/cryptoService'
import type {
  CryptoSettingsResponse,
  VaultLockState,
} from '../vault/types'

// Re-export for convenience
export type { EncryptResult }

// ── Context Shape ─────────────────────────────────────────────────────

interface VaultContextValue {
  lockState: VaultLockState
  cryptoSettings: CryptoSettingsResponse | null
  /** Set up a brand-new master password (first time). Returns error string or null. */
  setupMasterPassword: (masterPassword: string) => Promise<string | null>
  /** Unlock vault with existing master password. Returns error string or null. */
  unlock: (masterPassword: string) => Promise<string | null>
  /** Clear the derived key from memory (lock the vault). */
  lock: () => void
  /** Encrypt a plaintext password with the derived key. */
  encryptPw: (plain: string) => Promise<EncryptResult>
  /** Decrypt an encrypted password blob with the derived key. */
  decryptPw: (encrypted: string, iv: string) => Promise<string>
  /** Reload vault items trigger (bump to force re-fetch in PasswordList). */
  vaultVersion: number
  bumpVaultVersion: () => void
}

// ── Default KDF parameters ────────────────────────────────────────────

const DEFAULT_KDF = {
  kdfAlgorithm: 'ARGON2ID',
  kdfIterations: 3,
  kdfMemoryKb: 65536,
  kdfParallelism: 4,
}

// ── Context ───────────────────────────────────────────────────────────

const VaultContext = createContext<VaultContextValue | undefined>(undefined)

export function VaultProvider({ children }: { children: ReactNode }) {
  const { isAuthChecked, isGuest } = useAuth()
  const [lockState, setLockState] = useState<VaultLockState>('checking')
  const [cryptoSettings, setCryptoSettings] = useState<CryptoSettingsResponse | null>(null)
  const [vaultVersion, setVaultVersion] = useState(0)

  // Keep derived key in a ref — not reactive state — so it never leaks into logs/devtools
  const derivedKeyRef = useRef<CryptoKey | null>(null)

  // ── Once auth is confirmed, check if KDF settings exist ────────────
  // Wait for isAuthChecked to be true so auth cookies are established
  // before making the API call. Prevents a race-condition 502 in production
  // where the vault request fires before the session is validated.
  useEffect(() => {
    if (!isAuthChecked) return          // Auth check still in flight
    if (isGuest) return                 // No vault for unauthenticated users

    let cancelled = false
    ;(async () => {
      try {
        const settings = await getCryptoSettings()
        if (cancelled) return
        if (settings) {
          setCryptoSettings(settings)
          setLockState('locked')
        } else {
          setLockState('no-settings')
        }
      } catch {
        // Do not conflate a server/network error with "no settings exist".
        // 'error' lets the UI show a retry prompt instead of the setup form.
        if (!cancelled) setLockState('error')
      }
    })()
    return () => { cancelled = true }
  }, [isAuthChecked, isGuest])

  // ── Setup master password (first-time) ─────────────────────────────
  const setupMasterPassword = useCallback(async (masterPassword: string): Promise<string | null> => {
    try {
      const kdfSalt = generateSalt(32)
      const req = { ...DEFAULT_KDF, kdfSalt }
      const settings = await saveCryptoSettings(req)
      const key = await deriveKey(masterPassword, settings)
      derivedKeyRef.current = key
      setCryptoSettings(settings)
      setLockState('unlocked')
      return null
    } catch (err) {
      return (err as Error).message || 'Failed to set up master password'
    }
  }, [])

  // ── Unlock vault with existing master password ─────────────────────
  const unlock = useCallback(async (masterPassword: string): Promise<string | null> => {
    try {
      const settings = cryptoSettings ?? await getCryptoSettings()
      if (!settings) return 'Crypto settings not found'

      const key = await deriveKey(masterPassword, settings)

      // Quick sanity check: we can't verify the key against stored data without
      // a verification ciphertext, so we trust the user input here.
      // Decryption failures on first use will surface as crypto errors.
      derivedKeyRef.current = key
      setCryptoSettings(settings)
      setLockState('unlocked')
      return null
    } catch (err) {
      return (err as Error).message || 'Failed to unlock vault'
    }
  }, [cryptoSettings])

  // ── Lock vault ──────────────────────────────────────────────────────
  const lock = useCallback(() => {
    derivedKeyRef.current = null
    setLockState('locked')
  }, [])

  // ── Encrypt ────────────────────────────────────────────────────────
  const encryptPw = useCallback(async (plain: string): Promise<EncryptResult> => {
    if (!derivedKeyRef.current) throw new Error('Vault is locked')
    return encryptPassword(plain, derivedKeyRef.current)
  }, [])

  // ── Decrypt ────────────────────────────────────────────────────────
  const decryptPw = useCallback(async (encrypted: string, iv: string): Promise<string> => {
    if (!derivedKeyRef.current) throw new Error('Vault is locked')
    return decryptPassword(encrypted, iv, derivedKeyRef.current)
  }, [])

  const bumpVaultVersion = useCallback(() => {
    setVaultVersion((v) => v + 1)
  }, [])

  return (
    <VaultContext.Provider
      value={{
        lockState,
        cryptoSettings,
        setupMasterPassword,
        unlock,
        lock,
        encryptPw,
        decryptPw,
        vaultVersion,
        bumpVaultVersion,
      }}
    >
      {children}
    </VaultContext.Provider>
  )
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used inside <VaultProvider>')
  return ctx
}
