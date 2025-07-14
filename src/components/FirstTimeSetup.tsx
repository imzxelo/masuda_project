'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider'
import { updateInstructorProfile } from '@/lib/api/instructor-profile'

interface FirstTimeSetupProps {
  onComplete: () => void
}

export default function FirstTimeSetup({ onComplete }: FirstTimeSetupProps) {
  const { instructorProfile, user } = useSupabaseAuth()
  const [name, setName] = useState(instructorProfile?.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isNameValid = name.trim().length >= 2
  const needsSetup = !instructorProfile?.name || 
                    instructorProfile.name === instructorProfile.email ||
                    instructorProfile.name.includes('@')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !isNameValid) return

    setIsLoading(true)
    setError('')

    try {
      const result = await updateInstructorProfile(user.id, {
        name: name.trim()
      })

      if (result.success) {
        onComplete()
        // ページをリロードして最新情報を反映
        window.location.reload()
      } else {
        setError(result.error || '名前の設定に失敗しました')
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  // セットアップが不要な場合はすぐに完了
  if (!needsSetup) {
    onComplete()
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            初期設定
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            システムを利用するために講師名を設定してください
          </p>
        </div>
        
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                講師名 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
                className="w-full"
                required
                minLength={2}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                ※ この名前はシステム内で表示されます（2文字以上）
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>登録情報:</strong><br />
                    メールアドレス: {user?.email}<br />
                    この設定は後から変更できます
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !isNameValid}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  設定中...
                </>
              ) : (
                'システムを開始する'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}