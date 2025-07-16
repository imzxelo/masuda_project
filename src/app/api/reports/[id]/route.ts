import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service Role クライアント（サーバーサイド専用）
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証をスキップしてService Roleクライアントを使用
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    console.log('Fetching report status for ID:', id)

    // レポート詳細を取得 - Service Roleクライアントを使用
    const { data: report, error } = await supabaseService
      .from('report_generations')
      .select(`
        *,
        students:student_id (name, email),
        video_records:video_record_id (song_title, recorded_at)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching report:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }
      throw error
    }

    console.log('Report status fetched:', { id: report.id, status: report.status })
    return NextResponse.json(report)

  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}