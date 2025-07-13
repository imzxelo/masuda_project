'use client'

import { useSharedAuth } from '@/hooks/useSharedAuth'
import SharedPasswordGate from '@/components/SharedPasswordGate'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading, authenticate } = useSharedAuth()

  // 認証状態をチェック中はローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">システムを初期化中...</span>
        </div>
      </div>
    )
  }

  // 共有パスワード認証が済んでいない場合は認証画面を表示
  if (!isAuthenticated) {
    return <SharedPasswordGate onAuthenticated={authenticate} />
  }

  // 認証済みの場合は通常のアプリケーションを表示
  return <>{children}</>
}