import { createClient } from '@supabase/supabase-js'
import { validateEnvironmentVariables } from '../env'

const env = validateEnvironmentVariables()

// 認証対応のSupabaseクライアント
export const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

export default supabaseAuth