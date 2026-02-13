import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/context/Providers'

export const metadata: Metadata = {
  title: 'DeFi Marketplace - P2P Crypto Trading',
  description: 'Decentralized peer-to-peer marketplace for crypto trading with secure escrow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
