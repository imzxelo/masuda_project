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

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK RECEIVED FROM N8N ===')
    
    const body = await request.json()
    console.log('N8N webhook payload:', JSON.stringify(body, null, 2))
    
    const { videoRecordId, status } = body
    
    if (!videoRecordId) {
      console.error('Missing videoRecordId in webhook payload')
      return NextResponse.json({ error: 'videoRecordId is required' }, { status: 400 })
    }
    
    if (!status) {
      console.error('Missing status in webhook payload')
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }
    
    console.log(`Processing webhook for videoRecordId: ${videoRecordId}, status: ${status}`)
    
    // videoRecordIdでprocessing状態のレポートを検索
    const { data: processingReport, error: findError } = await supabaseService
      .from('report_generations')
      .select('id, status, created_at')
      .eq('video_record_id', videoRecordId)
      .eq('status', 'processing')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (findError || !processingReport) {
      console.error('Could not find processing report for videoRecordId:', videoRecordId, findError)
      return NextResponse.json({ 
        error: 'No processing report found for videoRecordId',
        videoRecordId 
      }, { status: 404 })
    }
    
    console.log('Found processing report:', processingReport.id)
    
    if (status === 'completed') {
      // PDF URLをSupabaseから取得（n8nが生成したファイルパスで）
      const expectedPdfPath = `evaluation-reports/${videoRecordId}_report.pdf`
      const pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${expectedPdfPath}`
      
      console.log('Setting PDF URL to:', pdfUrl)
      
      // レポートを完了状態に更新
      const { data: updatedReport, error: updateError } = await supabaseService
        .from('report_generations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          pdf_url: pdfUrl,
          pdf_file_name: `${videoRecordId}_report.pdf`
        })
        .eq('id', processingReport.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating report to completed:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update report status',
          details: updateError.message 
        }, { status: 500 })
      }
      
      console.log('Report successfully updated to completed:', updatedReport)
      
      return NextResponse.json({
        success: true,
        message: 'Report marked as completed',
        reportId: processingReport.id,
        pdfUrl
      })
      
    } else if (status === 'failed') {
      // レポートを失敗状態に更新
      const { data: updatedReport, error: updateError } = await supabaseService
        .from('report_generations')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: body.errorMessage || 'PDF generation failed'
        })
        .eq('id', processingReport.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating report to failed:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update report status',
          details: updateError.message 
        }, { status: 500 })
      }
      
      console.log('Report successfully updated to failed:', updatedReport)
      
      return NextResponse.json({
        success: true,
        message: 'Report marked as failed',
        reportId: processingReport.id
      })
    } else {
      return NextResponse.json({ 
        error: 'Invalid status value',
        validStatuses: ['completed', 'failed']
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in webhook handler:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}