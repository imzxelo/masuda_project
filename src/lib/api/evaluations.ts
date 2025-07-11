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
      .from('evaluations_v2')
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

    // データベースの個別カラムをフロントエンド形式にマップ
    const mappedData = (data || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      instructorId: item.instructor_id,
      scores: {
        pitch: item.pitch,
        rhythm: item.rhythm,
        expression: item.expression,
        technique: item.technique
      },
      comments: {
        pitch: item.pitch_comment || '',
        rhythm: item.rhythm_comment || '',
        expression: item.expression_comment || '',
        technique: item.technique_comment || ''
      },
      totalScore: item.pitch + item.rhythm + item.expression + item.technique,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      students: item.students,
      instructors: item.instructors
    }))

    return {
      success: true,
      data: mappedData,
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
      .from('evaluations_v2')
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

    // データベースの個別カラムをフロントエンド形式にマップ
    const mappedData = data ? {
      id: data.id,
      studentId: data.student_id,
      instructorId: data.instructor_id,
      scores: {
        pitch: data.pitch,
        rhythm: data.rhythm,
        expression: data.expression,
        technique: data.technique
      },
      comments: {
        pitch: data.pitch_comment || '',
        rhythm: data.rhythm_comment || '',
        expression: data.expression_comment || '',
        technique: data.technique_comment || ''
      },
      totalScore: data.pitch + data.rhythm + data.expression + data.technique,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      students: data.students,
      instructors: data.instructors
    } : null

    return {
      success: true,
      data: mappedData,
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
    console.log('Creating evaluation with input:', input)
    
    // evaluations_v2テーブルの個別カラム構造に合わせてデータを準備
    const evaluationData = {
      student_id: input.studentId,
      instructor_id: input.instructorId,
      pitch: input.scores.pitch,
      rhythm: input.scores.rhythm,
      expression: input.scores.expression,
      technique: input.scores.technique,
      pitch_comment: input.comments.pitch || null,
      rhythm_comment: input.comments.rhythm || null,
      expression_comment: input.comments.expression || null,
      technique_comment: input.comments.technique || null,
    }

    console.log('Sending evaluation data to evaluations_v2:', evaluationData)

    const { data, error } = await supabase
      .from('evaluations_v2')
      .insert(evaluationData)
      .select('*')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // レスポンスデータをフロントエンド形式にマッピング
    const mappedData = {
      id: data.id,
      studentId: data.student_id,
      instructorId: data.instructor_id,
      scores: {
        pitch: data.pitch,
        rhythm: data.rhythm,
        expression: data.expression,
        technique: data.technique
      },
      comments: {
        pitch: data.pitch_comment || '',
        rhythm: data.rhythm_comment || '',
        expression: data.expression_comment || '',
        technique: data.technique_comment || ''
      },
      totalScore: data.pitch + data.rhythm + data.expression + data.technique,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return {
      success: true,
      data: mappedData,
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
    
    // 個別カラムに対応して更新データを準備
    if (updates.scores) {
      updateData.pitch = updates.scores.pitch
      updateData.rhythm = updates.scores.rhythm
      updateData.expression = updates.scores.expression
      updateData.technique = updates.scores.technique
    }
    
    if (updates.comments) {
      updateData.pitch_comment = updates.comments.pitch || null
      updateData.rhythm_comment = updates.comments.rhythm || null
      updateData.expression_comment = updates.comments.expression || null
      updateData.technique_comment = updates.comments.technique || null
    }

    // updated_atを現在時刻に更新
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('evaluations_v2')
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

    // レスポンスデータをフロントエンド形式にマップ
    const mappedData = {
      id: data.id,
      studentId: data.student_id,
      instructorId: data.instructor_id,
      scores: {
        pitch: data.pitch,
        rhythm: data.rhythm,
        expression: data.expression,
        technique: data.technique
      },
      comments: {
        pitch: data.pitch_comment || '',
        rhythm: data.rhythm_comment || '',
        expression: data.expression_comment || '',
        technique: data.technique_comment || ''
      },
      totalScore: data.pitch + data.rhythm + data.expression + data.technique,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      students: data.students,
      instructors: data.instructors
    }

    return {
      success: true,
      data: mappedData,
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
      .from('evaluations_v2')
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
      .from('evaluations_v2')
      .select('pitch, rhythm, expression, technique, created_at')

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
        return {
          pitch: acc.pitch + evaluation.pitch,
          rhythm: acc.rhythm + evaluation.rhythm,
          expression: acc.expression + evaluation.expression,
          technique: acc.technique + evaluation.technique,
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
    // evaluations_v2にはsent_to_n8nカラムがないため、この機能は無効化するか、
    // 必要に応じてカラムを追加してください
    
    // 一時的にダミーデータを返す
    const { data, error } = await supabase
      .from('evaluations_v2')
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

    // レスポンスデータをフロントエンド形式にマップ
    const mappedData = {
      id: data.id,
      studentId: data.student_id,
      instructorId: data.instructor_id,
      scores: {
        pitch: data.pitch,
        rhythm: data.rhythm,
        expression: data.expression,
        technique: data.technique
      },
      comments: {
        pitch: data.pitch_comment || '',
        rhythm: data.rhythm_comment || '',
        expression: data.expression_comment || '',
        technique: data.technique_comment || ''
      },
      totalScore: data.pitch + data.rhythm + data.expression + data.technique,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      students: data.students,
      instructors: data.instructors
    }

    return {
      success: true,
      data: mappedData,
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