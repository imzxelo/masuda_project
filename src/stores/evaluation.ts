import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { EvaluationScore, EvaluationComments, EvaluationFormData } from '@/types/evaluation'

interface EvaluationState {
  scores: EvaluationScore
  comments: EvaluationComments
  studentId: string
  videoRecordId: string
  isSubmitting: boolean
  error: string | null
  
  // Actions
  updateScores: (scores: EvaluationScore) => void
  updateComments: (comments: EvaluationComments) => void
  setStudentId: (studentId: string) => void
  setVideoRecordId: (videoRecordId: string) => void
  setSubmitting: (isSubmitting: boolean) => void
  setError: (error: string | null) => void
  resetEvaluation: () => void
  getFormData: () => EvaluationFormData
}

const initialScores: EvaluationScore = {
  pitch: 0,
  rhythm: 0,
  expression: 0,
  technique: 0,
}

const initialComments: EvaluationComments = {
  pitch: '',
  rhythm: '',
  expression: '',
  technique: '',
}

export const useEvaluationStore = create<EvaluationState>()(
  subscribeWithSelector((set, get) => ({
    scores: initialScores,
    comments: initialComments,
    studentId: '',
    videoRecordId: '',
    isSubmitting: false,
    error: null,

    updateScores: (scores) => set({ scores }),
    
    updateComments: (comments) => set({ comments }),
    
    setStudentId: (studentId) => set({ studentId }),
    
    setVideoRecordId: (videoRecordId) => set({ videoRecordId }),
    
    setSubmitting: (isSubmitting) => set({ isSubmitting }),
    
    setError: (error) => set({ error }),
    
    resetEvaluation: () => set({
      scores: initialScores,
      comments: initialComments,
      studentId: '',
      videoRecordId: '',
      isSubmitting: false,
      error: null,
    }),
    
    getFormData: (): EvaluationFormData => {
      const state = get()
      return {
        studentId: state.studentId,
        videoRecordId: state.videoRecordId,
        scores: state.scores,
        comments: state.comments,
      }
    },
  }))
)