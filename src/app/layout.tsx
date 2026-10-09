import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/lib/providers'
import { Banners, ConsentBanner } from '@/components/layout/Banners'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'StellarRail — XLM Payments Dashboard',
  description:
    'Production-ready XLM payment operations: operators, approvers, admins. Testnet + Mainnet.',
  openGraph: {
    title: 'StellarRail',
    description: 'XLM-only payment rail dashboard',
    type: 'website'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable} font-sans`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <Banners />
          {children}
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
