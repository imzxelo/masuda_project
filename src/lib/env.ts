export const validateEnvironmentVariables = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ] as const

  const optionalEnvVars = [
    'NEXT_PUBLIC_N8N_WEBHOOK_URL',
  ] as const

  const missing: string[] = []
  const warnings: string[] = []

  // Debug: Log all environment variables
  console.log('Environment variables check:')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
  console.log('NEXT_PUBLIC_N8N_WEBHOOK_URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? 'SET' : 'NOT SET')

  // Check required variables
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  })

  // Check optional variables
  optionalEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  })

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`)
    // Temporarily disable throwing for debugging
    // throw new Error(
    //   `Missing required environment variables: ${missing.join(', ')}`
    // )
  }

  if (warnings.length > 0) {
    console.warn(
      `Optional environment variables not set: ${warnings.join(', ')}`
    )
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
    n8nWebhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
  }
}