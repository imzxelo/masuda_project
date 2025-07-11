import { supabase } from '@/lib/supabase/client'
import { VideoRecord, VideoRecordInput, VideoRecordWithStats, VideoRecordListItem } from '@/types/video-record'
import { ApiResponse } from '@/types/api'

export async function getVideoRecords(studentId?: string): Promise<ApiResponse<VideoRecord[]>> {
  try {
    let query = supabase
      .from('video_records')
      .select('*')
      .order('recorded_at', { ascending: false })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = (data || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      songId: item.song_id,
      songTitle: item.song_title,
      recordedAt: item.recorded_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return {
      success: true,
      data: mappedData,
      message: '動画レコード一覧を取得しました'
    }
  } catch (error) {
    console.error('Error fetching video records:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '動画レコード一覧の取得に失敗しました'
    }
  }
}

export async function getVideoRecordById(id: string): Promise<ApiResponse<VideoRecord | null>> {
  try {
    const { data, error } = await supabase
      .from('video_records')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = {
      id: data.id,
      studentId: data.student_id,
      songId: data.song_id,
      songTitle: data.song_title,
      recordedAt: data.recorded_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return {
      success: true,
      data: mappedData,
      message: '動画レコードを取得しました'
    }
  } catch (error) {
    console.error('Error fetching video record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '動画レコードの取得に失敗しました'
    }
  }
}

export async function getVideoRecordWithStats(id: string): Promise<ApiResponse<VideoRecordWithStats | null>> {
  try {
    // 基本情報を取得
    const recordResponse = await getVideoRecordById(id)
    if (!recordResponse.success || !recordResponse.data) {
      return recordResponse as ApiResponse<VideoRecordWithStats | null>
    }

    // 評価統計を取得
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations_v2')
      .select('pitch, rhythm, expression, technique, created_at')
      .eq('video_record_id', id)

    if (evalError) {
      throw evalError
    }

    const record = recordResponse.data
    let stats: VideoRecordWithStats['stats'] = undefined

    if (evaluations && evaluations.length > 0) {
      const totalEvaluations = evaluations.length
      const totalScore = evaluations.reduce((sum, evaluation) => {
        return sum + evaluation.pitch + evaluation.rhythm + evaluation.expression + evaluation.technique
      }, 0)
      const averageScore = totalScore / totalEvaluations

      const lastEvaluationDate = evaluations.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]?.created_at

      stats = {
        totalEvaluations,
        averageScore,
        lastEvaluationDate
      }
    }

    const recordWithStats: VideoRecordWithStats = {
      ...record,
      stats
    }

    return {
      success: true,
      data: recordWithStats,
      message: '動画レコードと統計を取得しました'
    }
  } catch (error) {
    console.error('Error fetching video record with stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '動画レコードの取得に失敗しました'
    }
  }
}

export async function getVideoRecordsByStudent(studentId: string): Promise<ApiResponse<VideoRecordListItem[]>> {
  try {
    const { data, error } = await supabase
      .from('video_records')
      .select(`
        *,
        evaluations_v2(pitch, rhythm, expression, technique)
      `)
      .eq('student_id', studentId)
      .order('recorded_at', { ascending: false })

    if (error) {
      throw error
    }

    // 統計情報を含むリストアイテムを生成
    const mappedData = (data || []).map(item => {
      const evaluations = item.evaluations_v2 || []
      const evaluationCount = evaluations.length
      
      let averageScore: number | undefined = undefined
      if (evaluationCount > 0) {
        const totalScore = evaluations.reduce((sum: number, evaluation: any) => {
          return sum + evaluation.pitch + evaluation.rhythm + evaluation.expression + evaluation.technique
        }, 0)
        averageScore = totalScore / evaluationCount
      }

      return {
        id: item.id,
        songId: item.song_id,
        songTitle: item.song_title,
        recordedAt: item.recorded_at,
        evaluationCount,
        averageScore
      }
    })

    return {
      success: true,
      data: mappedData,
      message: '生徒の動画レコード一覧を取得しました'
    }
  } catch (error) {
    console.error('Error fetching video records by student:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒の動画レコード一覧の取得に失敗しました'
    }
  }
}

export async function createVideoRecord(videoRecord: VideoRecordInput): Promise<ApiResponse<VideoRecord>> {
  try {
    const { data, error } = await supabase
      .from('video_records')
      .insert({
        student_id: videoRecord.studentId,
        song_id: videoRecord.songId,
        song_title: videoRecord.songTitle,
        recorded_at: videoRecord.recordedAt
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = {
      id: data.id,
      studentId: data.student_id,
      songId: data.song_id,
      songTitle: data.song_title,
      recordedAt: data.recorded_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return {
      success: true,
      data: mappedData,
      message: '動画レコードを作成しました'
    }
  } catch (error) {
    console.error('Error creating video record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '動画レコードの作成に失敗しました'
    }
  }
}

export async function updateVideoRecord(
  id: string,
  updates: Partial<Omit<VideoRecordInput, 'studentId'>>
): Promise<ApiResponse<VideoRecord>> {
  try {
    const updateData: any = {}
    
    if (updates.songId !== undefined) updateData.song_id = updates.songId
    if (updates.songTitle !== undefined) updateData.song_title = updates.songTitle
    if (updates.recordedAt !== undefined) updateData.recorded_at = updates.recordedAt

    const { data, error } = await supabase
      .from('video_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = {
      id: data.id,
      studentId: data.student_id,
      songId: data.song_id,
      songTitle: data.song_title,
      recordedAt: data.recorded_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return {
      success: true,
      data: mappedData,
      message: '動画レコードを更新しました'
    }
  } catch (error) {
    console.error('Error updating video record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '動画レコードの更新に失敗しました'
    }
  }
}

export async function deleteVideoRecord(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('video_records')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return {
      success: true,
      message: '動画レコードを削除しました'
    }
  } catch (error) {
    console.error('Error deleting video record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '動画レコードの削除に失敗しました'
    }
  }
}

export async function searchVideoRecords(
  query: string,
  studentId?: string
): Promise<ApiResponse<VideoRecord[]>> {
  try {
    let supabaseQuery = supabase
      .from('video_records')
      .select('*')
      .or(`song_id.ilike.%${query}%,song_title.ilike.%${query}%`)
      .order('recorded_at', { ascending: false })

    if (studentId) {
      supabaseQuery = supabaseQuery.eq('student_id', studentId)
    }

    const { data, error } = await supabaseQuery

    if (error) {
      throw error
    }

    // データベースのsnake_caseをcamelCaseにマップ
    const mappedData = (data || []).map(item => ({
      id: item.id,
      studentId: item.student_id,
      songId: item.song_id,
      songTitle: item.song_title,
      recordedAt: item.recorded_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return {
      success: true,
      data: mappedData,
      message: '動画レコード検索結果を取得しました'
    }
  } catch (error) {
    console.error('Error searching video records:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '動画レコード検索に失敗しました'
    }
  }
}