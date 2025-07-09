'use client'

import ConnectionTest from '@/components/ConnectionTest'
import { ToastProvider } from '@/components/ui/ToastProvider'
import Link from 'next/link'
import { Button } from '@/components/ui'

export default function TestPage() {
  return (
    <ToastProvider>
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">システム接続テスト</h1>
              <p className="text-gray-600 mb-6">
                Supabaseデータベースとn8n Webhookの接続状態を確認します
              </p>
              <Link href="/">
                <Button variant="outline">
                  ← メインページに戻る
                </Button>
              </Link>
            </div>

            <ConnectionTest />

            <div className="mt-8 text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">設定確認</h3>
                <div className="space-y-2 text-sm text-left">
                  <div>
                    <strong>環境変数チェック:</strong>
                  </div>
                  <div className="ml-4 space-y-1 font-mono text-xs">
                    <div>
                      NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ 設定済み' : '✗ 未設定'}
                    </div>
                    <div>
                      NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ 設定済み' : '✗ 未設定'}
                    </div>
                    <div>
                      NEXT_PUBLIC_N8N_WEBHOOK_URL: {process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? '✓ 設定済み' : '✗ 未設定'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ToastProvider>
  )
}