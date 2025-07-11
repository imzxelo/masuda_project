import { createClient } from '@supabase/supabase-js'
import { validateEnvironmentVariables } from '../env'

const env = validateEnvironmentVariables()

// 通常のクライアント（匿名ユーザー向け）
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// 管理者クライアント（Service Role）
export const supabaseAdmin = env.supabaseServiceRoleKey 
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null

export const testSupabaseConnection = async (): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('id')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        message: `Supabase connection failed: ${error.message}`
      }
    }
    
    return {
      success: true,
      message: 'Supabase connection successful'
    }
  } catch (error) {
    return {
      success: false,
      message: `Supabase connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export const getSupabaseStatus = async () => {
  const connectionTest = await testSupabaseConnection()
  
  return {
    url: env.supabaseUrl,
    connected: connectionTest.success,
    message: connectionTest.message,
    timestamp: new Date().toISOString()
  }
}