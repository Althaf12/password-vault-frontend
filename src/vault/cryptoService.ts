import { argon2id } from 'hash-wasm'

const ALGO = 'AES-GCM'
const KEY_LENGTH = 256

// ── Base64 helpers ────────────────────────────────────────────────────

export function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

/** Returns Uint8Array<ArrayBuffer> — compatible with Web Crypto API */
export function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const src = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return new Uint8Array(src.buffer.slice(0, src.byteLength)) as Uint8Array<ArrayBuffer>
}

/** Ensures the Uint8Array has a plain ArrayBuffer (not SharedArrayBuffer) */
function toArrayBuffer(u8: Uint8Array): Uint8Array<ArrayBuffer> {
  if (u8.buffer instanceof ArrayBuffer) return u8 as Uint8Array<ArrayBuffer>
  const copy = new ArrayBuffer(u8.byteLength)
  new Uint8Array(copy).set(u8)
  return new Uint8Array(copy) as Uint8Array<ArrayBuffer>
}

// ── Random bytes ──────────────────────────────────────────────────────

export function generateSalt(bytes = 32): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes))
  return toBase64(buf.buffer as ArrayBuffer)
}

export function generateIV(): string {
  const buf = crypto.getRandomValues(new Uint8Array(12)) // 96-bit IV for AES-GCM
  return toBase64(buf.buffer as ArrayBuffer)
}

// ── Argon2id KDF ─────────────────────────────────────────────────────

export interface KdfParams {
  kdfSalt: string      // base64
  kdfIterations: number
  kdfMemoryKb: number
  kdfParallelism: number
}

/**
 * Derive a 256-bit AES-GCM key from a master password using Argon2id.
 * Returns a CryptoKey that can be used for AES-256-GCM encrypt/decrypt.
 */
export async function deriveKey(masterPassword: string, params: KdfParams): Promise<CryptoKey> {
  const saltBytes = fromBase64(params.kdfSalt)

  const keyMaterial = await argon2id({
    password: masterPassword,
    salt: saltBytes,
    iterations: params.kdfIterations,
    memorySize: params.kdfMemoryKb,
    parallelism: params.kdfParallelism,
    hashLength: 32, // 256 bits
    outputType: 'binary',
  })

  const keyBytes = toArrayBuffer(keyMaterial)

  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: ALGO, length: KEY_LENGTH },
    false, // not extractable
    ['encrypt', 'decrypt'],
  )
}

// ── AES-256-GCM Encrypt ──────────────────────────────────────────────

export interface EncryptResult {
  passwordEncrypted: string // base64
  encryptionIv: string      // base64
  encryptionAlgo: string
}

export async function encryptPassword(plaintext: string, key: CryptoKey): Promise<EncryptResult> {
  const ivRaw = crypto.getRandomValues(new Uint8Array(12))
  const ivBytes = toArrayBuffer(ivRaw)
  const encoded = new TextEncoder().encode(plaintext)

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGO, iv: ivBytes },
    key,
    encoded,
  )

  return {
    passwordEncrypted: toBase64(cipherBuffer),
    encryptionIv: toBase64(ivBytes.buffer),
    encryptionAlgo: 'AES-256-GCM',
  }
}

// ── AES-256-GCM Decrypt ──────────────────────────────────────────────

export async function decryptPassword(
  passwordEncrypted: string,
  encryptionIv: string,
  key: CryptoKey,
): Promise<string> {
  const ivBytes = fromBase64(encryptionIv)
  const cipherBytes = fromBase64(passwordEncrypted)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: ALGO, iv: ivBytes },
    key,
    cipherBytes,
  )

  return new TextDecoder().decode(plainBuffer)
}

// ── Notes encryption (optional) ──────────────────────────────────────

export async function encryptNotes(
  notes: string,
  key: CryptoKey,
): Promise<{ notesEncrypted: string; notesIv: string }> {
  const ivRaw = crypto.getRandomValues(new Uint8Array(12))
  const ivBytes = toArrayBuffer(ivRaw)
  const encoded = new TextEncoder().encode(notes)

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGO, iv: ivBytes },
    key,
    encoded,
  )

  return {
    notesEncrypted: toBase64(cipherBuffer),
    notesIv: toBase64(ivBytes.buffer),
  }
}

export async function decryptNotes(
  notesEncrypted: string,
  notesIv: string,
  key: CryptoKey,
): Promise<string> {
  const ivBytes = fromBase64(notesIv)
  const cipherBytes = fromBase64(notesEncrypted)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: ALGO, iv: ivBytes },
    key,
    cipherBytes,
  )

  return new TextDecoder().decode(plainBuffer)
}
