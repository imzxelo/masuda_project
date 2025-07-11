import { supabase } from '@/lib/supabase/client'
import { 
  Evaluation, 
  EvaluationInput, 
  EvaluationFilters, 
  EvaluationSummary,
  EvaluationScore,
  EvaluationComments,
  EvaluationHistory,
  EvaluationStats
} from '@/types/evaluation'
import { ApiResponse } from '@/types/api'

export async function getEvaluations(filters?: EvaluationFilters): Promise<ApiResponse<Evaluation[]>> {
  try {
    let query = supabase
      .from('evaluations_v2')
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email),
        video_records:video_record_id (id, song_id, song_title, recorded_at)
      `)
      .order('created_at', { ascending: false })

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    if (filters?.instructorId) {
      query = query.eq('instructor_id', filters.instructorId)
    }

    if (filters?.videoRecordId) {
      query = query.eq('video_record_id', filters.videoRecordId)
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
      videoRecordId: item.video_record_id,
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
      sentToN8n: item.sent_to_n8n || false,
      sentToN8nAt: item.sent_to_n8n_at || undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      students: item.students,
      instructors: item.instructors,
      videoRecords: item.video_records
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
        instructors:instructor_id (id, name, email),
        video_records:video_record_id (id, song_id, song_title, recorded_at)
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
      videoRecordId: data.video_record_id,
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
      sentToN8n: data.sent_to_n8n || false,
      sentToN8nAt: data.sent_to_n8n_at || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      students: data.students,
      instructors: data.instructors,
      videoRecords: data.video_records
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
      // video_record_id: input.videoRecordId,
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
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email),
        video_records:video_record_id (id, song_id, song_title, recorded_at)
      `)
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
      videoRecordId: data.video_record_id,
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
      sentToN8n: data.sent_to_n8n || false,
      sentToN8nAt: data.sent_to_n8n_at || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      students: data.students,
      instructors: data.instructors,
      videoRecords: data.video_records
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
        instructors:instructor_id (id, name, email),
        video_records:video_record_id (id, song_id, song_title, recorded_at)
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
      videoRecordId: data.video_record_id,
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
      sentToN8n: data.sent_to_n8n || false,
      sentToN8nAt: data.sent_to_n8n_at || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      students: data.students,
      instructors: data.instructors,
      videoRecords: data.video_records
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
    // sent_to_n8nフラグをtrueに設定し、送信日時を記録
    const { data, error } = await supabase
      .from('evaluations_v2')
      .update({
        sent_to_n8n: true,
        sent_to_n8n_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        students:student_id (id, name, email),
        instructors:instructor_id (id, name, email),
        video_records:video_record_id (id, song_id, song_title, recorded_at)
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
      videoRecordId: data.video_record_id,
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
      sentToN8n: data.sent_to_n8n || false,
      sentToN8nAt: data.sent_to_n8n_at || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      students: data.students,
      instructors: data.instructors,
      videoRecords: data.video_records
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

export async function getEvaluationHistory(filters?: EvaluationFilters): Promise<ApiResponse<EvaluationHistory[]>> {
  try {
    let query = supabase
      .from('evaluations_v2')
      .select(`
        id,
        pitch,
        rhythm,
        expression,
        technique,
        pitch_comment,
        rhythm_comment,
        expression_comment,
        technique_comment,
        created_at,
        students:student_id (id, name),
        instructors:instructor_id (id, name),
        video_records:video_record_id (id, song_id, song_title, recorded_at)
      `)
      .order('created_at', { ascending: false })

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    if (filters?.instructorId) {
      query = query.eq('instructor_id', filters.instructorId)
    }

    if (filters?.videoRecordId) {
      query = query.eq('video_record_id', filters.videoRecordId)
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

    // データを EvaluationHistory 形式にマップ
    const mappedData = (data || []).map(item => ({
      id: item.id,
      studentName: item.students?.name || 'Unknown',
      instructorName: item.instructors?.name || 'Unknown',
      songTitle: item.video_records?.song_title || 'Unknown',
      recordedAt: item.video_records?.recorded_at || '',
      evaluatedAt: item.created_at,
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
      totalScore: item.pitch + item.rhythm + item.expression + item.technique
    }))

    return {
      success: true,
      data: mappedData,
      message: '評価履歴を取得しました'
    }
  } catch (error) {
    console.error('Error fetching evaluation history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価履歴の取得に失敗しました'
    }
  }
}

export async function getEvaluationStats(filters?: EvaluationFilters): Promise<ApiResponse<EvaluationStats>> {
  try {
    let query = supabase
      .from('evaluations_v2')
      .select(`
        pitch,
        rhythm,
        expression,
        technique,
        created_at,
        video_records:video_record_id (song_title)
      `)

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

    if (!data || data.length === 0) {
      return {
        success: true,
        data: {
          totalEvaluations: 0,
          averageScore: 0,
          averageScoresByCategory: { pitch: 0, rhythm: 0, expression: 0, technique: 0 },
          evaluationsByDate: [],
          topPerformingSongs: []
        },
        message: '評価統計を取得しました'
      }
    }

    // 基本統計の計算
    const totalEvaluations = data.length
    const totalScore = data.reduce((sum, item) => 
      sum + item.pitch + item.rhythm + item.expression + item.technique, 0
    )
    const averageScore = totalScore / totalEvaluations

    // カテゴリ別平均スコアの計算
    const categoryTotals = data.reduce((acc, item) => ({
      pitch: acc.pitch + item.pitch,
      rhythm: acc.rhythm + item.rhythm,
      expression: acc.expression + item.expression,
      technique: acc.technique + item.technique
    }), { pitch: 0, rhythm: 0, expression: 0, technique: 0 })

    const averageScoresByCategory = {
      pitch: categoryTotals.pitch / totalEvaluations,
      rhythm: categoryTotals.rhythm / totalEvaluations,
      expression: categoryTotals.expression / totalEvaluations,
      technique: categoryTotals.technique / totalEvaluations
    }

    // 日付別評価数の計算
    const evaluationsByDate = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      const existing = acc.find(e => e.date === date)
      const totalScore = item.pitch + item.rhythm + item.expression + item.technique
      
      if (existing) {
        existing.count += 1
        existing.averageScore = (existing.averageScore * (existing.count - 1) + totalScore) / existing.count
      } else {
        acc.push({
          date,
          count: 1,
          averageScore: totalScore
        })
      }
      return acc
    }, [] as Array<{ date: string; count: number; averageScore: number }>)

    // 楽曲別パフォーマンスの計算
    const songPerformance = data.reduce((acc, item) => {
      const songTitle = item.video_records?.song_title || 'Unknown'
      const totalScore = item.pitch + item.rhythm + item.expression + item.technique
      
      if (acc[songTitle]) {
        acc[songTitle].count += 1
        acc[songTitle].totalScore += totalScore
      } else {
        acc[songTitle] = {
          count: 1,
          totalScore: totalScore
        }
      }
      return acc
    }, {} as Record<string, { count: number; totalScore: number }>)

    const topPerformingSongs = Object.entries(songPerformance)
      .map(([songTitle, data]) => ({
        songTitle,
        count: data.count,
        averageScore: data.totalScore / data.count
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5)

    return {
      success: true,
      data: {
        totalEvaluations,
        averageScore,
        averageScoresByCategory,
        evaluationsByDate: evaluationsByDate.sort((a, b) => a.date.localeCompare(b.date)),
        topPerformingSongs
      },
      message: '評価統計を取得しました'
    }
  } catch (error) {
    console.error('Error fetching evaluation stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '評価統計の取得に失敗しました'
    }
  }
}