import { supabase } from '@/lib/supabase/client'
import { 
  Evaluation, 
  EvaluationInput, 
  EvaluationFilters, 
  EvaluationSummary,
  EvaluationScore,
  EvaluationComments
} from '@/types/evaluation'
import { ApiResponse } from '@/types/api'

export async function getEvaluations(filters?: EvaluationFilters): Promise<ApiResponse<Evaluation[]>> {
  try {
    let query = supabase
      .from('evaluations')
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    if (filters?.instructorId) {
      query = query.eq('instructor_id', filters.instructorId)
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data || [],
      message: '評価データを取得しました'
    }
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価データの取得に失敗しました'
    }
  }
}

export async function getEvaluationById(id: string): Promise<ApiResponse<Evaluation | null>> {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '評価データを取得しました'
    }
  } catch (error) {
    console.error('Error fetching evaluation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価データの取得に失敗しました'
    }
  }
}

export async function createEvaluation(input: EvaluationInput): Promise<ApiResponse<Evaluation>> {
  try {
    const evaluationData = {
      student_id: input.studentId,
      instructor_id: input.instructorId,
      scores: input.scores,
      comments: input.comments,
      general_comments: input.generalComments,
      sent_to_n8n: false,
    }

    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluationData)
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '評価を保存しました'
    }
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価の保存に失敗しました'
    }
  }
}

export async function updateEvaluation(
  id: string, 
  updates: Partial<EvaluationInput>
): Promise<ApiResponse<Evaluation>> {
  try {
    const updateData: any = {}
    
    if (updates.scores) updateData.scores = updates.scores
    if (updates.comments) updateData.comments = updates.comments
    if (updates.generalComments !== undefined) updateData.general_comments = updates.generalComments

    const { data, error } = await supabase
      .from('evaluations')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '評価を更新しました'
    }
  } catch (error) {
    console.error('Error updating evaluation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価の更新に失敗しました'
    }
  }
}

export async function deleteEvaluation(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return {
      success: true,
      message: '評価を削除しました'
    }
  } catch (error) {
    console.error('Error deleting evaluation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価の削除に失敗しました'
    }
  }
}

export async function getEvaluationSummary(
  studentId?: string,
  instructorId?: string
): Promise<ApiResponse<EvaluationSummary>> {
  try {
    let query = supabase
      .from('evaluations')
      .select('scores, created_at')

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (instructorId) {
      query = query.eq('instructor_id', instructorId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        data: {
          totalEvaluations: 0,
          averageScores: { pitch: 0, rhythm: 0, expression: 0, technique: 0 }
        },
        message: '評価サマリーを取得しました'
      }
    }

    const totalEvaluations = data.length
    const averageScores = data.reduce(
      (acc, evaluation) => {
        const scores = evaluation.scores as EvaluationScore
        return {
          pitch: acc.pitch + scores.pitch,
          rhythm: acc.rhythm + scores.rhythm,
          expression: acc.expression + scores.expression,
          technique: acc.technique + scores.technique,
        }
      },
      { pitch: 0, rhythm: 0, expression: 0, technique: 0 }
    )

    Object.keys(averageScores).forEach((key) => {
      averageScores[key as keyof EvaluationScore] = 
        averageScores[key as keyof EvaluationScore] / totalEvaluations
    })

    const lastEvaluationDate = data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]?.created_at

    const summary: EvaluationSummary = {
      totalEvaluations,
      averageScores,
      lastEvaluationDate
    }

    return {
      success: true,
      data: summary,
      message: '評価サマリーを取得しました'
    }
  } catch (error) {
    console.error('Error fetching evaluation summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価サマリーの取得に失敗しました'
    }
  }
}

export async function markEvaluationAsSent(id: string): Promise<ApiResponse<Evaluation>> {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .update({
        sent_to_n8n: true,
        sent_to_n8n_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      message: '評価を送信済みにマークしました'
    }
  } catch (error) {
    console.error('Error marking evaluation as sent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '送信状態の更新に失敗しました'
    }
  }
}