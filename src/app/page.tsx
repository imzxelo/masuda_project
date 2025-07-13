'use client'

import EvaluationWorkflow from '@/components/EvaluationWorkflow'
import { Button, ToastProvider } from '@/components/ui'
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider'

export default function Home() {
  const { user, instructorProfile, signOut } = useSupabaseAuth()
  
  const handleLogout = async () => {
    await signOut()
  }

  // 認証済みユーザー向けのメイン画面
  return (
    <ToastProvider>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <h1 className="text-3xl font-bold">評価システム</h1>
                <nav className="flex space-x-4">
                  <a
                    href="/"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    評価入力
                  </a>
                  <a
                    href="/history"
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    評価履歴・統計
                  </a>
                </nav>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  講師: {instructorProfile?.name || user?.email}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  ログアウト
                </Button>
              </div>
            </div>

            <EvaluationWorkflow
              currentInstructor={instructorProfile}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </main>
    </ToastProvider>
  )
}