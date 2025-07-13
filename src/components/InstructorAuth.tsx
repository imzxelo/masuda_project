'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider'
import { createInstructorProfile } from '@/lib/api/instructor-profile'

interface InstructorAuthProps {
  onAuthSuccess: () => void
}

type AuthMode = 'signin' | 'signup'

export default function InstructorAuth({ onAuthSuccess }: InstructorAuthProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useSupabaseAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onAuthSuccess()
        }
      } else {
        // サインアップ
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          // サインアップ成功の場合、確認メールの案内を表示
          setError('')
          alert('確認メールを送信しました。メールを確認してアカウントを有効化してください。')
          
          // Note: 講師プロファイルの作成は、メール確認後にSupabaseAuthProviderで自動処理
          // この時点ではまだuser.idが確定していないため
        }
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
    }

    setIsLoading(false)
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError('')
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {mode === 'signin' ? '講師ログイン' : '講師アカウント作成'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin' 
              ? 'アカウントでログインしてください' 
              : '新しい講師アカウントを作成してください'
            }
          </p>
        </div>
        
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  講師名
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田太郎"
                  className="w-full"
                  required
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="instructor@example.com"
                className="w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上のパスワード"
                className="w-full"
                required
                minLength={8}
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || (mode === 'signup' && !name.trim())}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'signin' ? 'ログイン中...' : 'アカウント作成中...'}
                </>
              ) : (
                mode === 'signin' ? 'ログイン' : 'アカウント作成'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {mode === 'signin' 
                ? 'アカウントをお持ちでない場合はこちら' 
                : '既にアカウントをお持ちの場合はこちら'
              }
            </button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>※ 講師として認証されたユーザーのみシステムにアクセスできます</p>
          </div>
        </Card>
      </div>
    </div>
  )
}