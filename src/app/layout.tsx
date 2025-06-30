import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Singer's Challenge",
  description: 'ボーカルスクール向けの採点・フィードバックシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}