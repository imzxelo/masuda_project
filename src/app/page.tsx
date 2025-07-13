'use client'

import { useState } from 'react'
import EvaluationWorkflow from '@/components/EvaluationWorkflow'
import InstructorRegister from '@/components/InstructorRegister'
import { Card, Button, ToastProvider } from '@/components/ui'
import { useInstructor } from '@/hooks'

export default function Home() {
  const { 
    instructors, 
    session, 
    isAuthenticated, 
    isLoading: instructorLoading, 
    authenticate, 
    logout 
  } = useInstructor()
  
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  
  const handleInstructorSelect = (instructor: any) => {
    authenticate(instructor)
  }
  
  const handleRegisterSuccess = async () => {
    setShowRegisterForm(false)
    // 講師リストを再読み込み
    await new Promise(resolve => setTimeout(resolve, 500))
    window.location.reload()
  }
  
  const handleRegisterCancel = () => {
    setShowRegisterForm(false)
  }
  
  const handleLogout = () => {
    logout()
  }
  
  const clearAllData = () => {
    localStorage.clear()
    logout()
    window.location.reload()
  }

  // 講師が認証されていない場合の画面
  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Singer's Challenge 評価システム
                </h1>
                <p className="text-gray-600">
                  講師として認証してシステムをご利用ください
                </p>
              </div>

              {instructorLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">講師情報を読み込み中...</span>
                </div>
              ) : showRegisterForm ? (
                <InstructorRegister 
                  onSuccess={handleRegisterSuccess}
                  onCancel={handleRegisterCancel}
                />
              ) : (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">講師選択</h2>
                    
                    {instructors.length > 0 ? (
                      <div className="space-y-3">
                        {instructors.map((instructor) => (
                          <button
                            key={instructor.id}
                            onClick={() => handleInstructorSelect(instructor)}
                            className="w-full p-4 text-left border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{instructor.name}</div>
                            <div className="text-sm text-gray-500">{instructor.email}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>登録された講師がいません</p>
                      </div>
                    )}
                    
                    <div className="mt-6 text-center space-y-3">
                      <p className="text-sm text-gray-600">
                        講師として登録されていない場合
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowRegisterForm(true)}
                        className="bg-white"
                      >
                        新しい講師を登録
                      </Button>
                      
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">
                          問題が発生した場合
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllData}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          データをクリアして再開
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </ToastProvider>
    )
  }

  // 講師が認証されている場合の評価ワークフロー
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
                <p className="text-sm text-gray-600">講師: {session?.name}</p>
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
              instructors={instructors}
              onInstructorSelect={handleInstructorSelect}
              onLogout={handleLogout}
              session={session}
            />
          </div>
        </div>
      </main>
    </ToastProvider>
  )
}