'use client'

import { useState } from 'react'
import EvaluationWorkflow from '@/components/EvaluationWorkflow'
import InstructorProfileEdit from '@/components/InstructorProfileEdit'
import { Button, ToastProvider } from '@/components/ui'
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider'

export default function Home() {
  const { user, instructorProfile, signOut } = useSupabaseAuth()
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  
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
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProfileEdit(true)}
                  >
                    プロファイル編集
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    ログアウト
                  </Button>
                </div>
              </div>
            </div>

            {showProfileEdit ? (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-bold mb-4">プロファイル編集</h3>
                  <InstructorProfileEdit
                    isModal={true}
                    onSave={() => setShowProfileEdit(false)}
                    onCancel={() => setShowProfileEdit(false)}
                  />
                </div>
              </div>
            ) : null}

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