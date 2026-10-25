import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import LenisProvider from '@/components/layout/LenisProvider'

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FlowMetrics: DORA metrics for engineering teams',
  description:
    'Track deployment frequency, lead time for changes, change failure rate and time to restore service across your GitHub repositories.',
  keywords: ['DORA metrics', 'developer analytics', 'engineering metrics', 'GitHub analytics'],
  openGraph: {
    title: 'FlowMetrics: DORA metrics for engineering teams',
    description: 'Real-time DORA metrics, cycle time trends, and contributor insights from GitHub.',
    type: 'website',
    images: [
      {
        url: '/screenshot-dashboard.png',
        width: 1456,
        height: 816,
        alt: 'FlowMetrics dashboard preview',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${ibmPlexMono.variable} ${ibmPlexSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#0B0C0A] text-[#ECEEE6] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--fm-accent)] focus:text-[var(--fm-on-accent)] focus:font-mono focus:text-sm focus:rounded-[4px] focus:outline-none"
        >
          Skip to content
        </a>
        <Providers>
          <LenisProvider>
            <div id="main-content">{children}</div>
          </LenisProvider>
        </Providers>
      </body>
    </html>
  )
}
