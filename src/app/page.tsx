'use client'

import { useState, useEffect } from 'react'
import EvaluationRadarChart from '@/components/RadarChart'
import EvaluationSlider from '@/components/EvaluationSlider'
import InstructorSelect from '@/components/InstructorSelect'
import StudentSelect from '@/components/StudentSelect'
import InstructorRegister from '@/components/InstructorRegister'
import { Card, Button, LoadingSpinner, ToastProvider } from '@/components/ui'
import { EvaluationScore, EvaluationComments, InstructorSession } from '@/types'
import { useInstructor, useEvaluation } from '@/hooks'
import { useEvaluationStore, useStudentStore } from '@/stores'

export default function Home() {
  // Hooks
  const { 
    instructors, 
    session, 
    isAuthenticated, 
    isLoading: instructorLoading, 
    authenticate, 
    logout 
  } = useInstructor()
  
  const { submitEvaluation } = useEvaluation()
  
  const { 
    scores, 
    comments, 
    updateScores, 
    updateComments, 
    setStudentId,
    isSubmitting 
  } = useEvaluationStore()
  
  const { 
    selectedStudent, 
    setSelectedStudent, 
    clearSelectedStudent 
  } = useStudentStore()
  
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  

  useEffect(() => {
    updateScores({ pitch: 7, rhythm: 6, expression: 8, technique: 6 })
    if (selectedStudent) {
      setStudentId(selectedStudent.id)
    }
  }, [updateScores, setStudentId, selectedStudent])

  const handleEvaluationChange = (newScores: EvaluationScore, newComments: EvaluationComments) => {
    updateScores(newScores)
    updateComments(newComments)
  }

  const handleInstructorSelect = async (instructor: any) => {
    await authenticate(instructor)
  }

  const handleLogout = () => {
    logout()
    clearSelectedStudent()
  }

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student)
  }
  
  const handleRegisterSuccess = async () => {
    setShowRegisterForm(false)
    // 講師リストを再読み込み
    await new Promise(resolve => setTimeout(resolve, 500)) // 少し待ってからリロード
    window.location.reload()
  }
  
  const clearAllData = () => {
    // ローカルストレージをクリア
    localStorage.clear()
    // セッションもクリア
    logout()
    // ページをリロード
    window.location.reload()
  }
  
  const handleRegisterCancel = () => {
    setShowRegisterForm(false)
  }

  const handleSubmitEvaluation = async () => {
    if (!session) {
      console.error('No session found')
      return
    }
    
    if (!session.instructorId) {
      console.error('No instructor ID in session:', session)
      return
    }
    
    if (!selectedStudent) {
      console.error('No student selected')
      return
    }
    
    console.log('Submitting evaluation:', {
      instructorId: session.instructorId,
      studentId: selectedStudent.id,
      session,
      selectedStudent
    })
    
    const success = await submitEvaluation(session.instructorId)
    if (success) {
      // 評価がリセットされ、成功メッセージが表示される
    }
  }

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-center mb-8">
                Singer's Challenge
              </h1>
              <p className="text-center text-gray-600 mb-8">
                ボーカルスクール向けの採点・フィードバックシステム
              </p>
              
{instructorLoading ? (
                <div className="flex justify-center">
                  <LoadingSpinner size="lg" />
                  <span className="ml-2">講師情報を読み込み中...</span>
                </div>
              ) : showRegisterForm ? (
                <InstructorRegister 
                  onSuccess={handleRegisterSuccess}
                  onCancel={handleRegisterCancel}
                />
              ) : (
                <>
                  <InstructorSelect 
                    instructors={instructors}
                    onSelect={handleInstructorSelect}
                  />
                  
                  {/* 講師登録ボタン */}
                  <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      講師として登録されていない場合
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowRegisterForm(true)}
                      className="bg-white"
                    >
                      新しい講師を登録
                    </Button>
                    
                    {/* デバッグ用ボタン */}
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-2">
                        問題が発生した場合
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllData}
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      >
                        データをクリアして再開
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">評価システム</h1>
              <div className="text-right">
                <p className="text-sm text-gray-600">講師: {session?.name}</p>
                {selectedStudent && (
                  <p className="text-sm text-gray-600">対象生徒: {selectedStudent.name}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  ログアウト
                </Button>
              </div>
            </div>

            {!selectedStudent && (
              <div className="mb-8">
                <StudentSelect 
                  onSelect={handleStudentSelect}
                  selectedStudent={selectedStudent}
                />
              </div>
            )}

            {selectedStudent && (
              <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">評価対象生徒</h3>
                  <p className="text-blue-700">{selectedStudent.name}</p>
                  {selectedStudent.email && (
                    <p className="text-sm text-blue-600">{selectedStudent.email}</p>
                  )}
                  {selectedStudent.grade && (
                    <p className="text-sm text-blue-600">学年: {selectedStudent.grade}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  生徒を変更
                </Button>
              </div>
            )}

            {selectedStudent && (
              <>
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
                  <Button 
                    size="lg"
                    onClick={handleSubmitEvaluation}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '送信中...' : '評価を送信'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </ToastProvider>
  )
}