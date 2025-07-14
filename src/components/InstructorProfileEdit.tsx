'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { useSupabaseAuth } from '@/components/SupabaseAuthProvider'
import { updateInstructorProfile } from '@/lib/api/instructor-profile'

interface InstructorProfileEditProps {
  onSave?: () => void
  onCancel?: () => void
  isModal?: boolean
}

export default function InstructorProfileEdit({ 
  onSave, 
  onCancel, 
  isModal = false 
}: InstructorProfileEditProps) {
  const { instructorProfile, user } = useSupabaseAuth()
  const [name, setName] = useState(instructorProfile?.name || '')
  const [email, setEmail] = useState(instructorProfile?.email || user?.email || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await updateInstructorProfile(user.id, {
        name: name.trim(),
        email: email.trim()
      })

      if (result.success) {
        setSuccess('プロファイルを更新しました')
        onSave?.()
        // ページをリロードして最新情報を反映
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setError(result.error || 'プロファイルの更新に失敗しました')
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(instructorProfile?.name || '')
    setEmail(instructorProfile?.email || user?.email || '')
    setError('')
    setSuccess('')
    onCancel?.()
  }

  const content = (
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
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          メールアドレス <span className="text-red-500">*</span>
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
        <p className="text-xs text-gray-500 mt-1">
          ※ メールアドレスを変更した場合、ログインに使用するアドレスも更新されます
        </p>
      </div>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
          {success}
        </div>
      )}
      
      <div className={`flex ${isModal ? 'justify-end' : 'justify-center'} space-x-3`}>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            キャンセル
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !name.trim() || !email.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              更新中...
            </>
          ) : (
            '更新する'
          )}
        </Button>
      </div>
    </form>
  )

  if (isModal) {
    return content
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          講師プロファイル編集
        </h2>
        {content}
      </div>
    </Card>
  )
}