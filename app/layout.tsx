import type { Metadata } from 'next'
import { Fraunces, Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClarkyChat } from '@/components/clarky-chat'
import { MobileApplyBar } from '@/components/mobile-apply-bar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  axes: ['opsz'],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const SITE_URL = 'https://baytobaylending.com'
const OG_IMAGE_URL =
  'https://toivhpeabwwqilbzbrfb.supabase.co/storage/v1/object/public/Website%20Photos/BaytoBay-bridge.png'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bay to Bay Lending | Tampa Mortgage Lender',
    template: '%s | Bay to Bay Lending',
  },
  description:
    'Bay to Bay Lending is your trusted Tampa, Florida mortgage lender. Whether you are buying your first home, refinancing, or tapping equity, we make the loan process simple and stress-free.',
  keywords: ['mortgage', 'home loan', 'Tampa', 'Florida', 'refinance', 'HELOC', 'first-time homebuyer'],
  authors: [{ name: 'Bay to Bay Lending' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Bay to Bay Lending',
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Bay to Bay Lending',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bay to Bay Lending | Tampa Mortgage Lender',
    description:
      'Your trusted Tampa, Florida mortgage lender. Buying, refinancing, or tapping equity made simple.',
    images: [OG_IMAGE_URL],
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
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <ClarkyChat />
        <MobileApplyBar phone="(813) 251-2700" />
      </body>
    </html>
  )
}
