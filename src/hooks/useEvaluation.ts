import { useState, useCallback } from 'react'
import { useEvaluationStore, useUIStore } from '@/stores'
import { 
  createEvaluation, 
  updateEvaluation, 
  getEvaluations, 
  sendEvaluationToN8n 
} from '@/lib/api'
import { EvaluationInput, Evaluation } from '@/types/evaluation'

export function useEvaluation() {
  const [isLoading, setIsLoading] = useState(false)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  
  const { 
    getFormData, 
    resetEvaluation, 
    setSubmitting, 
    setError: setEvaluationError 
  } = useEvaluationStore()
  
  const { addToast, setError } = useUIStore()

  const submitEvaluation = useCallback(async (instructorId: string): Promise<boolean> => {
    try {
      setSubmitting(true)
      setEvaluationError(null)
      
      const formData = getFormData()
      if (!formData.studentId) {
        throw new Error('生徒が選択されていません')
      }

      const input: EvaluationInput = {
        ...formData,
        instructorId
      }

      const result = await createEvaluation(input)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Send to n8n webhook for report generation
      if (result.data) {
        const webhookResult = await sendEvaluationToN8n(result.data)
        if (webhookResult.success) {
          addToast({
            type: 'success',
            message: '評価を保存し、レポート生成を開始しました'
          })
        } else {
          addToast({
            type: 'warning',
            message: '評価は保存されましたが、レポート生成でエラーが発生しました'
          })
        }
      }

      resetEvaluation()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '評価の送信に失敗しました'
      setEvaluationError(errorMessage)
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
      return false
    } finally {
      setSubmitting(false)
    }
  }, [getFormData, resetEvaluation, setSubmitting, setEvaluationError, addToast, setError])

  const loadEvaluations = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true)
      const result = await getEvaluations(filters)
      
      if (result.success) {
        setEvaluations(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '評価データの取得に失敗しました'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [setError, addToast])

  const updateExistingEvaluation = useCallback(async (
    id: string, 
    updates: Partial<EvaluationInput>
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      const result = await updateEvaluation(id, updates)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      addToast({
        type: 'success',
        message: '評価を更新しました'
      })

      // Reload evaluations to reflect changes
      await loadEvaluations()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '評価の更新に失敗しました'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: errorMessage
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setError, addToast, loadEvaluations])

  return {
    evaluations,
    isLoading,
    submitEvaluation,
    loadEvaluations,
    updateEvaluation: updateExistingEvaluation,
  }
}