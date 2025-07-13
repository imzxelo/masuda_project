'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import StudentSelect from '@/components/StudentSelect'
import { VideoRecordSelect } from '@/components/VideoRecordSelect'
import { VideoRecordRegister } from '@/components/VideoRecordRegister'
import EvaluationForm from '@/components/EvaluationForm'
import { Student } from '@/types'
import { VideoRecord } from '@/types/video-record'
import { InstructorProfile } from '@/lib/api/instructor-profile'

interface EvaluationWorkflowProps {
  currentInstructor: InstructorProfile | null
  onLogout: () => void
}

type WorkflowStep = 'student' | 'video' | 'evaluation'

export default function EvaluationWorkflow({
  currentInstructor,
  onLogout
}: EvaluationWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('student')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedVideoRecord, setSelectedVideoRecord] = useState<VideoRecord | null>(null)
  const [showVideoRegisterForm, setShowVideoRegisterForm] = useState(false)

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setCurrentStep('video')
  }

  const handleVideoRecordSelect = (videoRecord: VideoRecord) => {
    setSelectedVideoRecord(videoRecord)
    setCurrentStep('evaluation')
  }

  const handleVideoRecordCreate = () => {
    setShowVideoRegisterForm(true)
  }

  const handleVideoRegisterSuccess = () => {
    setShowVideoRegisterForm(false)
    // 動画選択画面に戻る
  }

  const handleVideoRegisterCancel = () => {
    setShowVideoRegisterForm(false)
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'student':
        // 認証済みなので生徒選択がスタート - 戻れない
        return
      case 'video':
        setCurrentStep('student')
        setSelectedStudent(null)
        break
      case 'evaluation':
        setCurrentStep('video')
        setSelectedVideoRecord(null)
        break
    }
  }

  const handleEvaluationComplete = () => {
    // 評価完了後の処理
    setCurrentStep('student')
    setSelectedVideoRecord(null)
  }

  const renderStepIndicator = () => {
    const steps = [
      { key: 'student', label: '生徒選択', completed: selectedStudent !== null },
      { key: 'video', label: '動画選択', completed: selectedVideoRecord !== null },
      { key: 'evaluation', label: '評価入力', completed: false }
    ]

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : step.key === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.completed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'student':
        return (
          <Card className="max-w-4xl mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">評価対象の生徒を選択してください</h2>
                <div className="text-sm text-gray-600">
                  講師: {currentInstructor?.name}
                </div>
              </div>
              <StudentSelect 
                onSelect={handleStudentSelect}
                selectedStudent={selectedStudent}
              />
            </div>
          </Card>
        )

      case 'video':
        return (
          <Card className="max-w-4xl mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">採点対象の動画を選択してください</h2>
                <div className="text-sm text-gray-600">
                  講師: {currentInstructor?.name} | 生徒: {selectedStudent?.name}
                </div>
              </div>
              
              {showVideoRegisterForm ? (
                <VideoRecordRegister
                  studentId={selectedStudent!.id}
                  onSuccess={handleVideoRegisterSuccess}
                  onCancel={handleVideoRegisterCancel}
                />
              ) : (
                <>
                  <VideoRecordSelect
                    studentId={selectedStudent!.id}
                    onVideoRecordSelect={handleVideoRecordSelect}
                    onCreateNew={handleVideoRecordCreate}
                    selectedVideoRecordId={selectedVideoRecord?.id}
                  />
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                    >
                      生徒選択に戻る
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )

      case 'evaluation':
        return (
          <div className="max-w-6xl mx-auto">
            <Card className="mb-6">
              <div className="p-4 bg-blue-50 border-b">
                <h2 className="text-xl font-bold text-blue-900">評価入力</h2>
                <div className="text-sm text-blue-700 mt-1">
                  講師: {currentInstructor?.name} | 生徒: {selectedStudent?.name} | 楽曲: {selectedVideoRecord?.songTitle}
                </div>
              </div>
            </Card>
            
            <EvaluationForm
              studentId={selectedStudent!.id}
              instructorId={currentInstructor!.id}
              videoRecordId={selectedVideoRecord!.id}
              onComplete={handleEvaluationComplete}
              onBack={handleBack}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {renderStepIndicator()}
      {renderCurrentStep()}
    </div>
  )
}