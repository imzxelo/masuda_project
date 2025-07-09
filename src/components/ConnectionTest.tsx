'use client'

import { useState } from 'react'
import { Button, Card, LoadingSpinner } from '@/components/ui'
import { supabase } from '@/lib/supabase/client'
import { testWebhookConnection, getWebhookStatus } from '@/lib/api/webhook'

interface ConnectionStatus {
  supabase: 'success' | 'error' | 'testing' | 'idle'
  webhook: 'success' | 'error' | 'testing' | 'idle'
}

export default function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: 'idle',
    webhook: 'idle'
  })
  const [results, setResults] = useState<{
    supabase?: string
    webhook?: string
  }>({})

  const testSupabaseConnection = async () => {
    setStatus(prev => ({ ...prev, supabase: 'testing' }))
    
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      setStatus(prev => ({ ...prev, supabase: 'success' }))
      setResults(prev => ({ 
        ...prev, 
        supabase: 'Supabase接続成功！講師テーブルにアクセスできました。' 
      }))
    } catch (error) {
      setStatus(prev => ({ ...prev, supabase: 'error' }))
      setResults(prev => ({ 
        ...prev, 
        supabase: `Supabase接続エラー: ${error instanceof Error ? error.message : '不明なエラー'}` 
      }))
    }
  }

  const testWebhookConn = async () => {
    setStatus(prev => ({ ...prev, webhook: 'testing' }))
    
    try {
      const webhookStatus = await getWebhookStatus()
      
      if (!webhookStatus.configured) {
        setStatus(prev => ({ ...prev, webhook: 'error' }))
        setResults(prev => ({ 
          ...prev, 
          webhook: 'Webhook URLが設定されていません。環境変数 NEXT_PUBLIC_N8N_WEBHOOK_URL を確認してください。' 
        }))
        return
      }

      const result = await testWebhookConnection()
      
      if (result.success) {
        setStatus(prev => ({ ...prev, webhook: 'success' }))
        setResults(prev => ({ 
          ...prev, 
          webhook: `Webhook接続成功！応答時間: ${result.data?.responseTime}ms` 
        }))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, webhook: 'error' }))
      setResults(prev => ({ 
        ...prev, 
        webhook: `Webhook接続エラー: ${error instanceof Error ? error.message : '不明なエラー'}` 
      }))
    }
  }

  const testAllConnections = async () => {
    await testSupabaseConnection()
    await testWebhookConn()
  }

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'success':
        return <span className="text-green-500">✓</span>
      case 'error':
        return <span className="text-red-500">✗</span>
      case 'testing':
        return <LoadingSpinner size="sm" />
      default:
        return <span className="text-gray-400">○</span>
    }
  }

  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'testing':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">接続テスト</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status.supabase)}
            <span className="font-medium">Supabase データベース</span>
          </div>
          <Button
            size="sm"
            onClick={testSupabaseConnection}
            disabled={status.supabase === 'testing'}
          >
            テスト
          </Button>
        </div>
        
        {results.supabase && (
          <div className={`text-sm p-2 rounded ${getStatusColor(status.supabase)}`}>
            {results.supabase}
          </div>
        )}

        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status.webhook)}
            <span className="font-medium">n8n Webhook</span>
          </div>
          <Button
            size="sm"
            onClick={testWebhookConn}
            disabled={status.webhook === 'testing'}
          >
            テスト
          </Button>
        </div>
        
        {results.webhook && (
          <div className={`text-sm p-2 rounded ${getStatusColor(status.webhook)}`}>
            {results.webhook}
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={testAllConnections}
            disabled={status.supabase === 'testing' || status.webhook === 'testing'}
            className="w-full"
          >
            すべてテスト
          </Button>
        </div>
      </div>
    </Card>
  )
}