/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_SUPABASE_KEY?: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_GOOGLE_API_KEY?: string
    readonly VITE_OPENAI_API_KEY: string
    readonly VITE_OPENAI_KEY?: string
    readonly VITE_API_BASE_URL?: string
    readonly VITE_API_URL?: string
    readonly VITE_BACKEND_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
