import { createClient } from '@supabase/supabase-js'
import { validateEnvironmentVariables } from '../env'

const env = validateEnvironmentVariables()
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)

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