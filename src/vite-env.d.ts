/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// บอก TypeScript ว่าในไฟล์ .env มีค่าอะไรบ้าง
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
