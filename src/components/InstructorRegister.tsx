'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { createInstructor } from '@/lib/api/instructors'

interface InstructorRegisterProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function InstructorRegister({ onSuccess, onCancel }: InstructorRegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showConfirmation, setShowConfirmation] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = '講師名は必須です'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '講師名は2文字以上で入力してください'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // 確認画面を表示
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await createInstructor({
        name: formData.name.trim(),
        email: formData.email.trim(),
        isActive: true
      })

      if (result.success) {
        setFormData({ name: '', email: '' })
        onSuccess()
      } else {
        if (result.error?.includes('duplicate') || result.error?.includes('unique')) {
          setErrors({ email: 'このメールアドレスは既に登録されています' })
        } else {
          setErrors({ general: result.error || '登録に失敗しました' })
        }
        setShowConfirmation(false)
      }
    } catch (error) {
      console.error('講師登録エラー:', error)
      setErrors({ general: '予期しないエラーが発生しました' })
      setShowConfirmation(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToEdit = () => {
    setShowConfirmation(false)
  }

  // 確認画面を表示
  if (showConfirmation) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">講師登録確認</h2>
            <p className="text-gray-600">以下の内容で登録します</p>
          </div>

          {/* 確認内容 */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">登録内容</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-700">講師名</dt>
                  <dd className="text-base text-gray-900">{formData.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">メールアドレス</dt>
                  <dd className="text-base text-gray-900">{formData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">ステータス</dt>
                  <dd className="text-base text-green-600 font-medium">アクティブ</dd>
                </div>
              </dl>
            </div>

            {/* 全般エラー */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* 注意事項 */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">注意</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 登録後は即座に講師選択画面に表示されます</li>
                <li>• メールアドレスは重複できません</li>
                <li>• 登録後の情報変更はデータベースから直接行ってください</li>
              </ul>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToEdit}
              disabled={isSubmitting}
              className="flex-1"
            >
              内容を修正
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? '登録中...' : '登録を実行'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">講師登録</h2>
          <p className="text-gray-600">新しい講師を登録します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 全般エラー */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* 講師名入力 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              講師名 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="例: 田中 太郎"
              className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* メールアドレス入力 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="例: tanaka@vocal-school.com"
              className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* 注意事項 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1">注意事項</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 登録後は即座に講師選択画面に表示されます</li>
              <li>• メールアドレスは重複できません</li>
              <li>• 登録後の情報変更はデータベースから直接行ってください</li>
            </ul>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              内容を確認
            </Button>
          </div>
        </form>

        {/* 成功メッセージ用のスペース */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            入力内容を確認後、登録を実行します
          </p>
        </div>
      </div>
    </Card>
  )
}