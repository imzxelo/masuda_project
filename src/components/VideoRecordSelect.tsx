'use client'

import { useState, useEffect } from 'react'
import { useVideoRecord } from '@/hooks'
import { VideoRecord } from '@/types/video-record'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useDebounce } from '@/hooks'
import { VideoRecordEdit } from '@/components/VideoRecordEdit'

interface VideoRecordSelectProps {
  studentId: string
  onVideoRecordSelect: (videoRecord: VideoRecord) => void
  onCreateNew: () => void
  selectedVideoRecordId?: string
}

export function VideoRecordSelect({
  studentId,
  onVideoRecordSelect,
  onCreateNew,
  selectedVideoRecordId
}: VideoRecordSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingVideoRecord, setEditingVideoRecord] = useState<VideoRecord | null>(null)
  
  const { 
    videoRecords, 
    isLoading, 
    loadVideoRecordsByStudent, 
    searchVideoRecords, 
    selectVideoRecord 
  } = useVideoRecord()

  useEffect(() => {
    if (studentId) {
      console.log('VideoRecordSelect: Loading video records for student:', studentId)
      loadVideoRecordsByStudent(studentId)
    }
  }, [studentId, loadVideoRecordsByStudent])

  useEffect(() => {
    if (debouncedSearchQuery && studentId) {
      console.log('VideoRecordSelect: Searching video records:', debouncedSearchQuery, studentId)
      searchVideoRecords(debouncedSearchQuery, studentId)
    } else if (studentId) {
      console.log('VideoRecordSelect: Loading video records for student (no search):', studentId)
      loadVideoRecordsByStudent(studentId)
    }
  }, [debouncedSearchQuery, studentId, searchVideoRecords, loadVideoRecordsByStudent])

  const handleVideoRecordSelect = (videoRecord: VideoRecord) => {
    selectVideoRecord(videoRecord)
    onVideoRecordSelect(videoRecord)
  }

  const handleEditVideoRecord = (videoRecord: VideoRecord) => {
    setEditingVideoRecord(videoRecord)
    setShowEditForm(true)
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    setEditingVideoRecord(null)
    // 動画レコードリストを再読み込み
    if (studentId) {
      loadVideoRecordsByStudent(studentId)
    }
  }

  const handleEditCancel = () => {
    setShowEditForm(false)
    setEditingVideoRecord(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (showEditForm && editingVideoRecord) {
    return (
      <VideoRecordEdit
        videoRecord={editingVideoRecord}
        onSuccess={handleEditSuccess}
        onCancel={handleEditCancel}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">動画レコードを読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          採点対象動画を選択
        </h3>
        <Button
          onClick={onCreateNew}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          新しい動画レコードを登録
        </Button>
      </div>

      {/* 検索フィールド */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="楽曲名やIDで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* 動画レコード一覧 */}
      {videoRecords.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">動画レコードがありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              最初の動画レコードを登録して評価を開始しましょう
            </p>
            <div className="mt-4">
              <Button
                onClick={onCreateNew}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                動画レコードを登録
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videoRecords.map((videoRecord) => (
            <Card
              key={videoRecord.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedVideoRecordId === videoRecord.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleVideoRecordSelect(videoRecord)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0" onClick={() => handleVideoRecordSelect(videoRecord)}>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {videoRecord.songTitle}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {videoRecord.songId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditVideoRecord(videoRecord)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="動画レコードを編集"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {selectedVideoRecordId === videoRecord.id && (
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>録音日: {formatDate(videoRecord.recordedAt)}</span>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs">評価待ち</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 選択された動画レコード情報 */}
      {selectedVideoRecordId && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-medium text-blue-900">
                  選択された動画レコード
                </h4>
              </div>
              <button
                onClick={() => {
                  const selected = videoRecords.find(v => v.id === selectedVideoRecordId)
                  if (selected) {
                    handleEditVideoRecord(selected)
                  }
                }}
                className="p-1 text-blue-600 hover:text-blue-800 rounded"
                title="動画レコードを編集"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-sm text-blue-800">
              {(() => {
                const selected = videoRecords.find(v => v.id === selectedVideoRecordId)
                return selected ? `${selected.songTitle} (${formatDate(selected.recordedAt)})` : ''
              })()}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}