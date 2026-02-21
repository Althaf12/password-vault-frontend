export type SessionData = {
  userId: string
  username?: string
  email?: string
  profileImageUrl?: string
  token?: string // always undefined — kept for compat
  subscription?: {
    plan?: string
    status?: string
    expiresAt?: string
  }
}

export type StatusMessage = {
  type: 'loading' | 'error' | 'success' | 'info'
  message: string
}
