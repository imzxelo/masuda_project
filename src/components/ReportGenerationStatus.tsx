'use client'

import { useState, useEffect } from 'react'
import { Button, Card } from '@/components/ui'
import { getEvaluationCount, getReportByVideoRecord, ReportGeneration } from '@/lib/api/reports'
import { VideoRecord } from '@/types/video-record'

interface ReportGenerationStatusProps {
  videoRecord: VideoRecord
  onReportGenerated?: (report: ReportGeneration) => void
  className?: string
}

export default function ReportGenerationStatus({ 
  videoRecord, 
  onReportGenerated,
  className = '' 
}: ReportGenerationStatusProps) {
  const [evaluationCount, setEvaluationCount] = useState(0)
  const [report, setReport] = useState<ReportGeneration | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatusData()
  }, [videoRecord.id])

  const loadStatusData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 評価件数を取得
      const countResult = await getEvaluationCount(videoRecord.id)
      if (countResult.success) {
        setEvaluationCount(countResult.data)
      }

      // レポート状況を取得
      const reportResult = await getReportByVideoRecord(videoRecord.id)
      if (reportResult.success) {
        setReport(reportResult.data)
      }
    } catch (error) {
      console.error('Error loading status data:', error)
      setError('状況の読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (evaluationCount < 10) {
      setError('10件の評価が必要です')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoRecordId: videoRecord.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'レポート生成に失敗しました')
      }

      // 成功時はレポート状況を再読み込み
      await loadStatusData()
      
      if (onReportGenerated && report) {
        onReportGenerated(report)
      }

    } catch (error) {
      console.error('Error generating report:', error)
      setError(error instanceof Error ? error.message : 'レポート生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    if (report?.pdf_url) {
      window.open(report.pdf_url, '_blank')
    }
  }

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">状況確認中...</span>
        </div>
      </Card>
    )
  }

  const canGenerate = evaluationCount >= 10 && (!report || report.status === 'failed')
  const isProcessing = report?.status === 'processing'
  const isCompleted = report?.status === 'completed'
  const hasFailed = report?.status === 'failed'

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">レポート生成</h3>
            <p className="text-sm text-gray-600">
              {videoRecord.song_title} - {new Date(videoRecord.recorded_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              評価進捗: {evaluationCount}/10件
            </p>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((evaluationCount / 10) * 100, 100)}%` }}
          />
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* ステータス表示 */}
        {report && (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isCompleted ? 'bg-green-500' : 
              isProcessing ? 'bg-yellow-500' : 
              hasFailed ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-sm text-gray-600">
              {isCompleted ? 'レポート生成完了' : 
               isProcessing ? 'レポート生成中...' : 
               hasFailed ? 'レポート生成失敗' : 'レポート準備中'}
            </span>
            {report.completed_at && (
              <span className="text-xs text-gray-500">
                ({new Date(report.completed_at).toLocaleString('ja-JP')})
              </span>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-2">
          {canGenerate && (
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>生成中...</span>
                </>
              ) : (
                <span>レポート生成</span>
              )}
            </Button>
          )}

          {isCompleted && report?.pdf_url && (
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>PDFダウンロード</span>
            </Button>
          )}

          <Button
            onClick={loadStatusData}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            更新
          </Button>
        </div>

        {/* 失敗時のエラー詳細 */}
        {hasFailed && report?.error_message && (
          <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
            エラー詳細: {report.error_message}
          </div>
        )}
      </div>
    </Card>
  )
}