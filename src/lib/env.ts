export const validateEnvironmentVariables = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ] as const

  const optionalEnvVars = [
    'N8N_WEBHOOK_URL',
  ] as const

  const missing: string[] = []
  const warnings: string[] = []

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
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  if (warnings.length > 0) {
    console.warn(
      `Optional environment variables not set: ${warnings.join(', ')}`
    )
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL,
  }
}