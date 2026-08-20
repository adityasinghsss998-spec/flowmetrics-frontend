import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import LenisProvider from '@/components/layout/LenisProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FlowMetrics — Developer Analytics Platform',
  description:
    'Real-time DORA metrics, cycle time analysis, and contributor insights for engineering teams.',
  keywords: ['DORA metrics', 'developer analytics', 'engineering metrics', 'GitHub analytics'],
  openGraph: {
    title: 'FlowMetrics — Developer Analytics Platform',
    description: 'Real-time DORA metrics and contributor insights.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <LenisProvider>{children}</LenisProvider>
        </Providers>
      </body>
    </html>
  )
}
