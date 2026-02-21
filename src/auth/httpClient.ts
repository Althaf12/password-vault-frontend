import { API_BASE_URL } from './config'
import { refreshAuth, redirectToLogin } from './authService'

// ─── 401 Refresh Queue ──────────────────────────────────────────────
let isRefreshing = false
type QueueItem = {
  resolve: (value: Response) => void
  reject: (reason: unknown) => void
  input: string
  init: RequestInit
}
let failedQueue: QueueItem[] = []

function processQueue(success: boolean): void {
  const queue = [...failedQueue]
  failedQueue = []

  if (success) {
    // Retry all queued requests
    queue.forEach(({ resolve, reject, input, init }) => {
      fetch(input, init).then(resolve).catch(reject)
    })
  } else {
    queue.forEach(({ reject }) => reject(new Error('Session expired')))
  }
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Authenticated fetch wrapper.
 * - Prepends API_BASE_URL unless the path already starts with "http".
 * - Always sends credentials: 'include'.
 * - Sets Content-Type for JSON bodies.
 * - On 401: refreshes once, retries; otherwise redirects to login.
 * - Returns parsed JSON / text / null.
 */
export async function authFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

  const headers = new Headers(options.headers)

  if (options.body && typeof options.body !== 'string') {
    headers.set('Content-Type', 'application/json')
    options.body = JSON.stringify(options.body)
  } else if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const init: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  }

  let res = await fetch(url, init)

  // ── 401 handling ────────────────────────────────────────────────
  if (res.status === 401) {
    if (isRefreshing) {
      // Park this request until the in-flight refresh completes
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({ resolve, reject, input: url, init })
      }).then(parseResponse<T>)
    }

    isRefreshing = true
    const refreshed = await refreshAuth()
    isRefreshing = false

    processQueue(refreshed)

    if (refreshed) {
      // Retry original request
      res = await fetch(url, init)
    } else {
      redirectToLogin()
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed: ${res.status} ${url} — ${text}`)
  }

  return parseResponse<T>(res)
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return null as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}
