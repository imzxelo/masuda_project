'use client'

import { useState } from 'react'
import EvaluationRadarChart from '@/components/RadarChart'
import EvaluationSlider from '@/components/EvaluationSlider'
import InstructorSelect from '@/components/InstructorSelect'
import { Card, Button } from '@/components/ui'
import { EvaluationScore, EvaluationComments, Instructor, InstructorSession } from '@/types'

const mockInstructors: Instructor[] = [
  { id: '1', name: '田中 太郎', email: 'tanaka@example.com', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  { id: '2', name: '佐藤 花子', email: 'sato@example.com', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  { id: '3', name: '鈴木 次郎', email: 'suzuki@example.com', isActive: true, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
]

export default function Home() {
  const [scores, setScores] = useState<EvaluationScore>({
    pitch: 7,
    rhythm: 6,
    expression: 8,
    technique: 6,
  })
  const [comments, setComments] = useState<EvaluationComments>({
    pitch: '',
    rhythm: '',
    expression: '',
    technique: '',
  })
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorSession | null>(null)

  const handleEvaluationChange = (newScores: EvaluationScore, newComments: EvaluationComments) => {
    setScores(newScores)
    setComments(newComments)
  }

  const handleInstructorSelect = (session: InstructorSession) => {
    setSelectedInstructor(session)
  }

  if (!selectedInstructor) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">
              Singer's Challenge
            </h1>
            <p className="text-center text-gray-600 mb-8">
              ボーカルスクール向けの採点・フィードバックシステム
            </p>
            <InstructorSelect 
              instructors={mockInstructors}
              onSelect={handleInstructorSelect}
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">評価システム</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">講師: {selectedInstructor.name}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInstructor(null)}
              >
                講師変更
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-semibold mb-4">評価入力</h2>
              <EvaluationSlider
                initialScores={scores}
                initialComments={comments}
                onChange={handleEvaluationChange}
              />
            </Card>

            <div className="space-y-6">
              <Card>
                <h2 className="text-xl font-semibold mb-4">評価結果</h2>
                <EvaluationRadarChart scores={scores} />
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>音程:</span>
                    <span className="font-semibold">{scores.pitch}点</span>
                  </div>
                  <div className="flex justify-between">
                    <span>リズム:</span>
                    <span className="font-semibold">{scores.rhythm}点</span>
                  </div>
                  <div className="flex justify-between">
                    <span>表現:</span>
                    <span className="font-semibold">{scores.expression}点</span>
                  </div>
                  <div className="flex justify-between">
                    <span>テクニック:</span>
                    <span className="font-semibold">{scores.technique}点</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    合計: {scores.pitch + scores.rhythm + scores.expression + scores.technique}点 / 40点
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4">コメント一覧</h2>
                <div className="space-y-4">
                  {Object.entries(comments).map(([key, comment]) => {
                    const labels = {
                      pitch: '音程',
                      rhythm: 'リズム',
                      expression: '表現',
                      technique: 'テクニック'
                    }
                    const label = labels[key as keyof typeof labels]
                    return (
                      <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
                        <div className="text-sm text-gray-600">
                          {comment || <span className="text-gray-400">未入力</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg">
              評価を送信
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}