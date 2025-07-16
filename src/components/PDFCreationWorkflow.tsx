'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { Student } from '@/types/student'
import { VideoRecord } from '@/types/video-record'
import { searchStudents } from '@/lib/api/students'
import { getVideoRecordsByStudent } from '@/lib/api/video-records'
import { getEvaluationCount } from '@/lib/api/reports'
import { useDebounce } from '@/hooks'
import { supabaseAuth } from '@/lib/supabase/auth-client'

export default function PDFCreationWorkflow() {
  const [step, setStep] = useState<'student' | 'song' | 'generate'>('student')
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [videoRecords, setVideoRecords] = useState<VideoRecord[]>([])
  const [selectedVideoRecord, setSelectedVideoRecord] = useState<VideoRecord | null>(null)
  const [evaluationCount, setEvaluationCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedPDFUrl, setGeneratedPDFUrl] = useState<string | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // 生徒検索
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchStudentsHandler(debouncedSearchQuery)
    } else {
      setStudents([])
    }
  }, [debouncedSearchQuery])

  const searchStudentsHandler = async (query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await searchStudents(query)
      if (result.success) {
        setStudents(result.data)
      } else {
        setError(result.error || '生徒の検索に失敗しました')
      }
    } catch (error) {
      setError('生徒の検索に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 生徒選択
  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student)
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getVideoRecordsByStudent(student.id)
      if (result.success) {
        setVideoRecords(result.data)
        setStep('song')
      } else {
        setError(result.error || '動画レコードの取得に失敗しました')
      }
    } catch (error) {
      setError('動画レコードの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 曲選択
  const handleSongSelect = async (videoRecord: VideoRecord) => {
    console.log('Selected video record:', videoRecord)
    setSelectedVideoRecord(videoRecord)
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Getting evaluation count for video record ID:', videoRecord.id)
      const result = await getEvaluationCount(videoRecord.id)
      console.log('Evaluation count result:', result)
      
      if (result.success) {
        setEvaluationCount(result.data)
        setStep('generate')
      } else {
        setError(result.error || '評価数の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error in handleSongSelect:', error)
      setError('評価数の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // PDF生成
  const handleGeneratePDF = async () => {
    if (!selectedVideoRecord) return
    
    setIsGenerating(true)
    setError(null)
    setGeneratedPDFUrl(null)
    
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoRecordId: selectedVideoRecord.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API Error:', result)
        throw new Error(result.error || 'PDF生成に失敗しました')
      }

      // PDF生成が完了したら、URLを取得
      if (result.reportId) {
        // 生成完了を待機（簡易的なポーリング）
        await waitForPDFGeneration(result.reportId)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'PDF生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  // PDF生成完了を待機（簡易ポーリング）
  const waitForPDFGeneration = async (reportId: string) => {
    const maxAttempts = 30 // 最大30回試行（5分）
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/reports/${reportId}`)
        if (response.ok) {
          const report = await response.json()
          if (report.status === 'completed' && report.pdf_url) {
            setGeneratedPDFUrl(report.pdf_url)
            return
          } else if (report.status === 'failed') {
            throw new Error(report.error_message || 'PDF生成に失敗しました')
          }
        }
      } catch (error) {
        console.error('Status check error:', error)
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, 10000)) // 10秒待機
    }

    throw new Error('PDF生成がタイムアウトしました')
  }

  // リセット
  const handleReset = () => {
    setStep('student')
    setSearchQuery('')
    setStudents([])
    setSelectedStudent(null)
    setVideoRecords([])
    setSelectedVideoRecord(null)
    setEvaluationCount(0)
    setError(null)
    setGeneratedPDFUrl(null)
  }

  // 戻る
  const handleBack = () => {
    if (step === 'song') {
      setStep('student')
      setVideoRecords([])
      setSelectedVideoRecord(null)
    } else if (step === 'generate') {
      setStep('song')
      setSelectedVideoRecord(null)
      setEvaluationCount(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* ステップインジケーター */}
      <Card className="p-4">
        <div className="flex items-center justify-center space-x-8">
          <div className={`flex items-center space-x-2 ${step === 'student' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'student' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              1
            </div>
            <span className="font-medium">生徒選択</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200" />
          <div className={`flex items-center space-x-2 ${step === 'song' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'song' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <span className="font-medium">曲選択</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200" />
          <div className={`flex items-center space-x-2 ${step === 'generate' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'generate' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <span className="font-medium">PDF生成</span>
          </div>
        </div>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-red-800">
            <strong>エラー:</strong> {error}
          </div>
        </Card>
      )}

      {/* Step 1: 生徒選択 */}
      {step === 'student' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">生徒を選択してください</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生徒名を検索
              </label>
              <input
                type="text"
                placeholder="生徒名を入力..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">検索中...</p>
              </div>
            )}

            {students.length > 0 && (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <Card
                    key={student.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleStudentSelect(student)}
                  >
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    {student.email && (
                      <p className="text-sm text-gray-500">{student.email}</p>
                    )}
                    {student.notes && (
                      <p className="text-sm text-gray-600 mt-1">{student.notes}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: 曲選択 */}
      {step === 'song' && selectedStudent && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">曲を選択してください</h2>
            <Button variant="outline" size="sm" onClick={handleBack}>
              戻る
            </Button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>選択中の生徒:</strong> {selectedStudent.name}
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">動画レコードを読み込み中...</p>
            </div>
          )}

          {videoRecords.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videoRecords.map((record) => (
                <Card
                  key={record.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSongSelect(record)}
                >
                  <h3 className="font-medium text-gray-900">{record.songTitle}</h3>
                  <p className="text-sm text-gray-500">楽曲ID: {record.songId}</p>
                  <p className="text-sm text-gray-500">
                    録音日: {new Date(record.recordedAt).toLocaleDateString('ja-JP')}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">この生徒の動画レコードが見つかりません</p>
              </div>
            )
          )}
        </Card>
      )}

      {/* Step 3: PDF生成 */}
      {step === 'generate' && selectedStudent && selectedVideoRecord && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">PDF生成</h2>
            <Button variant="outline" size="sm" onClick={handleBack}>
              戻る
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">選択内容</h3>
              <p className="text-sm text-gray-600">
                <strong>生徒:</strong> {selectedStudent.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>楽曲:</strong> {selectedVideoRecord.songTitle}
              </p>
              <p className="text-sm text-gray-600">
                <strong>録音日:</strong> {new Date(selectedVideoRecord.recordedAt).toLocaleDateString('ja-JP')}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">評価状況</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    評価数: {evaluationCount}/10件
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((evaluationCount / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((evaluationCount / 10) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* PDF生成ボタン */}
            <div className="text-center">
              <Button
                onClick={handleGeneratePDF}
                disabled={evaluationCount < 10 || isGenerating}
                className="px-8 py-3 text-lg"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>PDF生成中...</span>
                  </div>
                ) : evaluationCount >= 10 ? (
                  'PDF生成開始'
                ) : (
                  `PDF生成不可 (${evaluationCount}/10件)`
                )}
              </Button>
            </div>

            {evaluationCount < 10 && (
              <div className="text-center text-sm text-gray-500">
                PDFを生成するには10件の評価が必要です。
                現在{10 - evaluationCount}件不足しています。
              </div>
            )}

            {/* PDF生成完了 */}
            {generatedPDFUrl && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="text-center">
                  <div className="text-green-800 font-medium mb-2">
                    PDF生成が完了しました！
                  </div>
                  <Button
                    onClick={() => window.open(generatedPDFUrl, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    PDFをダウンロード
                  </Button>
                </div>
              </Card>
            )}

            {/* リセットボタン */}
            <div className="text-center">
              <Button variant="outline" onClick={handleReset}>
                最初から始める
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}