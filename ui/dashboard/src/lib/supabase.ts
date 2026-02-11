import { createClient } from '@supabase/supabase-js'

const normalize = (value?: string) => (value ?? '').trim()

const supabaseUrl = normalize(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = normalize(
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY
)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase] Missing Vite env config. Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
