'use client'

import { useState } from 'react'
import { useVideoRecord } from '@/hooks'
import { VideoRecordInput } from '@/types/video-record'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

interface VideoRecordRegisterProps {
  studentId: string
  onSuccess: () => void
  onCancel: () => void
}

export function VideoRecordRegister({
  studentId,
  onSuccess,
  onCancel
}: VideoRecordRegisterProps) {
  const [formData, setFormData] = useState<Omit<VideoRecordInput, 'studentId'>>({
    songId: '',
    songTitle: '',
    recordedAt: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({})
  const { createVideoRecord, isLoading } = useVideoRecord()

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {}

    // songIdは任意フィールドなので、バリデーションを削除
    
    if (!formData.songTitle.trim()) {
      newErrors.songTitle = '楽曲タイトルを入力してください'
    }

    if (!formData.recordedAt) {
      newErrors.recordedAt = '録音日付を入力してください'
    } else {
      const recordedDate = new Date(formData.recordedAt)
      const today = new Date()
      if (recordedDate > today) {
        newErrors.recordedAt = '録音日付は今日以前の日付を入力してください'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const input: VideoRecordInput = {
      ...formData,
      studentId
    }

    const result = await createVideoRecord(input)
    if (result) {
      onSuccess()
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            動画レコード登録
          </h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              楽曲ID <span className="text-gray-500">(任意)</span>
            </label>
            <Input
              type="text"
              value={formData.songId}
              onChange={(e) => handleInputChange('songId', e.target.value)}
              placeholder="例: SONG_001"
              className={errors.songId ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.songId && (
              <p className="mt-1 text-sm text-red-600">{errors.songId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              楽曲タイトル <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.songTitle}
              onChange={(e) => handleInputChange('songTitle', e.target.value)}
              placeholder="例: 君の名は希望"
              className={errors.songTitle ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.songTitle && (
              <p className="mt-1 text-sm text-red-600">{errors.songTitle}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              録音日付 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.recordedAt}
              onChange={(e) => handleInputChange('recordedAt', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={errors.recordedAt ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.recordedAt && (
              <p className="mt-1 text-sm text-red-600">{errors.recordedAt}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登録中...
                </>
              ) : (
                '登録'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">登録内容</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">楽曲ID:</dt>
              <dd className="font-medium">{formData.songId || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">楽曲タイトル:</dt>
              <dd className="font-medium">{formData.songTitle || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">録音日付:</dt>
              <dd className="font-medium">
                {formData.recordedAt 
                  ? new Date(formData.recordedAt).toLocaleDateString('ja-JP') 
                  : '-'
                }
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  )
}