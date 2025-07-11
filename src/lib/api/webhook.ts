import { N8nWebhookPayload, N8nWebhookResponse, ApiResponse } from '@/types/api'
import { Evaluation } from '@/types/evaluation'
import { markEvaluationAsSent } from './evaluations'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL

export async function sendEvaluationToN8n(
  evaluation: Evaluation, 
  retryCount = 0
): Promise<ApiResponse<N8nWebhookResponse>> {
  if (!WEBHOOK_URL) {
    console.warn('N8N_WEBHOOK_URL is not configured')
    return {
      success: false,
      error: 'Webhook URLが設定されていません'
    }
  }

  // 開発環境でのCORSエラーを回避
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('開発環境のため、webhook送信をシミュレート:', evaluation)
    return {
      success: true,
      data: { success: true, message: 'Development mode - webhook simulated' } as N8nWebhookResponse,
      message: '開発環境でのwebhook送信をシミュレートしました'
    }
  }

  try {
    const payload: N8nWebhookPayload = {
      type: 'evaluation_completed',
      timestamp: new Date().toISOString(),
      data: {
        evaluationId: evaluation.id,
        studentId: evaluation.studentId,
        instructorId: evaluation.instructorId,
        scores: evaluation.scores,
        comments: evaluation.comments,
        generalComments: evaluation.generalComments,
        createdAt: evaluation.createdAt,
        metadata: {
          totalScore: Object.values(evaluation.scores).reduce((sum, score) => sum + score, 0),
          maxScore: 40,
          retryCount
        }
      }
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'singers-challenge-frontend/1.0'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`)
    }

    const responseData: N8nWebhookResponse = await response.json()

    // Mark evaluation as sent in database
    if (responseData.success) {
      await markEvaluationAsSent(evaluation.id)
    }

    return {
      success: true,
      data: responseData,
      message: 'レポート生成リクエストを送信しました'
    }
  } catch (error) {
    console.error('Error sending evaluation to n8n:', error)
    
    // Retry logic
    if (retryCount < 3) {
      console.log(`Retrying webhook request (attempt ${retryCount + 1})`)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
      return sendEvaluationToN8n(evaluation, retryCount + 1)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'レポート生成リクエストの送信に失敗しました'
    }
  }
}

export async function sendBatchEvaluationsToN8n(
  evaluations: Evaluation[]
): Promise<ApiResponse<{ successCount: number; failedCount: number; results: Array<{ evaluationId: string; success: boolean; error?: string }> }>> {
  const results: Array<{ evaluationId: string; success: boolean; error?: string }> = []
  let successCount = 0
  let failedCount = 0

  for (const evaluation of evaluations) {
    try {
      const result = await sendEvaluationToN8n(evaluation)
      if (result.success) {
        successCount++
        results.push({ evaluationId: evaluation.id, success: true })
      } else {
        failedCount++
        results.push({ 
          evaluationId: evaluation.id, 
          success: false, 
          error: result.error 
        })
      }
    } catch (error) {
      failedCount++
      results.push({ 
        evaluationId: evaluation.id, 
        success: false, 
        error: error instanceof Error ? error.message : '送信エラー'
      })
    }

    // Add delay between requests to avoid overwhelming the webhook
    if (evaluations.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return {
    success: successCount > 0,
    data: { successCount, failedCount, results },
    message: `${successCount}件成功、${failedCount}件失敗`
  }
}

export async function testWebhookConnection(): Promise<ApiResponse<{ status: string; responseTime: number }>> {
  if (!WEBHOOK_URL) {
    return {
      success: false,
      error: 'Webhook URLが設定されていません'
    }
  }

  try {
    const startTime = Date.now()
    
    const testPayload = {
      type: 'connection_test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Connection test from Singer\'s Challenge frontend'
      }
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'singers-challenge-frontend/1.0'
      },
      body: JSON.stringify(testPayload)
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return {
      success: true,
      data: {
        status: 'connected',
        responseTime
      },
      message: `Webhook接続成功 (${responseTime}ms)`
    }
  } catch (error) {
    console.error('Error testing webhook connection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook接続テストに失敗しました'
    }
  }
}

export async function getWebhookStatus(): Promise<{ configured: boolean; url?: string }> {
  return {
    configured: !!WEBHOOK_URL,
    url: WEBHOOK_URL ? WEBHOOK_URL.replace(/\/[^/]*$/, '/***') : undefined
  }
}