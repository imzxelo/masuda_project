import type { Metadata } from 'next'
import AuthWrapper from '@/components/AuthWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'Singer\'s Challenge',
  description: 'ボーカルスクール向けの採点・フィードバックシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  )
}