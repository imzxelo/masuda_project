'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import EvaluationSlider from '@/components/EvaluationSlider'
import EvaluationRadarChart from '@/components/RadarChart'
import { EvaluationScore, EvaluationComments } from '@/types/evaluation'
import { useEvaluation } from '@/hooks'
import { useEvaluationStore } from '@/stores'

interface EvaluationFormProps {
  studentId: string
  instructorId: string
  videoRecordId: string
  onComplete: () => void
  onBack: () => void
}

export default function EvaluationForm({
  studentId,
  instructorId,
  videoRecordId,
  onComplete,
  onBack
}: EvaluationFormProps) {
  const { submitEvaluation } = useEvaluation()
  const { 
    scores, 
    comments, 
    updateScores, 
    updateComments, 
    isSubmitting 
  } = useEvaluationStore()

  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleEvaluationChange = (newScores: EvaluationScore, newComments: EvaluationComments) => {
    updateScores(newScores)
    updateComments(newComments)
  }

  const handleSubmit = () => {
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    try {
      // EvaluationStoreに必要な情報を設定
      const { setStudentId, setVideoRecordId } = useEvaluationStore.getState()
      setStudentId(studentId)
      setVideoRecordId(videoRecordId)
      
      const result = await submitEvaluation(instructorId)

      if (result) {
        // 評価をリセット
        updateScores({ pitch: 0, rhythm: 0, expression: 0, technique: 0 })
        updateComments({ pitch: '', rhythm: '', expression: '', technique: '' })
        onComplete()
      }
    } catch (error) {
      console.error('評価送信エラー:', error)
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
  }

  const getTotalScore = () => {
    return scores.pitch + scores.rhythm + scores.expression + scores.technique
  }

  const isFormValid = () => {
    return getTotalScore() > 0
  }

  if (showConfirmation) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">評価内容確認</h3>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{scores.pitch}</div>
                <div className="text-sm text-gray-800">音程</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{scores.rhythm}</div>
                <div className="text-sm text-gray-800">リズム</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{scores.expression}</div>
                <div className="text-sm text-gray-800">表現</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{scores.technique}</div>
                <div className="text-sm text-gray-800">テクニック</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{getTotalScore()}/40</div>
              <div className="text-sm text-gray-800">総合スコア</div>
            </div>
          </div>

          {/* コメント表示 */}
          {(comments.pitch || comments.rhythm || comments.expression || comments.technique) && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">コメント</h4>
              <div className="space-y-2 text-sm">
                {comments.pitch && (
                  <div>
                    <span className="font-medium text-gray-700">音程:</span> {comments.pitch}
                  </div>
                )}
                {comments.rhythm && (
                  <div>
                    <span className="font-medium text-gray-700">リズム:</span> {comments.rhythm}
                  </div>
                )}
                {comments.expression && (
                  <div>
                    <span className="font-medium text-gray-700">表現:</span> {comments.expression}
                  </div>
                )}
                {comments.technique && (
                  <div>
                    <span className="font-medium text-gray-700">テクニック:</span> {comments.technique}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">注意</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 送信後は評価内容の変更はできません</li>
              <li>• 評価データは自動的にレポート生成システムに送信されます</li>
              <li>• 評価履歴から過去の評価を確認できます</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={isSubmitting}
              className="flex-1"
            >
              内容を修正
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  送信中...
                </>
              ) : (
                '評価を送信'
              )}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左側: 評価入力 */}
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">評価入力</h3>
            <EvaluationSlider
              initialScores={scores}
              initialComments={comments}
              onChange={handleEvaluationChange}
            />
          </div>
        </Card>
      </div>

      {/* 右側: リアルタイム可視化 */}
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">評価結果</h3>
            <div className="mb-4">
              <EvaluationRadarChart 
                scores={scores}
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{getTotalScore()}/40</div>
              <div className="text-sm text-gray-800">総合スコア</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">評価基準</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">音程</div>
                  <div className="text-gray-800">ピッチの正確性、音程の安定性</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">リズム</div>
                  <div className="text-gray-800">テンポの正確性、ビート感</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">表現</div>
                  <div className="text-gray-800">感情表現、ダイナミクス</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900">テクニック</div>
                  <div className="text-gray-800">発声技術、歌唱技巧</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 下部: アクションボタン */}
      <div className="lg:col-span-2">
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
              >
                動画選択に戻る
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                評価内容を確認
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}