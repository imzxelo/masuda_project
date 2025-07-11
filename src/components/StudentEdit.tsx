'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { updateStudent } from '@/lib/api/students'
import { Student } from '@/types/student'

interface StudentEditProps {
  student: Student
  onSuccess: () => void
  onCancel: () => void
}

export default function StudentEdit({ student, onSuccess, onCancel }: StudentEditProps) {
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email || '',
    grade: student.grade || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showConfirmation, setShowConfirmation] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = '生徒名は必須です'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '生徒名は2文字以上で入力してください'
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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

    // 変更があったかチェック
    const hasChanges = 
      formData.name !== student.name ||
      formData.email !== (student.email || '') ||
      formData.grade !== (student.grade || '')

    if (!hasChanges) {
      setErrors({ general: '変更内容がありません' })
      return
    }

    // 確認画面を表示
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await updateStudent(student.id, {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        grade: formData.grade.trim() || undefined,
        isActive: student.isActive
      })

      if (result.success) {
        onSuccess()
      } else {
        if (result.error?.includes('duplicate') || result.error?.includes('unique')) {
          setErrors({ email: 'このメールアドレスは既に登録されています' })
        } else {
          setErrors({ general: result.error || '更新に失敗しました' })
        }
        setShowConfirmation(false)
      }
    } catch (error) {
      console.error('生徒情報更新エラー:', error)
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">生徒情報更新確認</h2>
            <p className="text-gray-600">以下の内容で更新します</p>
          </div>

          {/* 変更内容の比較 */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">変更内容</h3>
              <div className="space-y-3">
                {/* 生徒名 */}
                <div>
                  <dt className="text-sm font-medium text-gray-700">生徒名</dt>
                  {formData.name !== student.name ? (
                    <div className="flex items-center space-x-2">
                      <dd className="text-sm text-red-600 line-through">{student.name}</dd>
                      <span className="text-sm text-gray-500">→</span>
                      <dd className="text-sm text-green-600 font-medium">{formData.name}</dd>
                    </div>
                  ) : (
                    <dd className="text-base text-gray-900">{formData.name}</dd>
                  )}
                </div>

                {/* メールアドレス */}
                <div>
                  <dt className="text-sm font-medium text-gray-700">メールアドレス</dt>
                  {formData.email !== (student.email || '') ? (
                    <div className="flex items-center space-x-2">
                      <dd className="text-sm text-red-600 line-through">{student.email || '未設定'}</dd>
                      <span className="text-sm text-gray-500">→</span>
                      <dd className="text-sm text-green-600 font-medium">{formData.email || '未設定'}</dd>
                    </div>
                  ) : (
                    <dd className="text-base text-gray-900">{formData.email || '未設定'}</dd>
                  )}
                </div>

                {/* 学年 */}
                <div>
                  <dt className="text-sm font-medium text-gray-700">学年</dt>
                  {formData.grade !== (student.grade || '') ? (
                    <div className="flex items-center space-x-2">
                      <dd className="text-sm text-red-600 line-through">{student.grade || '未設定'}</dd>
                      <span className="text-sm text-gray-500">→</span>
                      <dd className="text-sm text-green-600 font-medium">{formData.grade || '未設定'}</dd>
                    </div>
                  ) : (
                    <dd className="text-base text-gray-900">{formData.grade || '未設定'}</dd>
                  )}
                </div>
              </div>
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
                <li>• 更新後は即座に生徒選択画面に反映されます</li>
                <li>• メールアドレスは任意ですが、入力する場合は重複できません</li>
                <li>• 学年は自由記述で入力できます</li>
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
              {isSubmitting ? '更新中...' : '更新を実行'}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">生徒情報編集</h2>
          <p className="text-gray-600">{student.name}の情報を編集します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 全般エラー */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* 生徒名入力 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              生徒名 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="例: 山田 花音"
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
              メールアドレス <span className="text-gray-400">(任意)</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="例: yamada.kanon@student.com"
              className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* 学年入力 */}
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              学年 <span className="text-gray-400">(任意)</span>
            </label>
            <Input
              id="grade"
              type="text"
              value={formData.grade}
              onChange={handleInputChange('grade')}
              placeholder="例: 高校2年, 中学3年"
              disabled={isSubmitting}
            />
          </div>

          {/* 注意事項 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1">注意事項</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 更新後は即座に生徒選択画面に反映されます</li>
              <li>• メールアドレスは任意ですが、入力する場合は重複できません</li>
              <li>• 学年は自由記述で入力できます</li>
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
              変更内容を確認
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}