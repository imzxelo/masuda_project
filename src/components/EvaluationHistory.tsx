'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import StudentSelect from '@/components/StudentSelect'
import { getEvaluationHistory } from '@/lib/api/evaluations'
import { EvaluationHistory as EvaluationHistoryType, EvaluationFilters } from '@/types/evaluation'
import { Student } from '@/types/student'
import { formatDate } from '@/lib/utils'
import { ApiResponse } from '@/types/api'

interface EvaluationHistoryProps {
  className?: string
}

export default function EvaluationHistory({ className = '' }: EvaluationHistoryProps) {
  const [evaluations, setEvaluations] = useState<EvaluationHistoryType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<EvaluationFilters>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    if (selectedStudent) {
      loadEvaluationHistory()
    }
  }, [filters, selectedStudent])

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setFilters(prev => ({ ...prev, studentId: student.id }))
  }

  const handleStudentChange = () => {
    setSelectedStudent(null)
    setFilters(prev => ({ ...prev, studentId: undefined }))
    setEvaluations([])
  }

  const loadEvaluationHistory = async () => {
    if (!selectedStudent) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const studentFilters = { ...filters, studentId: selectedStudent.id }
      const result = await getEvaluationHistory(studentFilters)
      
      if (result.success) {
        setEvaluations(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error loading evaluation history:', error)
      setError(error instanceof Error ? error.message : '評価履歴の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (field: keyof EvaluationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 生徒が選択されていない場合
  if (!selectedStudent) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">評価履歴</h2>
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">生徒を選択してください</h3>
          <p className="text-gray-600 mb-6">
            評価履歴を表示する生徒を選択してください。選択した生徒の評価履歴のみが表示されます。
          </p>
          <StudentSelect
            onSelect={handleStudentSelect}
            selectedStudent={selectedStudent}
          />
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">評価履歴を読み込み中...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">評価履歴</h2>
          <p className="text-sm text-gray-600 mt-1">
            対象生徒: {selectedStudent.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleStudentChange}
            variant="outline"
            size="sm"
          >
            生徒を変更
          </Button>
          <Button
            onClick={loadEvaluationHistory}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            更新
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">フィルター</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="w-full"
            >
              クリア
            </Button>
          </div>
        </div>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-red-800 text-sm">
            <strong>エラー:</strong> {error}
          </div>
        </Card>
      )}

      {/* 評価履歴一覧 */}
      {evaluations.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">評価履歴がありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              評価データが見つかりませんでした
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {evaluation.songTitle}
                      </h4>
                      <p className="text-sm text-gray-500">
                        生徒: {evaluation.studentName} | 講師: {evaluation.instructorName}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBackground(evaluation.totalScore)} ${getScoreColor(evaluation.totalScore)}`}>
                      {evaluation.totalScore}/40点
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDateTime(evaluation.evaluatedAt)}
                    </span>
                    <Button
                      onClick={() => setExpandedId(
                        expandedId === evaluation.id ? null : evaluation.id
                      )}
                      variant="outline"
                      size="sm"
                    >
                      {expandedId === evaluation.id ? '詳細を隠す' : '詳細を表示'}
                    </Button>
                  </div>
                </div>

                {/* スコア表示 */}
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {evaluation.scores.pitch}
                    </div>
                    <div className="text-sm text-gray-500">音程</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {evaluation.scores.rhythm}
                    </div>
                    <div className="text-sm text-gray-500">リズム</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {evaluation.scores.expression}
                    </div>
                    <div className="text-sm text-gray-500">表現</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {evaluation.scores.technique}
                    </div>
                    <div className="text-sm text-gray-500">テクニック</div>
                  </div>
                </div>

                {/* 詳細情報 */}
                {expandedId === evaluation.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">コメント</h5>
                        <div className="space-y-2">
                          {evaluation.comments.pitch && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">音程:</span>
                              <p className="text-sm text-gray-600">{evaluation.comments.pitch}</p>
                            </div>
                          )}
                          {evaluation.comments.rhythm && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">リズム:</span>
                              <p className="text-sm text-gray-600">{evaluation.comments.rhythm}</p>
                            </div>
                          )}
                          {evaluation.comments.expression && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">表現:</span>
                              <p className="text-sm text-gray-600">{evaluation.comments.expression}</p>
                            </div>
                          )}
                          {evaluation.comments.technique && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">テクニック:</span>
                              <p className="text-sm text-gray-600">{evaluation.comments.technique}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">詳細情報</h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">録音日:</span>
                            <span className="ml-2 text-gray-600">
                              {formatDate(evaluation.recordedAt)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">評価日:</span>
                            <span className="ml-2 text-gray-600">
                              {formatDateTime(evaluation.evaluatedAt)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">評価ID:</span>
                            <span className="ml-2 text-gray-600 font-mono text-xs">
                              {evaluation.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}