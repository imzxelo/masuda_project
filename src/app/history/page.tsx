'use client'

import { useState } from 'react'
import EvaluationHistory from '@/components/EvaluationHistory'
import EvaluationStats from '@/components/EvaluationStats'
import { Button } from '@/components/ui'
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider'

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'stats'>('history')
  const { user, instructorProfile, signOut } = useSupabaseAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <h1 className="text-3xl font-bold">評価システム</h1>
              <nav className="flex space-x-4">
                <a
                  href="/"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  評価入力
                </a>
                <a
                  href="/history"
                  className="text-blue-600 hover:text-blue-800 font-medium"
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
        </div>

        {/* タブナビゲーション */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              評価履歴
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              統計・分析
            </button>
          </nav>
        </div>

        {/* コンテンツ */}
        {activeTab === 'history' ? (
          <EvaluationHistory currentInstructor={instructorProfile} />
        ) : (
          <EvaluationStats currentInstructor={instructorProfile} />
        )}
      </div>
    </div>
  )
}