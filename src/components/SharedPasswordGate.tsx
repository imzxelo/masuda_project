'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'

interface SharedPasswordGateProps {
  onAuthenticated: () => void
}

export default function SharedPasswordGate({ onAuthenticated }: SharedPasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // パスワードをチェック（ハードコード - 本番環境では別の方法を検討）
    const correctPassword = 'myUU-2025'
    
    if (password === correctPassword) {
      // 認証成功 - sessionStorageに認証状態を保存
      sessionStorage.setItem('shared_password_authenticated', 'true')
      onAuthenticated()
    } else {
      setError('パスワードが正しくありません')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Singer's Challenge
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            システムにアクセスするためのパスワードを入力してください
          </p>
        </div>
        
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                アクセスパスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full"
                required
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  認証中...
                </>
              ) : (
                'アクセス'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>※ 不正アクセスを防ぐため、パスワード認証を行っています</p>
          </div>
        </Card>
      </div>
    </div>
  )
}