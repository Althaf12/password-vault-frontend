/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_AUTH_BASE_URL: string
  readonly VITE_APP_BASE_URL: string
  readonly VITE_MAIN_SITE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
