'use client'

import { useState } from 'react'
import { useSharedAuth } from '@/hooks/useSharedAuth'
import { useSupabaseAuth, SupabaseAuthProvider } from '@/components/SupabaseAuthProvider'
import SharedPasswordGate from '@/components/SharedPasswordGate'
import InstructorAuth from '@/components/InstructorAuth'
import FirstTimeSetup from '@/components/FirstTimeSetup'

interface AuthWrapperProps {
  children: React.ReactNode
}

function AuthContent({ children }: AuthWrapperProps) {
  const { isAuthenticated: isSharedAuthenticated, isLoading: isSharedLoading, authenticate: authenticateShared } = useSharedAuth()
  const { user, instructorProfile, isLoading: isSupabaseLoading } = useSupabaseAuth()
  const [setupCompleted, setSetupCompleted] = useState(false)

  // 共有パスワード認証をチェック中
  if (isSharedLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">システムを初期化中...</span>
        </div>
      </div>
    )
  }

  // 共有パスワード認証が済んでいない場合
  if (!isSharedAuthenticated) {
    return <SharedPasswordGate onAuthenticated={authenticateShared} />
  }

  // Supabase認証をチェック中
  if (isSupabaseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">ユーザー認証を確認中...</span>
        </div>
      </div>
    )
  }

  // Supabaseユーザー認証が済んでいない場合
  if (!user) {
    return <InstructorAuth onAuthSuccess={() => {}} />
  }

  // 初回セットアップが必要かチェック
  const needsSetup = instructorProfile && (
    !instructorProfile.name || 
    instructorProfile.name === instructorProfile.email ||
    instructorProfile.name.includes('@') ||
    instructorProfile.id === 'temp'
  )

  if (needsSetup && !setupCompleted) {
    return <FirstTimeSetup onComplete={() => setSetupCompleted(true)} />
  }

  // すべて完了している場合は通常のアプリケーションを表示
  return <>{children}</>
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <SupabaseAuthProvider>
      <AuthContent>{children}</AuthContent>
    </SupabaseAuthProvider>
  )
}