'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import StudentSelect from '@/components/StudentSelect'
import { getEvaluationStats } from '@/lib/api/evaluations'
import { EvaluationStats as EvaluationStatsType, EvaluationFilters } from '@/types/evaluation'
import { Student } from '@/types/student'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface EvaluationStatsProps {
  className?: string
}

export default function EvaluationStats({ className = '' }: EvaluationStatsProps) {
  const [stats, setStats] = useState<EvaluationStatsType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<EvaluationFilters>({})
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    if (selectedStudent) {
      loadEvaluationStats()
    }
  }, [filters, selectedStudent])

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setFilters(prev => ({ ...prev, studentId: student.id }))
  }

  const handleStudentChange = () => {
    setSelectedStudent(null)
    setFilters(prev => ({ ...prev, studentId: undefined }))
    setStats(null)
  }

  const loadEvaluationStats = async () => {
    if (!selectedStudent) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const studentFilters = { ...filters, studentId: selectedStudent.id }
      const result = await getEvaluationStats(studentFilters)
      
      if (result.success) {
        setStats(result.data || null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error loading evaluation stats:', error)
      setError(error instanceof Error ? error.message : '評価統計の取得に失敗しました')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  // 生徒が選択されていない場合
  if (!selectedStudent) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">評価統計</h2>
        </div>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">生徒を選択してください</h3>
          <p className="text-gray-600 mb-6">
            評価統計を表示する生徒を選択してください。選択した生徒の統計データのみが表示されます。
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
        <span className="ml-2 text-gray-600">評価統計を読み込み中...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="text-gray-500">
          <h3 className="text-sm font-medium text-gray-900">データがありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            評価統計データが見つかりませんでした
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">評価統計</h2>
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
            onClick={loadEvaluationStats}
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

      {/* 基本統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">総評価数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEvaluations}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">平均スコア</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageScore.toFixed(1)}/40</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">最高パフォーマンス楽曲</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.topPerformingSongs[0]?.songTitle || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {stats.topPerformingSongs[0]?.averageScore.toFixed(1)}/40 平均
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* カテゴリ別平均スコア */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">カテゴリ別平均スコア</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {stats.averageScoresByCategory.pitch.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">音程</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(stats.averageScoresByCategory.pitch / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.averageScoresByCategory.rhythm.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">リズム</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(stats.averageScoresByCategory.rhythm / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.averageScoresByCategory.expression.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">表現</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${(stats.averageScoresByCategory.expression / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {stats.averageScoresByCategory.technique.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">テクニック</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${(stats.averageScoresByCategory.technique / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* 日別評価数推移 */}
      {stats.evaluationsByDate.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">日別評価数推移</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.evaluationsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `日付: ${formatDate(label)}`}
                  formatter={(value, name) => [
                    name === 'count' ? `${value}件` : `${Number(value).toFixed(1)}点`,
                    name === 'count' ? '評価数' : '平均スコア'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="評価数"
                />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                  name="平均スコア"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 楽曲別パフォーマンス */}
      {stats.topPerformingSongs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">楽曲別パフォーマンス (Top 5)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topPerformingSongs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="songTitle" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? `${value}件` : `${Number(value).toFixed(1)}点`,
                    name === 'count' ? '評価数' : '平均スコア'
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="averageScore" 
                  fill="#3b82f6"
                  name="平均スコア"
                />
                <Bar 
                  dataKey="count" 
                  fill="#10b981"
                  name="評価数"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}