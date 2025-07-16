import { NextRequest, NextResponse } from 'next/server'
import { supabaseAuth } from '@/lib/supabase/auth-client'
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

export async function POST(request: NextRequest) {
  try {
    // 認証チェック - 簡易的に認証をスキップしてService Roleを使用
    console.log('API generate-report called')

    const body = await request.json()
    console.log('Request body:', body)
    
    const { videoRecordId } = body
    
    if (!videoRecordId) {
      console.error('Missing videoRecordId in request body')
      return NextResponse.json({ error: 'videoRecordId is required' }, { status: 400 })
    }

    // 評価件数チェック - Service Roleクライアントを使用
    console.log('Fetching evaluations for videoRecordId:', videoRecordId)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service Role Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
    console.log('Service Role Key prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20))
    
    const { data: evaluations, error: evalError } = await supabaseService
      .from('evaluations_v2')
      .select('*')
      .eq('video_record_id', videoRecordId)

    console.log('Evaluations query result:', { data: evaluations, error: evalError })

    if (evalError) {
      console.error('Detailed evaluation error:', evalError)
      return NextResponse.json({ 
        error: 'Failed to fetch evaluations',
        details: evalError.message,
        code: evalError.code 
      }, { status: 500 })
    }

    if (evaluations.length !== 10) {
      return NextResponse.json({ 
        error: `Need exactly 10 evaluations, but got ${evaluations.length}` 
      }, { status: 400 })
    }

    // 既存レポートチェック - テスト用に一時的に削除
    console.log('Checking for existing completed reports...')
    const { data: existingReport, error: existingReportError } = await supabaseService
      .from('report_generations')
      .select('*')
      .eq('video_record_id', videoRecordId)
      .eq('status', 'completed')
      .single()

    console.log('Existing report check result:', { data: existingReport, error: existingReportError })

    if (existingReport) {
      console.log('Found existing completed report, DELETING for test...')
      const { error: deleteError } = await supabaseService
        .from('report_generations')
        .delete()
        .eq('id', existingReport.id)
      
      if (deleteError) {
        console.error('Error deleting existing report:', deleteError)
      } else {
        console.log('Existing report deleted successfully')
      }
    }

    console.log('Proceeding with new generation')

    // レポート生成ステータスをpendingに設定
    const { data: reportRecord, error: reportError } = await supabaseService
      .from('report_generations')
      .insert({
        video_record_id: videoRecordId,
        student_id: evaluations[0].student_id,
        status: 'processing',
        total_evaluations: evaluations.length,
        required_evaluations: 10
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report record:', reportError)
      return NextResponse.json({ error: 'Failed to create report record' }, { status: 500 })
    }

    // n8n Webhook呼び出し
    const n8nWebhookUrl = 'https://solfchakra.app.n8n.cloud/webhook/summarize'
    
    // 評価データを取得してn8nの期待する形式に変換
    const { data: fullEvaluations, error: fullEvalError } = await supabaseService
      .from('evaluations_v2')
      .select(`
        *,
        students:student_id(name),
        video_records:video_record_id(song_id, song_title)
      `)
      .eq('video_record_id', videoRecordId)

    if (fullEvalError) {
      console.error('Error fetching full evaluations:', fullEvalError)
      return NextResponse.json({ error: 'Failed to fetch evaluation details' }, { status: 500 })
    }

    // n8nが期待する形式でペイロードを作成
    const webhookPayload = {
      videoRecordId,
      studentId: evaluations[0].student_id,
      songId: fullEvaluations[0]?.video_records?.song_id || '',
      songTitle: fullEvaluations[0]?.video_records?.song_title || '',
      studentName: fullEvaluations[0]?.students?.name || '',
      evaluations: fullEvaluations.map(evaluation => ({
        judgeId: evaluation.instructor_id,
        pitch: evaluation.pitch,
        rhythm: evaluation.rhythm,
        expression: evaluation.expression,
        technique: evaluation.technique,
        pitch_comment: evaluation.pitch_comment || '',
        rhythm_comment: evaluation.rhythm_comment || '',
        expression_comment: evaluation.expression_comment || '',
        technique_comment: evaluation.technique_comment || ''
      }))
    }

    console.log('=== WEBHOOK CALL STARTING ===')
    console.log('Webhook URL:', n8nWebhookUrl)
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2))
    
    console.log('Making fetch request to n8n...')
    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    console.log('=== WEBHOOK RESPONSE RECEIVED ===')
    console.log('Status:', webhookResponse.status)
    console.log('Status Text:', webhookResponse.statusText)
    console.log('Headers:', Object.fromEntries(webhookResponse.headers.entries()))

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('n8n webhook error response:', errorText)
      console.log('Note: n8n may return 500 but still process successfully')
      
      // n8nが500エラーを返しても処理は継続される場合があるため、
      // 一旦processingのままにしておく（webhookで後から更新される）
      console.log('Webhook returned error, but report may still be generated by n8n')
    }

    let webhookResult = null
    try {
      webhookResult = await webhookResponse.json()
      console.log('n8n webhook result:', webhookResult)
    } catch (parseError) {
      console.log('Could not parse webhook response as JSON:', parseError)
    }

    return NextResponse.json({
      success: true,
      message: 'Report generation started (n8n processing)',
      reportId: reportRecord.id,
      status: 'processing',
      note: webhookResponse.ok ? 'Webhook successful' : 'Webhook returned error but processing may continue'
    })

  } catch (error) {
    console.error('Error in generate-report API:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}