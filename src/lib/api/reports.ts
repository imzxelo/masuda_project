import { supabaseAuth } from '@/lib/supabase/auth-client'
import { ApiResponse } from '@/types/api'

export interface ReportGeneration {
  id: string
  video_record_id: string
  student_id: string
  song_id: string
  song_title: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_evaluations: number
  required_evaluations: number
  ai_analysis_data?: any
  pdf_url?: string
  pdf_file_name?: string
  error_message?: string
  created_at: string
  completed_at?: string
}

export interface ReportGenerationWithDetails extends ReportGeneration {
  students: {
    name: string
    email?: string
  }
  video_records: {
    song_title: string
    recorded_at: string
  }
}

/**
 * レポート生成状況を取得
 */
export async function getReportGenerations(filters?: {
  studentId?: string
  status?: string
  limit?: number
}): Promise<ApiResponse<ReportGenerationWithDetails[]>> {
  try {
    let query = supabaseAuth
      .from('report_generations')
      .select(`
        *,
        students:student_id (name, email),
        video_records:video_record_id (song_title, recorded_at)
      `)
      .order('created_at', { ascending: false })

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data as ReportGenerationWithDetails[]
    }
  } catch (error) {
    console.error('Error fetching report generations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch report generations'
    }
  }
}

/**
 * 特定のvideo_recordに対するレポート生成状況を取得
 */
export async function getReportByVideoRecord(videoRecordId: string): Promise<ApiResponse<ReportGeneration | null>> {
  try {
    const { data, error } = await supabaseAuth
      .from('report_generations')
      .select('*')
      .eq('video_record_id', videoRecordId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: null
        }
      }
      throw error
    }

    return {
      success: true,
      data: data as ReportGeneration
    }
  } catch (error) {
    console.error('Error fetching report by video record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch report'
    }
  }
}

/**
 * 評価件数を取得
 */
export async function getEvaluationCount(videoRecordId: string): Promise<ApiResponse<number>> {
  try {
    console.log('Getting evaluation count for video_record_id:', videoRecordId)
    
    // まず実際のデータを取得してデバッグ
    const { data: evaluations, error: dataError } = await supabaseAuth
      .from('evaluations_v2')
      .select('*')
      .eq('video_record_id', videoRecordId)

    if (dataError) {
      console.error('Error fetching evaluation data:', dataError)
      throw dataError
    }

    console.log('Found evaluations:', evaluations)
    console.log('Evaluation count:', evaluations?.length || 0)

    // カウントクエリも実行
    const { count, error } = await supabaseAuth
      .from('evaluations_v2')
      .select('*', { count: 'exact', head: true })
      .eq('video_record_id', videoRecordId)

    if (error) {
      console.error('Error fetching evaluation count:', error)
      throw error
    }

    console.log('Count query result:', count)

    return {
      success: true,
      data: count || 0
    }
  } catch (error) {
    console.error('Error fetching evaluation count:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch evaluation count'
    }
  }
}

/**
 * レポートステータスを更新
 */
export async function updateReportStatus(
  reportId: string,
  updates: Partial<Pick<ReportGeneration, 'status' | 'pdf_url' | 'pdf_file_name' | 'completed_at' | 'error_message'>>
): Promise<ApiResponse<ReportGeneration>> {
  try {
    const { data, error } = await supabaseAuth
      .from('report_generations')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data as ReportGeneration
    }
  } catch (error) {
    console.error('Error updating report status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update report status'
    }
  }
}